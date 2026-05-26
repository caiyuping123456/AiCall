# Design: Consultation Flow Fixes (User + Doctor + Admin)

**Date:** 2026-05-26
**Status:** Approved

---

## Overview

Fixes 11 issues across 3 domains of the consultation flow. The changes are organized into three sub-projects that can be implemented independently.

| Sub-project | Domain | Issues |
|---|---|---|
| A | User | Idempotency, duplicate booking, mid-flow state cleanup |
| B | Doctor | AI exception, status display bug, report JSON display, user-side report view |
| C | Admin | Consultation flow tracking, dashboard visualization fixes |

---

## Sub-project A: User Consultation Flow Fixes

### Design Principle

Consolidate all incremental API calls into a single `POST /consultations` call. Frontend manages all intermediate state via Pinia + localStorage. Backend only receives data when the user completes payment.

### Backend Changes

**New endpoint: `POST /api/user/consultations`**

Request body:
```json
{
  "department": "心血管内科",
  "type": 1,
  "doctorIds": [3],
  "chiefComplaint": "胸痛3天",
  "medicalSummary": "...",
  "chatHistory": [{"role": "user", "content": "..."}],
  "fileIds": ["temp-abc123"],
  "paymentInfo": { ... }
}
```

Backend logic (`@Transactional`):

1. **Validate** required fields
2. **Duplicate check:** `SELECT COUNT(*) FROM consultation c JOIN consultation_doctor cd ON c.id = cd.consultation_id WHERE c.patient_id = ? AND cd.doctor_id IN (?) AND DATE(c.created_at) = CURDATE() AND c.status NOT IN (7, 8)` — if match, return `409 Conflict` "您今天已经预约过该医生（{name}）"
3. **Create** consultation (status=0)
4. **Create** ConsultationDoctor records
5. **Move** files from temp to permanent storage
6. **Send one notification** per assigned doctor via `NotificationService.send()`
7. Return consultation ID

**File upload:** Unchanged `POST /api/user/files/upload` writes to temp storage. Temp files expire after 24h.

### Frontend Changes

New Pinia store `useConsultationFlow`:

```
state: {
  step: 1,
  chiefComplaint, medicalSummary, chatHistory,
  uploadedFileIds, selectedType,
  selectedDoctorIds, paymentInfo, department
}
```

- Each step writes to store + localStorage auto-save
- On mount, restore from localStorage (2h expiry)
- On re-entry with no/expired data → restart from step 1
- On submit success → clear store + localStorage → navigate to Success
- Any submit failure → stay on current step, keep state, user retries

### Error Handling

| Scenario | Response |
|---|---|
| Duplicate booking | 409, toast: "您今天已经预约过该医生（{name}），请选择其他医生" |
| Temp file expired | 400 "文件已过期，请重新上传"，back to Upload step |
| Payment failure | 402 or timeout, stay on Pay step, retry |
| Network failure | Catch error, keep localStorage state, retry |

---

## Sub-project B: Doctor Report & Status Fixes

### Fix 1: AI Report Generation Exception

**`AiConfig.java:60-66`** — Add timeout:
```java
return OpenAiChatModel.builder()
        .baseUrl(baseUrl)
        .apiKey(apiKey)
        .modelName(chatModel)
        .timeout(Duration.ofSeconds(60))
        .build();
```

**`ReportGenerateService.java:95-96`** — Wrap in try-catch:
```java
try {
    return chatLanguageModel.generate(prompt);
} catch (Exception e) {
    log.error("Report generation failed for consultation {}", consultationId, e);
    throw BusinessException.fail("AI报告生成失败，请稍后重试");
}
```

**`DoctorConsultationService.java:199`** — Remove `@Transactional` from `generateReport()`. Extract DB operations into a private `@Transactional` helper called only after LLM response succeeds.

### Fix 2: Consultation Status Stuck at 5

**`LiveRoomController.java:43-56`** — Replace fire-and-forget thread:
- Update consultation status to 6 **synchronously** before returning
- Generate minutes **asynchronously** with proper error handling
- If minutes generation fails, store error flag on consultation (new column `minutes_error TINYINT DEFAULT 0`)

**Frontend status label corrections:**
- Doctor `ConsultationDetail.vue`: status 5 → "报告已签发", status 6 → "已完成"
- Admin `ConsultationDetail.vue` + `ConsultationList.vue`: status 5 → "报告已签发"

### Fix 3: Report JSON Display

**Backend:** Parse report `content` (JSON string) into typed fields in `ReportVO`:
```java
private Map<String, String> fields;
// chiefComplaint, presentIllness, pastHistory,
// examinationFindings, diagnosis, analysis, recommendation, followUp
```

**Frontend (Doctor `ConsultationDetail.vue`):** When status >= 5, render report as formatted text blocks with section headings:
```
┌────────────────────────────┐
│  会诊报告                    │
│  主诉       胸痛3天...       │
│  现病史     患者3天前...      │
│  既往史     高血压病史...     │
│  检查所见    血压140/90...   │
│  诊断       冠状动脉...      │
│  分析       （详细分析）      │
│  建议       1.低盐饮食...    │
│  随访       2周后复查...     │
└────────────────────────────┘
```

`ReportEditor.vue` retains the structured editing capability for doctors.

### Fix 4: User-Side Report View

**Backend:** New endpoint `GET /api/user/consultations/{id}/report` — returns `ReportVO`. Authorization: only the consultation's patient.

**Frontend (User H5):**
- `Query.vue` — add "查看报告" button for consultations with status >= 5
- New `ReportView.vue` — renders same formatted text blocks as doctor side (read-only)

---

## Sub-project C: Admin Tracking & Visualization

### Feature 1: Consultation Status Timeline

**Backend:** New endpoint `GET /api/admin/consultations/{id}/timeline`

Synthesizes timeline from existing data (consultation, consultation_doctor, report timestamps):

```json
[
  {"status": 0, "label": "患者提交", "time": "2026-05-26 09:00", "operator": "患者张三"},
  {"status": 2, "label": "管理员分配医生", "time": "2026-05-26 09:30", "operator": "管理员王五"},
  {"status": 3, "label": "医生李四确认接诊", "time": "2026-05-26 10:00", "operator": "医生李四"},
  {"status": 4, "label": "AI报告生成", "time": "2026-05-26 10:05", "operator": "系统"},
  {"status": 5, "label": "医生签发报告", "time": "2026-05-26 11:00", "operator": "医生李四"},
  {"status": 6, "label": "会诊完成", "time": "2026-05-26 11:30", "operator": "系统"}
]
```

**Frontend:** New `<el-timeline>` component in `ConsultationDetail.vue`, showing each node with status label, timestamp, and operator. Current status node highlighted.

### Feature 2: Dashboard Visualization Fixes

| # | File | Fix |
|---|------|-----|
| 1 | Dashboard.vue | Store ECharts instances in `reactive`, call `.dispose()` in `onUnmounted` |
| 2 | Dashboard.vue | Add `window.addEventListener('resize', ...)` calling `.resize()` on each chart |
| 3 | Dashboard.vue | Add `legend: { orient: 'vertical', right: 10 }` to pie charts |
| 4 | Dashboard.vue | Wrap each chart init in try-catch |
| 5 | Dashboard.vue | Add "刷新数据" button triggering `loadData()` |
| 6 | Dashboard.vue | Change status map from `Record<string, string>` to `Record<number, string>` |
| 7 | ConsultationDetail.vue | Fill status tag map gaps: `1: 'warning'`, `4: 'warning'`, `5: 'warning'` |
| 8 | ConsultationDetail.vue | Add `&& detail.status !== 8` to cancel button guard |
| 9 | ConsultationDetail.vue | Fix status label: 5 → "报告已签发" |
| 10 | ConsultationList.vue | Fill same status tag map gaps as #7 |
| 11 | ConsultationList.vue | Add `page.value = 1` on status filter change |
| 12 | ConsultationList.vue | Add `sizes` to pagination layout |

---

## Files Affected

### Backend
- `AiConfig.java` — add timeout
- `ReportGenerateService.java` — add try-catch
- `DoctorConsultationService.java` — split @Transactional
- `LiveRoomController.java` — fix async status update
- `MinutesService.java` — decouple status update from LLM call
- `ConsultationMapper.java` — duplicate check query
- New: User consultation create endpoint + service
- New: Admin timeline endpoint
- New: User report access endpoint

### Frontend — User (H5)
- Pinia store: `useConsultationFlow`
- Views: `Start/Chat/Form/Summary/Upload/SelectType/Pay/Success` — use store instead of direct API
- `Query.vue` — add report button
- New: `ReportView.vue`

### Frontend — Doctor
- `ConsultationDetail.vue` — status labels, report display
- `ReportEditor.vue` — parse JSON fields

### Frontend — Admin
- `Dashboard.vue` — 6 fixes
- `ConsultationDetail.vue` — timeline component, status fixes, cancel guard
- `ConsultationList.vue` — 3 fixes
