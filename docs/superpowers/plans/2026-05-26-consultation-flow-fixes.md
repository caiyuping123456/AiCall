# Consultation Flow Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 11 issues across user/doctor/admin domains: user flow idempotency + duplicate prevention + mid-flow cleanup; doctor AI exception + status bug + report display + user report access; admin flow tracking + dashboard charts.

**Architecture:** User frontend manages intermediate state via Pinia+localStorage, submits consolidated request at payment. Backend blocks duplicates with a date-scoped DB check, sends one notification. Status 5→6 transition decoupled from LLM call (status updates synchronously, minutes generate async). Report JSON parsed into structured display. Admin gets computed timeline from existing data + chart fixes.

**Tech Stack:** Spring Boot (Java) + MyBatis, Vue 3 + Pinia + Element Plus + ECharts, LangChain4j

---

## Sub-project A: User Consultation Flow Fixes

### Task A1: Backend — Duplicate Check + Notification Adjustments

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java`
- Modify: `aicall-backend/src/main/resources/mapper/ConsultationMapper.xml`
- Modify: `aicall-backend/src/main/java/com/aicall/module/user/service/RegistrationService.java`

- [ ] **Step 1: Add duplicate check method to ConsultationMapper**

In `ConsultationMapper.java`, add:
```java
int countByPatientDoctorToday(@Param("patientId") Long patientId,
                               @Param("doctorId") Long doctorId);
```

In `ConsultationMapper.xml`, add the query:
```xml
<select id="countByPatientDoctorToday" resultType="int">
    SELECT COUNT(*)
    FROM consultation c
    JOIN consultation_doctor cd ON c.id = cd.consultation_id
    WHERE c.patient_id = #{patientId}
      AND cd.doctor_id = #{doctorId}
      AND DATE(c.create_time) = CURDATE()
      AND c.status NOT IN (7, 8)
</select>
```

- [ ] **Step 2: Update RegistrationService to check duplicates and send single notification**

In `RegistrationService.java`, modify the `register` method:

```java
@Transactional
public Long register(Long patientId, RegistrationRequest request) {
    Doctor doctor = doctorMapper.findById(request.getDoctorId());
    if (doctor == null || doctor.getStatus() != 1) {
        throw BusinessException.fail("医生不存在或已停诊");
    }

    // Duplicate check: same patient + same doctor on same day
    int existing = consultationMapper.countByPatientDoctorToday(patientId, request.getDoctorId());
    if (existing > 0) {
        throw BusinessException.fail("您今天已经预约过该医生（" + doctor.getName() + "），请选择其他医生或明天再试");
    }

    String dept = request.getDepartment() != null ? request.getDepartment() : doctor.getDepartment();
    Consultation c = new Consultation();
    c.setConsultationNo(generateConsultationNo());
    c.setPatientId(patientId);
    c.setType(1);
    c.setStatus(0);
    c.setChiefComplaint(request.getChiefComplaint());
    c.setDepartment(dept);
    c.setFee(SINGLE_FEE);
    c.setPaymentStatus(0);
    consultationMapper.insert(c);

    consultationDoctorMapper.insert(c.getId(), doctor.getId(), 0);

    // Generate AI summary (non-blocking — failure is OK)
    try {
        String content = "主诉：" + request.getChiefComplaint();
        String summary = summaryService.generateSummary(content);
        consultationMapper.updateMedicalSummary(c.getId(), summary);
        consultationMapper.updateStatus(c.getId(), 1);
    } catch (Exception e) {
        log.error("Auto summary generation failed for consultation {}: {}", c.getId(), e.getMessage());
    }

    // Send ONE notification only
    notificationService.send(2, doctor.getId(), "新挂号通知",
            "您有一个新的会诊挂号，患者主诉：" + request.getChiefComplaint(), List.of(2, 3));

    return c.getId();
}
```

- [ ] **Step 3: Verify the RegistrationRequest DTO has all needed fields**

Read `aicall-backend/src/main/java/com/aicall/module/user/dto/RegistrationRequest.java`. Confirm it has: `doctorId`, `chiefComplaint`, `department`.

- [ ] **Step 4: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java \
        aicall-backend/src/main/resources/mapper/ConsultationMapper.xml \
        aicall-backend/src/main/java/com/aicall/module/user/service/RegistrationService.java
git commit -m "feat: add duplicate booking check and single notification per registration"
```

---

### Task A2: Frontend — Pinia Store for Consultation Flow

**Files:**
- Create: `frontend/packages/user/src/stores/consultationFlow.ts`
- Create: `frontend/packages/user/src/stores/index.ts` (if not exists)

- [ ] **Step 1: Create the consultation flow store**

Create `frontend/packages/user/src/stores/consultationFlow.ts`:

```ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { uploadFile } from '@aicall/shared';

const STORAGE_KEY = 'consultation_flow';
const EXPIRY_HOURS = 2;

export interface FlowState {
  step: number;
  chiefComplaint: string;
  medicalSummary: string;
  chatHistory: { role: string; content: string }[];
  uploadedFileIds: number[];
  selectedType: number | null;
  selectedDoctorIds: number[];
  department: string;
  timestamp: number;
}

export const useConsultationFlowStore = defineStore('consultationFlow', () => {
  const state = ref<FlowState>(loadState());

  function loadState(): FlowState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw) as FlowState;
      if (Date.now() - parsed.timestamp > EXPIRY_HOURS * 3600_000) {
        localStorage.removeItem(STORAGE_KEY);
        return defaultState();
      }
      return parsed;
    } catch {
      return defaultState();
    }
  }

  function defaultState(): FlowState {
    return {
      step: 1,
      chiefComplaint: '',
      medicalSummary: '',
      chatHistory: [],
      uploadedFileIds: [],
      selectedType: null,
      selectedDoctorIds: [],
      department: '',
      timestamp: Date.now(),
    };
  }

  function persist() {
    state.value.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
  }

  function nextStep(step: number) { state.value.step = step; persist(); }
  function setChiefComplaint(v: string) { state.value.chiefComplaint = v; persist(); }
  function setMedicalSummary(v: string) { state.value.medicalSummary = v; persist(); }
  function setChatHistory(v: { role: string; content: string }[]) { state.value.chatHistory = v; persist(); }
  function addChatMessage(msg: { role: string; content: string }) { state.value.chatHistory.push(msg); persist(); }
  function addFileId(id: number) { state.value.uploadedFileIds.push(id); persist(); }
  function setSelectedType(t: number) { state.value.selectedType = t; persist(); }
  function setSelectedDoctorIds(ids: number[]) { state.value.selectedDoctorIds = ids; persist(); }
  function setDepartment(d: string) { state.value.department = d; persist(); }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    state.value = defaultState();
  }

  const isExpired = computed(() => Date.now() - state.value.timestamp > EXPIRY_HOURS * 3600_000);
  const isComplete = computed(() => state.value.step >= 7);

  return {
    state, nextStep, setChiefComplaint, setMedicalSummary, setChatHistory,
    addChatMessage, addFileId, setSelectedType, setSelectedDoctorIds, setDepartment,
    reset, isExpired, isComplete, persist
  };
});
```

- [ ] **Step 2: Commit**

```bash
git add frontend/packages/user/src/stores/
git commit -m "feat: add consultation flow Pinia store with localStorage persistence"
```

---

### Task A3: Frontend — Update User Flow Views

**Files:**
- Modify: `frontend/packages/user/src/views/consultation/Start.vue`
- Modify: `frontend/packages/user/src/views/consultation/Chat.vue`
- Modify: `frontend/packages/user/src/views/consultation/Form.vue`
- Modify: `frontend/packages/user/src/views/consultation/Summary.vue`
- Modify: `frontend/packages/user/src/views/consultation/Upload.vue`
- Modify: `frontend/packages/user/src/views/consultation/SelectType.vue`
- Modify: `frontend/packages/user/src/views/consultation/Pay.vue`
- Modify: `frontend/packages/user/src/views/consultation/Success.vue`
- Modify: `frontend/packages/shared/src/api/consultation.ts`

- [ ] **Step 1: Add consolidated submit API to shared consultation.ts**

```ts
// Add to consultation.ts:
export interface SubmitConsultationRequest {
  department: string;
  type: number;
  doctorIds: number[];
  chiefComplaint: string;
  medicalSummary: string;
  chatHistory: { role: string; content: string }[];
  fileIds: number[];
}

export function submitConsultation(data: SubmitConsultationRequest) {
  return post<{ consultationId: number }>('/user/consultations', data);
}
```

- [ ] **Step 2: Update Start.vue — check on mount, restore or restart**

In `Start.vue` `<script setup>`:
```ts
import { useConsultationFlowStore } from '@/stores/consultationFlow';
const flow = useConsultationFlowStore();

onMounted(() => {
  if (flow.state.step > 1 && !flow.isExpired) {
    // Resume from last step
    router.push(getStepRoute(flow.state.step));
  } else {
    flow.reset();
  }
});
```

- [ ] **Step 3: Update Chat.vue — store messages in flow, no API calls except file uploads**

Replace all `consultationId`-based API calls with flow store writes. Chat messages stored in `flow.addChatMessage()`.

- [ ] **Step 4: Update Upload.vue — use temp file upload, store file IDs**

Upload files to a temp endpoint. Store returned IDs in `flow.addFileId(id)`.

- [ ] **Step 5: Update Pay.vue — submit consolidated data**

```ts
async function handleSubmit() {
  try {
    const res = await submitConsultation({
      department: flow.state.department,
      type: flow.state.selectedType!,
      doctorIds: flow.state.selectedDoctorIds,
      chiefComplaint: flow.state.chiefComplaint,
      medicalSummary: flow.state.medicalSummary,
      chatHistory: flow.state.chatHistory,
      fileIds: flow.state.uploadedFileIds,
    });
    flow.nextStep(7);
    router.push(`/consultation/success`);
  } catch (e: any) {
    if (e.response?.status === 409) {
      ElMessage.error(e.message || '您今天已经预约过该医生');
    } else {
      ElMessage.error(e.message || '提交失败，请重试');
    }
  }
}
```

- [ ] **Step 6: Update Success.vue — clear flow state**

```ts
onMounted(() => { flow.reset(); });
```

- [ ] **Step 7: Commit**

```bash
git add frontend/packages/user/src/views/consultation/ \
        frontend/packages/shared/src/api/consultation.ts
git commit -m "feat: update user flow views to use Pinia store for client-side state management"
```

---

## Sub-project B: Doctor Report & Status Fixes

### Task B1: Backend — Fix AI Report Generation Exception

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/config/AiConfig.java:60-66`
- Modify: `aicall-backend/src/main/java/com/aicall/module/ai/service/ReportGenerateService.java:95-96`
- Modify: `aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorConsultationService.java:198-222`

- [ ] **Step 1: Add timeout to AiConfig**

In `AiConfig.java`, modify the `chatLanguageModel` bean:
```java
@Bean
public ChatLanguageModel chatLanguageModel() {
    return OpenAiChatModel.builder()
            .baseUrl(baseUrl)
            .apiKey(apiKey)
            .modelName(chatModel)
            .timeout(java.time.Duration.ofSeconds(60))
            .build();
}
```

- [ ] **Step 2: Add try-catch to ReportGenerateService**

In `ReportGenerateService.java:95-96`, replace:
```java
log.info("Generating report for consultation {}", consultationId);
return chatLanguageModel.generate(prompt);
```
With:
```java
log.info("Generating report for consultation {}", consultationId);
try {
    return chatLanguageModel.generate(prompt);
} catch (Exception e) {
    log.error("Report generation failed for consultation {}: {}", consultationId, e.getMessage());
    throw BusinessException.fail("AI报告生成失败，请稍后重试");
}
```
Also add at the top: `import com.aicall.common.exception.BusinessException;`

- [ ] **Step 3: Split @Transactional — move DB ops out of LLM call scope**

In `DoctorConsultationService.java:198-222`, replace the `generateReport` method:

```java
public ReportVO generateReport(Long doctorId, Long consultationId) {
    ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
    if (cd == null || cd.getStatus() != 1) throw BusinessException.fail("无权操作该会诊");

    Consultation c = consultationMapper.findById(consultationId);
    if (c.getStatus() != 3) throw BusinessException.fail("会诊状态不正确");

    // LLM call OUTSIDE transaction
    String reportContent = reportGenerateService.generateReport(consultationId);

    // DB operations in transaction
    return saveReportAndUpdateStatus(consultationId, reportContent);
}

@Transactional
private ReportVO saveReportAndUpdateStatus(Long consultationId, String reportContent) {
    Report report = new Report();
    report.setConsultationId(consultationId);
    report.setType(1);
    report.setContent(reportContent);
    report.setStatus(0);
    reportMapper.insert(report);

    consultationMapper.updateStatus(consultationId, 4);

    ReportVO vo = new ReportVO();
    vo.setId(report.getId());
    vo.setContent(reportContent);
    vo.setStatus(0);
    return vo;
}
```

Remove the `@Transactional` annotation from the original method and keep it only on the new private helper.

- [ ] **Step 4: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/config/AiConfig.java \
        aicall-backend/src/main/java/com/aicall/module/ai/service/ReportGenerateService.java \
        aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorConsultationService.java
git commit -m "fix: add LLM timeout, error handling, and split @Transactional for report generation"
```

---

### Task B2: Backend — Fix Consultation Status Stuck at 5

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/module/live/controller/LiveRoomController.java:43-56`
- Modify: `aicall-backend/src/main/java/com/aicall/module/live/service/MinutesService.java:57-76`

- [ ] **Step 1: Fix LiveRoomController — update status synchronously, generate minutes async**

Replace the `endRoom` method:
```java
@PutMapping("/{id}/end")
@Log("结束会诊")
public Result<RoomVO> endRoom(@PathVariable Long id) {
    RoomVO room = liveRoomService.endRoom(id);
    // Immediately mark consultation as completed
    consultationMapper.updateStatus(room.getConsultationId(), 6);
    // Generate minutes & follow-ups asynchronously (non-blocking)
    new Thread(() -> {
        try {
            minutesService.generateMinutes(room.getConsultationId());
            followUpService.createFollowUps(room.getConsultationId());
            evaluationService.createEvaluation(room.getConsultationId());
        } catch (Exception e) {
            log.error("Post-consultation processing failed for consultation {}: {}", room.getConsultationId(), e.getMessage());
        }
    }).start();
    return Result.success(room);
}
```

Add these imports at the top:
```java
import com.aicall.module.consultation.mapper.ConsultationMapper;
import lombok.extern.slf4j.Slf4j;
```

And add the fields to the controller:
```java
private final ConsultationMapper consultationMapper;
```

Add `@Slf4j` annotation on the class.

- [ ] **Step 2: Fix MinutesService — decouple from status update**

Remove `consultationMapper.updateStatus(consultationId, 6);` from `MinutesService.java:73`. The method now only generates and saves minutes:

```java
@Transactional
public String generateMinutes(Long consultationId) {
    LiveRoom room = liveRoomMapper.findByConsultationId(consultationId);
    if (room == null) throw BusinessException.fail("会诊室不存在");

    List<LiveSubtitle> subtitles = liveSubtitleMapper.findByRoomId(room.getId());
    if (subtitles.isEmpty()) throw BusinessException.fail("没有字幕记录，无法生成纪要");

    String transcript = subtitles.stream()
            .map(s -> s.getUserName() + "：" + s.getContent())
            .collect(Collectors.joining("\n"));

    String prompt = String.format(MINUTES_PROMPT, transcript);
    String minutes = chatLanguageModel.generate(prompt);

    consultationMapper.updateMinutes(consultationId, minutes);
    // Status update moved to LiveRoomController.endRoom()

    return minutes;
}
```

Also remove unused import `com.aicall.module.consultation.mapper.ConsultationMapper` if `updateMinutes` is the only consultationMapper usage... wait, it's still used for `updateMinutes`. Keep it.

- [ ] **Step 3: Note**: If there are no subtitles and minutes generation fails, the consultation will still be status 6 (completed) but without minutes. This is correct behavior — the consultation DID complete, but minutes generation failed. Add a `minutes_error` flag to `Consultation` entity and update it on failure if desired (not required for MVP).

- [ ] **Step 4: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/live/controller/LiveRoomController.java \
        aicall-backend/src/main/java/com/aicall/module/live/service/MinutesService.java
git commit -m "fix: update consultation status to 6 synchronously, generate minutes async"
```

---

### Task B3: Backend — Parse Report JSON + User Report Endpoint

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/ReportVO.java`
- Modify: `aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorConsultationService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/user/controller/UserConsultationController.java` (or modify existing)

- [ ] **Step 1: Add parsed fields to ReportVO**

In `ReportVO.java`, add:
```java
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

private Map<String, String> fields;

public Map<String, String> getFields() {
    if (fields == null && content != null) {
        try {
            // Parse JSON content — strip markdown code fences if present
            String json = content.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "");
            }
            fields = new ObjectMapper().readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            fields = Map.of("raw", content);
        }
    }
    return fields;
}
```

- [ ] **Step 2: Populate parsed fields when building ReportVO**

In `DoctorConsultationService.java`, in both `getConsultationDetail()` and `getReport()`, after setting `reportVO.setContent(report.getContent())`, add:
```java
reportVO.getFields(); // triggers lazy parse
```
(This is already handled by the lazy getter in ReportVO — the fields will populate on first access.)

- [ ] **Step 3: Add user report endpoint**

Create a new method in an existing user consultation controller, or add to `UserRegistrationController`:

```java
@GetMapping("/{id}/report")
public Result<ReportVO> getReport(@PathVariable Long id, Authentication auth) {
    Long patientId = (Long) auth.getPrincipal();
    Consultation c = consultationMapper.findById(id);
    if (c == null || !c.getPatientId().equals(patientId)) {
        throw BusinessException.fail("无权查看该报告");
    }
    if (c.getStatus() < 5) {
        throw BusinessException.fail("报告尚未签发");
    }
    Report report = reportMapper.findByConsultationId(id);
    if (report == null) throw BusinessException.fail("报告不存在");

    ReportVO vo = new ReportVO();
    vo.setId(report.getId());
    vo.setContent(report.getContent());
    vo.setStatus(report.getStatus());
    vo.getFields(); // trigger parse
    return Result.success(vo);
}
```

- [ ] **Step 4: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/doctor/dto/ReportVO.java \
        aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorConsultationService.java \
        aicall-backend/src/main/java/com/aicall/module/user/controller/
git commit -m "feat: parse report JSON fields and add user report access endpoint"
```

---

### Task B4: Frontend — Fix Doctor Status Labels + Report Display

**Files:**
- Modify: `frontend/packages/doctor/src/views/ConsultationDetail.vue`

- [ ] **Step 1: Fix status 5 label**

In `ConsultationDetail.vue`, line 20, change:
```html
<el-tag v-else type="warning" size="large">会诊进行中</el-tag>
```
To:
```html
<el-tag v-else type="success" size="large">报告已签发</el-tag>
```

And update the v-if on line 16 — status 5 should show a different UI (report signed, no longer showing "进入会诊室"):
```html
<div style="margin-bottom: 16px" v-if="detail.status === 3 || detail.status === 4">
  <el-button type="success" @click="router.push(`/consultations/${id}/room`)">进入会诊室</el-button>
</div>
<div style="margin-bottom: 16px" v-if="detail.status === 5 || detail.status === 6">
  <el-tag :type="detail.status === 6 ? 'info' : 'success'" size="large">
    {{ detail.status === 6 ? '已完成' : '报告已签发' }}
  </el-tag>
</div>
```

- [ ] **Step 2: Add formatted report display tab**

Add a new tab in the `<el-tabs>` (after the "报告" tab):
```html
<el-tab-pane label="报告详情" v-if="detail.report?.fields">
  <div style="max-width: 800px">
    <el-card v-for="(value, key) in reportFieldLabels" :key="key" style="margin-bottom: 12px">
      <template #header><strong>{{ value }}</strong></template>
      <div style="white-space: pre-wrap; line-height: 1.8">{{ detail.report.fields[key] || '无' }}</div>
    </el-card>
  </div>
</el-tab-pane>
```

Add the field label mapping in `<script setup>`:
```ts
const reportFieldLabels: Record<string, string> = {
  chiefComplaint: '主诉',
  presentIllness: '现病史',
  pastHistory: '既往史',
  examinationFindings: '检查所见',
  diagnosis: '诊断意见',
  analysis: '分析说明',
  recommendation: '建议',
  followUp: '随访建议',
};
```

- [ ] **Step 3: Commit**

```bash
git add frontend/packages/doctor/src/views/ConsultationDetail.vue
git commit -m "fix: correct status 5 label and add formatted report display"
```

---

### Task B5: Frontend — User-Side Report View

**Files:**
- Create: `frontend/packages/user/src/views/consultation/ReportView.vue`
- Modify: `frontend/packages/user/src/views/consultation/Query.vue`
- Modify: `frontend/packages/user/src/router/index.ts`
- Modify: `frontend/packages/shared/src/api/consultation.ts`

- [ ] **Step 1: Add API function**

In `consultation.ts`:
```ts
export function getUserReport(consultationId: number) {
  return get<{ id: number; content: string; status: number; fields: Record<string, string> }>(`/user/consultations/${consultationId}/report`);
}
```

- [ ] **Step 2: Create ReportView.vue**

```vue
<template>
  <div v-loading="loading">
    <van-nav-bar title="会诊报告" left-arrow @click-left="router.back()" />
    <div style="padding: 16px" v-if="report">
      <van-card v-for="(label, key) in labels" :key="key" :title="label"
                :desc="report.fields?.[key] || '无'" style="margin-bottom: 8px" />
    </div>
    <van-empty v-else-if="!loading" description="报告不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserReport } from '@aicall/shared';
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const report = ref<any>(null);

const labels: Record<string, string> = {
  chiefComplaint: '主诉',
  presentIllness: '现病史',
  pastHistory: '既往史',
  examinationFindings: '检查所见',
  diagnosis: '诊断意见',
  analysis: '分析说明',
  recommendation: '建议',
  followUp: '随访建议',
};

onMounted(async () => {
  loading.value = true;
  try {
    report.value = await getUserReport(id);
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
});
</script>
```

- [ ] **Step 3: Add route**

In the user router, add:
```ts
{ path: '/consultation/:id/report', component: () => import('@/views/consultation/ReportView.vue'), meta: { requiresAuth: true } }
```

- [ ] **Step 4: Add button in Query.vue**

In the user's consultation list/query view, for items with `status >= 5`, add a "查看报告" button that navigates to `/consultation/${item.id}/report`.

- [ ] **Step 5: Commit**

```bash
git add frontend/packages/user/src/views/consultation/ReportView.vue \
        frontend/packages/user/src/views/consultation/Query.vue \
        frontend/packages/user/src/router/index.ts \
        frontend/packages/shared/src/api/consultation.ts
git commit -m "feat: add user-side report view for signed consultation reports"
```

---

## Sub-project C: Admin Tracking & Visualization

### Task C1: Backend — Admin Consultation Timeline Endpoint

**Files:**
- Create/Modify: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminConsultationController.java`
- Create/Modify: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminConsultationService.java`

- [ ] **Step 1: Create timeline VO**

Create `aicall-backend/src/main/java/com/aicall/module/admin/dto/TimelineItemVO.java`:
```java
package com.aicall.module.admin.dto;

import lombok.Data;

@Data
public class TimelineItemVO {
    private Integer status;
    private String label;
    private String time;
    private String operator;
}
```

- [ ] **Step 2: Add timeline endpoint in AdminConsultationController**

Find the existing admin consultation controller at `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminConsultationController.java`. If it doesn't exist, check the admin controller structure. Add:

```java
@GetMapping("/{id}/timeline")
public Result<List<TimelineItemVO>> getTimeline(@PathVariable Long id) {
    return Result.success(adminConsultationService.getTimeline(id));
}
```

- [ ] **Step 3: Implement timeline logic in service**

In the admin service, synthesize timeline from existing data:

```java
public List<TimelineItemVO> getTimeline(Long consultationId) {
    Consultation c = consultationMapper.findById(consultationId);
    if (c == null) throw BusinessException.fail("会诊不存在");

    List<TimelineItemVO> timeline = new ArrayList<>();

    // Status 0: 患者提交
    timeline.add(item(0, "患者提交", c.getCreateTime(), c.getPatientName()));

    // Status 1: AI摘要生成 (if summary exists)
    if (c.getMedicalSummary() != null) {
        timeline.add(item(1, "AI资料审核完成", null, "系统"));
    }

    // Status 2: 管理员分配医生 (from consultation_doctor)
    List<ConsultationDoctor> doctors = consultationDoctorMapper.findByConsultationId(consultationId);
    if (!doctors.isEmpty()) {
        timeline.add(item(2, "管理员分配医生", doctors.get(0).getCreateTime(), "管理员"));
    }

    // Status 3: 医生确认
    for (ConsultationDoctor cd : doctors) {
        if (cd.getStatus() == 1 && cd.getConfirmTime() != null) {
            Doctor d = doctorMapper.findById(cd.getDoctorId());
            timeline.add(item(3, "医生" + (d != null ? d.getName() : "") + "确认接诊", cd.getConfirmTime(), d != null ? d.getName() : ""));
        }
    }

    // Status 4: AI报告生成
    Report report = reportMapper.findByConsultationId(consultationId);
    if (report != null) {
        timeline.add(item(4, "AI报告生成", report.getCreateTime(), "系统"));

        // Status 5: 医生签发
        if (report.getStatus() >= 2 && report.getSignedTime() != null) {
            Doctor signer = doctorMapper.findById(report.getSignedBy());
            timeline.add(item(5, "报告签发", report.getSignedTime(), signer != null ? signer.getName() : ""));
        }
    }

    // Status 6: 会诊完成
    if (c.getStatus() >= 6 && c.getEndTime() != null) {
        timeline.add(item(6, "会诊完成", c.getEndTime(), "系统"));
    }

    // Status 7/8: 取消/退回
    if (c.getStatus() == 7 && c.getCancelReason() != null) {
        timeline.add(item(7, "已取消：" + c.getCancelReason(), c.getUpdateTime(), "管理员"));
    }

    return timeline;
}

private TimelineItemVO item(int status, String label, LocalDateTime time, String operator) {
    TimelineItemVO vo = new TimelineItemVO();
    vo.setStatus(status);
    vo.setLabel(label);
    vo.setTime(time != null ? time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null);
    vo.setOperator(operator);
    return vo;
}
```

- [ ] **Step 4: Add API function in shared admin.ts**

```ts
export interface TimelineItem {
  status: number;
  label: string;
  time: string;
  operator: string;
}

export function getConsultationTimeline(id: number) {
  return get<TimelineItem[]>(`/admin/consultations/${id}/timeline`);
}
```

- [ ] **Step 5: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/admin/ \
        frontend/packages/shared/src/api/admin.ts
git commit -m "feat: add admin consultation timeline endpoint"
```

---

### Task C2: Frontend — Dashboard.vue Chart Fixes

**Files:**
- Modify: `frontend/packages/admin/src/views/Dashboard.vue`

- [ ] **Step 1: Fix memory leak — store chart instances and dispose on unmount**

In `<script setup>`, add:
```ts
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const chartInstances: echarts.ECharts[] = [];

function initChart(ref: HTMLElement | undefined): echarts.ECharts | null {
  if (!ref) return null;
  const chart = echarts.init(ref);
  chartInstances.push(chart);
  return chart;
}

function handleResize() {
  chartInstances.forEach(c => c.resize());
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  loadData();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstances.forEach(c => c.dispose());
  chartInstances.length = 0;
});
```

Replace `echarts.init(ref)` with `initChart(ref)` in `renderCharts()`.

- [ ] **Step 2: Add legend to pie charts**

In `renderCharts()`, add legend to the department pie chart:
```ts
chart.setOption({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [{
    type: 'pie', radius: ['40%', '70%'],
    data: Object.entries(data.value.byDepartment).map(([name, value]) => ({ name, value })),
  }],
});
```

Same for the status pie chart.

- [ ] **Step 3: Fix status map type — change to Record<number, string>**

```ts
const consultationStatusMap: Record<number, string> = {
  0: '已提交', 1: '资料审核中', 2: '专家确认中', 3: '已排期',
  4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回',
};
```

Update the status pie chart data mapping accordingly:
```ts
data: Object.entries(data.value.consultationByStatus).map(([status, value]) => ({
  name: consultationStatusMap[Number(status)] || status, value,
})),
```

- [ ] **Step 4: Wrap each chart init in try-catch**

```ts
function renderCharts() {
  if (!data.value) return;

  try { renderDeptChart(); } catch (e) { console.error('Dept chart failed', e); }
  try { renderStatusChart(); } catch (e) { console.error('Status chart failed', e); }
  try { renderTrendChart(); } catch (e) { console.error('Trend chart failed', e); }
  try { renderRevenueChart(); } catch (e) { console.error('Revenue chart failed', e); }
}
```

Extract each chart rendering into its own function (`renderDeptChart`, `renderStatusChart`, etc.)

- [ ] **Step 5: Add refresh button in template**

Above the `<el-row>` stats cards:
```html
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
  <h3 style="margin: 0">数据概览</h3>
  <el-button type="primary" size="small" @click="loadData" :loading="loading">刷新数据</el-button>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/packages/admin/src/views/Dashboard.vue
git commit -m "fix: admin dashboard chart memory leak, add legend, resize, error handling, and refresh"
```

---

### Task C3: Frontend — Admin ConsultationDetail.vue Timeline + Status Fixes

**Files:**
- Modify: `frontend/packages/admin/src/views/ConsultationDetail.vue`

- [ ] **Step 1: Add timeline component**

After the `<el-descriptions>` block, add:
```html
<el-card header="流程追踪" style="margin-bottom: 20px">
  <el-timeline>
    <el-timeline-item
      v-for="item in timeline"
      :key="item.status"
      :timestamp="item.time"
      :color="item.status === detail.status ? '#409eff' : ''"
    >
      {{ item.label }}
      <span style="color: #999; font-size: 12px; margin-left: 8px">{{ item.operator }}</span>
    </el-timeline-item>
  </el-timeline>
  <div v-if="!timeline.length" style="text-align: center; color: #999">暂无流程记录</div>
</el-card>
```

- [ ] **Step 2: Fetch timeline in loadData**

```ts
import { getConsultationTimeline, type TimelineItem } from '@aicall/shared';

const timeline = ref<TimelineItem[]>([]);

async function loadData() {
  // ... existing code ...
  try {
    timeline.value = await getConsultationTimeline(id);
  } catch { /* timeline optional */ }
}
```

- [ ] **Step 3: Fix status label — 5 → "报告已签发"**

In `consultationStatusMap`:
```ts
4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回',
```

- [ ] **Step 4: Fix status tag type — add missing statuses**

```ts
function statusTagType(status: number): string {
  const map: Record<number, string> = {
    0: 'info', 1: 'warning', 2: 'warning', 3: '', 4: 'warning', 5: 'success', 6: 'success', 7: 'danger', 8: 'danger'
  };
  return map[status] || 'info';
}
```

- [ ] **Step 5: Fix cancel button guard — add status 8**

```html
<div style="margin-bottom: 16px" v-if="detail.status !== 6 && detail.status !== 7 && detail.status !== 8">
  <el-button type="danger" @click="showCancelDialog = true">取消会诊</el-button>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/packages/admin/src/views/ConsultationDetail.vue
git commit -m "fix: add timeline, correct status labels, fix cancel guard in admin ConsultationDetail"
```

---

### Task C4: Frontend — Admin ConsultationList.vue Fixes

**Files:**
- Modify: `frontend/packages/admin/src/views/ConsultationList.vue`

- [ ] **Step 1: Fix status tag type — add missing statuses**

```ts
function statusTagType(status: number): string {
  const map: Record<number, string> = {
    0: 'info', 1: 'warning', 2: 'warning', 3: '', 4: 'warning', 5: 'success', 6: 'success', 7: 'danger', 8: 'danger'
  };
  return map[status] || 'info';
}
```

- [ ] **Step 2: Fix status label — 5 → "报告已签发"**

```ts
const consultationStatusMap: Record<number, string> = {
  0: '已提交', 1: '资料审核中', 2: '专家确认中', 3: '已排期',
  4: '待会诊', 5: '报告已签发', 6: '已完成', 7: '已取消', 8: '已退回',
};
```

- [ ] **Step 3: Reset page when filter changes**

```html
<el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 160px"
  @change="statusFilter = $event; page = 1; loadData()">
```

- [ ] **Step 4: Add page-size selector to pagination**

```html
<el-pagination style="margin-top: 16px; justify-content: flex-end;"
  v-model:current-page="page" v-model:page-size="size"
  :page-sizes="[10, 20, 50]"
  :total="total" layout="total, sizes, prev, pager, next"
  @current-change="loadData" @size-change="loadData" />
```

- [ ] **Step 5: Commit**

```bash
git add frontend/packages/admin/src/views/ConsultationList.vue
git commit -m "fix: correct status labels, reset page on filter, add page-size selector in admin ConsultationList"
```

---

## Execution Order

Sub-projects are independent and can be done in parallel. Within each, tasks are sequential:

```
A1 → A2 → A3 (backend → frontend)
B1 → B2 → B3 → B4 → B5 (backend fixes → json parse → frontend)
C1 → C2 → C3 → C4 (API → dashboard → detail → list)
```

Recommended order: **A → B → C** (user flow first, then doctor, then admin), but any order works.
