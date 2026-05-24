# 随访、评价与通知系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build post-consultation follow-up system (auto-scheduling + AI questionnaire + patient response + AI analysis + abnormal alert), consultation evaluation (star ratings), and notification center (in-app + WebSocket push).

**Architecture:** Backend adds three independent services (FollowUpService, EvaluationService, NotificationService) with their own entities/mappers/controllers, a daily `@Scheduled` task scans due follow-ups, AI generates personalized questionnaires and analyzes answers, notification service persists to DB and pushes via existing WebSocketHandler. Frontend adds H5 pages in user package (Vant 4) and notification panel in doctor package (Element Plus).

**Tech Stack:** Java 17, Spring Boot 3.3, MyBatis, Spring @Scheduled, ChatLanguageModel (DeepSeek-V3.2), Vue 3 + TypeScript, Vant 4 (user), Element Plus (doctor).

---

## File Structure

### Backend — new files

| File | Purpose |
|------|---------|
| `module/followup/entity/FollowUp.java` | Follow-up entity |
| `module/followup/mapper/FollowUpMapper.java` | Follow-up CRUD + scheduled queries |
| `resources/mapper/FollowUpMapper.xml` | Follow-up SQL |
| `module/followup/dto/FollowUpVO.java` | Follow-up response |
| `module/followup/dto/AnswerRequest.java` | Submit answer payload |
| `module/followup/service/FollowUpService.java` | Follow-up logic + AI questionnaire + AI analysis |
| `module/followup/scheduler/FollowUpScheduler.java` | Daily 9am scheduled check |
| `module/followup/controller/FollowUpController.java` | `/user/followup` + `/doctor/followup` endpoints |
| `module/evaluation/entity/Evaluation.java` | Evaluation entity |
| `module/evaluation/mapper/EvaluationMapper.java` | Evaluation CRUD |
| `resources/mapper/EvaluationMapper.xml` | Evaluation SQL |
| `module/evaluation/dto/EvaluationVO.java` | Evaluation response |
| `module/evaluation/dto/SubmitEvaluationRequest.java` | Submit evaluation payload |
| `module/evaluation/service/EvaluationService.java` | Evaluation create/submit |
| `module/evaluation/controller/EvaluationController.java` | `/user/evaluation` + `/doctor/evaluation` endpoints |
| `module/notification/entity/Notification.java` | Notification entity |
| `module/notification/mapper/NotificationMapper.java` | Notification CRUD |
| `resources/mapper/NotificationMapper.xml` | Notification SQL |
| `module/notification/dto/NotificationVO.java` | Notification response |
| `module/notification/service/NotificationService.java` | Send + query + mark read |
| `module/notification/controller/NotificationController.java` | `/user/notification` + `/doctor/notification` endpoints |

### Backend — modified files

| File | Change |
|------|--------|
| `module/consultation/entity/Consultation.java` | Add `evaluation` JOIN field |
| `resources/mapper/ConsultationMapper.xml` | Add evaluation LEFT JOIN in findById |
| `module/live/controller/LiveRoomController.java` | endRoom triggers follow-up + evaluation creation |
| `config/SecurityConfig.java` | Permit new `/user/*` + `/doctor/*` paths |
| `infrastructure/websocket/WebSocketHandler.java` | Add notification message type + sendToUser |

### Frontend — new files

| File | Purpose |
|------|---------|
| `shared/src/api/followup.ts` | Follow-up API functions + types |
| `shared/src/api/evaluation.ts` | Evaluation API functions + types |
| `shared/src/api/notification.ts` | Notification API functions + types |
| `user/src/views/FollowUpList.vue` | Patient follow-up list |
| `user/src/views/FollowUpDetail.vue` | Patient fill questionnaire |
| `user/src/views/EvaluationView.vue` | Patient evaluation (list + form combined) |
| `user/src/views/NotificationCenter.vue` | Patient notification center |
| `doctor/src/views/DoctorNotification.vue` | Doctor notification center |

### Frontend — modified files

| File | Change |
|------|--------|
| `shared/src/index.ts` | Export new API modules |
| `user/src/router/index.ts` | Add 4 new routes |
| `doctor/src/views/ConsultationDetail.vue` | Add follow-up tab |
| `doctor/src/router/index.ts` | Add notification route |

Base paths: Backend `aicall-backend/src/main/java/com/aicall/`, Frontend `frontend/packages/`.

---

### Task 1: Entities + Mappers + XMLs

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/followup/entity/FollowUp.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/evaluation/entity/Evaluation.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/notification/entity/Notification.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/followup/mapper/FollowUpMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/evaluation/mapper/EvaluationMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/notification/mapper/NotificationMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/FollowUpMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/EvaluationMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/NotificationMapper.xml`

- [ ] **Step 1: Create directories and entities**

```bash
mkdir -p aicall-backend/src/main/java/com/aicall/module/followup/{entity,mapper,dto,service,scheduler,controller}
mkdir -p aicall-backend/src/main/java/com/aicall/module/evaluation/{entity,mapper,dto,service,controller}
mkdir -p aicall-backend/src/main/java/com/aicall/module/notification/{entity,mapper,dto,service,controller}
```

Create `FollowUp.java`:
```java
package com.aicall.module.followup.entity;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FollowUp {
    private Long id;
    private Long consultationId;
    private Long patientId;
    private Integer planDay;
    private String questionnaire;
    private String answer;
    private String aiAnalysis;
    private Integer status;
    private LocalDateTime sendTime;
    private LocalDateTime answerTime;
    private LocalDateTime createTime;
    // JOIN fields
    private String consultationNo;
    private String patientName;
}
```

Create `Evaluation.java`:
```java
package com.aicall.module.evaluation.entity;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Evaluation {
    private Long id;
    private Long consultationId;
    private Long patientId;
    private Integer doctorScore;
    private Integer serviceScore;
    private String comment;
    private LocalDateTime createTime;
    // JOIN fields
    private String consultationNo;
}
```

Create `Notification.java`:
```java
package com.aicall.module.notification.entity;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Notification {
    private Long id;
    private Integer userType;
    private Long userId;
    private String phone;
    private Integer type;
    private String title;
    private String content;
    private Integer status;
    private LocalDateTime sendTime;
    private LocalDateTime createTime;
}
```

- [ ] **Step 2: Create mapper interfaces**

`FollowUpMapper.java`:
```java
package com.aicall.module.followup.mapper;
import com.aicall.module.followup.entity.FollowUp;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface FollowUpMapper {
    void insert(FollowUp followUp);
    List<FollowUp> findByConsultationId(@Param("consultationId") Long consultationId);
    List<FollowUp> findByPatientId(@Param("patientId") Long patientId);
    List<FollowUp> findPendingByPatientId(@Param("patientId") Long patientId);
    FollowUp findById(@Param("id") Long id);
    List<FollowUp> findDueByDate(@Param("date") LocalDate date);
    List<FollowUp> findAbnormalByDoctorId(@Param("doctorId") Long doctorId);
    void updateStatus(@Param("id") Long id, @Param("status") Integer status,
                      @Param("sendTime") java.time.LocalDateTime sendTime);
    void updateAnswer(@Param("id") Long id, @Param("answer") String answer,
                      @Param("answerTime") java.time.LocalDateTime answerTime, @Param("status") Integer status);
    void updateAiAnalysis(@Param("id") Long id, @Param("aiAnalysis") String aiAnalysis,
                          @Param("status") Integer status);
}
```

`EvaluationMapper.java`:
```java
package com.aicall.module.evaluation.mapper;
import com.aicall.module.evaluation.entity.Evaluation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface EvaluationMapper {
    void insert(Evaluation evaluation);
    Evaluation findByConsultationId(@Param("consultationId") Long consultationId);
    List<Evaluation> findPendingByPatientId(@Param("patientId") Long patientId);
    void updateScore(@Param("id") Long id, @Param("doctorScore") Integer doctorScore,
                     @Param("serviceScore") Integer serviceScore, @Param("comment") String comment);
}
```

`NotificationMapper.java`:
```java
package com.aicall.module.notification.mapper;
import com.aicall.module.notification.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface NotificationMapper {
    void insert(Notification notification);
    List<Notification> findByUserId(@Param("userType") Integer userType, @Param("userId") Long userId,
                                    @Param("offset") int offset, @Param("size") int size);
    long countByUserId(@Param("userType") Integer userType, @Param("userId") Long userId);
    long countUnread(@Param("userType") Integer userType, @Param("userId") Long userId);
    void updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
```

- [ ] **Step 3: Create mapper XMLs**

`FollowUpMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.followup.mapper.FollowUpMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO follow_up (consultation_id, patient_id, plan_day, questionnaire, status)
        VALUES (#{consultationId}, #{patientId}, #{planDay}, #{questionnaire}, #{status})
    </insert>
    <select id="findByConsultationId" resultType="com.aicall.module.followup.entity.FollowUp">
        SELECT f.*, c.consultation_no, p.name AS patient_name
        FROM follow_up f
        LEFT JOIN consultation c ON f.consultation_id = c.id
        LEFT JOIN patient p ON f.patient_id = p.id
        WHERE f.consultation_id = #{consultationId}
        ORDER BY f.plan_day ASC
    </select>
    <select id="findByPatientId" resultType="com.aicall.module.followup.entity.FollowUp">
        SELECT f.*, c.consultation_no FROM follow_up f
        LEFT JOIN consultation c ON f.consultation_id = c.id
        WHERE f.patient_id = #{patientId} ORDER BY f.create_time DESC
    </select>
    <select id="findPendingByPatientId" resultType="com.aicall.module.followup.entity.FollowUp">
        SELECT f.*, c.consultation_no FROM follow_up f
        LEFT JOIN consultation c ON f.consultation_id = c.id
        WHERE f.patient_id = #{patientId} AND f.status IN (0, 1)
        ORDER BY f.plan_day ASC
    </select>
    <select id="findById" resultType="com.aicall.module.followup.entity.FollowUp">
        SELECT f.*, c.consultation_no, p.name AS patient_name
        FROM follow_up f
        LEFT JOIN consultation c ON f.consultation_id = c.id
        LEFT JOIN patient p ON f.patient_id = p.id
        WHERE f.id = #{id}
    </select>
    <select id="findDueByDate" resultType="com.aicall.module.followup.entity.FollowUp">
        SELECT f.*, c.consultation_no, c.medical_summary, c.chief_complaint, p.name AS patient_name
        FROM follow_up f
        LEFT JOIN consultation c ON f.consultation_id = c.id
        LEFT JOIN patient p ON f.patient_id = p.id
        WHERE f.status = 0 AND c.end_time IS NOT NULL
        AND DATE_ADD(DATE(c.end_time), INTERVAL f.plan_day DAY) = #{date}
    </select>
    <select id="findAbnormalByDoctorId" resultType="com.aicall.module.followup.entity.FollowUp">
        SELECT f.*, c.consultation_no, p.name AS patient_name
        FROM follow_up f
        LEFT JOIN consultation c ON f.consultation_id = c.id
        LEFT JOIN patient p ON f.patient_id = p.id
        LEFT JOIN consultation_doctor cd ON c.id = cd.consultation_id
        WHERE f.status = 3 AND cd.doctor_id = #{doctorId}
        ORDER BY f.answer_time DESC
    </select>
    <update id="updateStatus">
        UPDATE follow_up SET status = #{status}, send_time = #{sendTime} WHERE id = #{id}
    </update>
    <update id="updateAnswer">
        UPDATE follow_up SET answer = #{answer}, answer_time = #{answerTime}, status = #{status} WHERE id = #{id}
    </update>
    <update id="updateAiAnalysis">
        UPDATE follow_up SET ai_analysis = #{aiAnalysis}, status = #{status} WHERE id = #{id}
    </update>
</mapper>
```

`EvaluationMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.evaluation.mapper.EvaluationMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO evaluation (consultation_id, patient_id) VALUES (#{consultationId}, #{patientId})
    </insert>
    <select id="findByConsultationId" resultType="com.aicall.module.evaluation.entity.Evaluation">
        SELECT e.*, c.consultation_no FROM evaluation e
        LEFT JOIN consultation c ON e.consultation_id = c.id
        WHERE e.consultation_id = #{consultationId}
    </select>
    <select id="findPendingByPatientId" resultType="com.aicall.module.evaluation.entity.Evaluation">
        SELECT e.*, c.consultation_no FROM evaluation e
        LEFT JOIN consultation c ON e.consultation_id = c.id
        WHERE e.patient_id = #{patientId} AND e.doctor_score IS NULL
        ORDER BY e.create_time DESC
    </select>
    <update id="updateScore">
        UPDATE evaluation SET doctor_score = #{doctorScore}, service_score = #{serviceScore},
        comment = #{comment} WHERE id = #{id}
    </update>
</mapper>
```

`NotificationMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.notification.mapper.NotificationMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO notification (user_type, user_id, phone, type, title, content, status, send_time)
        VALUES (#{userType}, #{userId}, #{phone}, #{type}, #{title}, #{content}, #{status}, #{sendTime})
    </insert>
    <select id="findByUserId" resultType="com.aicall.module.notification.entity.Notification">
        SELECT * FROM notification WHERE user_type = #{userType} AND user_id = #{userId}
        ORDER BY create_time DESC LIMIT #{offset}, #{size}
    </select>
    <select id="countByUserId" resultType="long">
        SELECT COUNT(*) FROM notification WHERE user_type = #{userType} AND user_id = #{userId}
    </select>
    <select id="countUnread" resultType="long">
        SELECT COUNT(*) FROM notification WHERE user_type = #{userType} AND user_id = #{userId} AND status = 1
    </select>
    <update id="updateStatus">
        UPDATE notification SET status = #{status} WHERE id = #{id}
    </update>
</mapper>
```

- [ ] **Step 4: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 2: DTOs

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/followup/dto/FollowUpVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/followup/dto/AnswerRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/evaluation/dto/EvaluationVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/evaluation/dto/SubmitEvaluationRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/notification/dto/NotificationVO.java`

- [ ] **Step 1: Create all DTOs**

`FollowUpVO.java`:
```java
package com.aicall.module.followup.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FollowUpVO {
    private Long id;
    private Long consultationId;
    private Integer planDay;
    private String questionnaire;
    private String answer;
    private String aiAnalysis;
    private Integer status;
    private LocalDateTime sendTime;
    private LocalDateTime answerTime;
    private LocalDateTime createTime;
    private String consultationNo;
    private String patientName;
}
```

`AnswerRequest.java`:
```java
package com.aicall.module.followup.dto;
import lombok.Data;

@Data
public class AnswerRequest {
    private String answer;
}
```

`EvaluationVO.java`:
```java
package com.aicall.module.evaluation.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvaluationVO {
    private Long id;
    private Long consultationId;
    private Integer doctorScore;
    private Integer serviceScore;
    private String comment;
    private LocalDateTime createTime;
    private String consultationNo;
}
```

`SubmitEvaluationRequest.java`:
```java
package com.aicall.module.evaluation.dto;
import lombok.Data;

@Data
public class SubmitEvaluationRequest {
    private Integer doctorScore;
    private Integer serviceScore;
    private String comment;
}
```

`NotificationVO.java`:
```java
package com.aicall.module.notification.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationVO {
    private Long id;
    private Integer userType;
    private Long userId;
    private Integer type;
    private String title;
    private String content;
    private Integer status;
    private LocalDateTime sendTime;
    private LocalDateTime createTime;
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 3: FollowUpService

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/followup/service/FollowUpService.java`

- [ ] **Step 1: Create FollowUpService**

```java
package com.aicall.module.followup.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.followup.dto.AnswerRequest;
import com.aicall.module.followup.dto.FollowUpVO;
import com.aicall.module.followup.entity.FollowUp;
import com.aicall.module.followup.mapper.FollowUpMapper;
import com.aicall.module.notification.service.NotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FollowUpService {
    private static final String QUESTIONNAIRE_PROMPT = """
            你是一位资深临床随访专家。根据以下患者会诊信息，生成第%d天随访问卷。
            要求：使用JSON格式输出，5-8个问题。类型包括：radio(选项数组)、checkbox(选项数组)、text。
            关注：症状变化、用药情况、不良反应、生活质量。
            
            患者信息：
            主诉：%s
            诊断摘要：%s
            
            输出纯JSON数组： [{"question":"...","type":"radio","options":["A","B","C"]}, ...]
            """;

    private static final String ANALYSIS_PROMPT = """
            你是一位资深临床随访专家。分析患者第%d天随访回答，判断异常。
            异常标准：症状明显加重、出现新发症状、药物严重不良反应、主观感受显著恶化。
            
            问卷及回答：
            %s
            
            请用JSON输出：{"abnormal":true/false,"level":"正常/轻度异常/明显异常/严重异常","summary":"分析总结","suggestion":"建议"}
            只输出JSON，不要其他内容。
            """;

    private final FollowUpMapper followUpMapper;
    private final ConsultationMapper consultationMapper;
    private final NotificationService notificationService;
    private final ChatLanguageModel chatLanguageModel;
    private final ObjectMapper objectMapper;

    @Transactional
    public void createFollowUps(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");

        String daysConfig = "3,7,30";
        for (String dayStr : daysConfig.split(",")) {
            int day = Integer.parseInt(dayStr.trim());
            String questionnaire = generateQuestionnaire(c.getChiefComplaint(),
                    c.getMedicalSummary(), day);

            FollowUp fu = new FollowUp();
            fu.setConsultationId(consultationId);
            fu.setPatientId(c.getPatientId());
            fu.setPlanDay(day);
            fu.setQuestionnaire(questionnaire);
            fu.setStatus(0);
            followUpMapper.insert(fu);
        }
        log.info("Created follow-up plans for consultation {}", consultationId);
    }

    private String generateQuestionnaire(String chiefComplaint, String medicalSummary, int planDay) {
        try {
            String prompt = String.format(QUESTIONNAIRE_PROMPT, planDay,
                    chiefComplaint != null ? chiefComplaint : "未提供",
                    medicalSummary != null ? medicalSummary : "未提供");
            return chatLanguageModel.generate(prompt);
        } catch (Exception e) {
            log.warn("AI questionnaire generation failed, using fallback: {}", e.getMessage());
            return "[{\"question\":\"您目前感觉如何？\",\"type\":\"radio\",\"options\":[\"明显好转\",\"略有好转\",\"无明显变化\",\"有所加重\"]}," +
                   "{\"question\":\"是否有新的不适症状？\",\"type\":\"text\"}]";
        }
    }

    public FollowUpVO getDetail(Long id) {
        FollowUp fu = followUpMapper.findById(id);
        if (fu == null) throw BusinessException.fail("随访记录不存在");
        return toVO(fu);
    }

    public List<FollowUpVO> getByConsultation(Long consultationId) {
        return followUpMapper.findByConsultationId(consultationId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    public List<FollowUpVO> getPendingByPatient(Long patientId) {
        return followUpMapper.findPendingByPatientId(patientId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    public List<FollowUpVO> getAbnormalByDoctor(Long doctorId) {
        return followUpMapper.findAbnormalByDoctorId(doctorId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    @Transactional
    public void submitAnswer(Long id, Long patientId, AnswerRequest request) {
        FollowUp fu = followUpMapper.findById(id);
        if (fu == null) throw BusinessException.fail("随访记录不存在");
        if (!fu.getPatientId().equals(patientId)) throw BusinessException.fail("无权操作");
        if (fu.getStatus() >= 2) throw BusinessException.fail("已提交过回答");

        followUpMapper.updateAnswer(id, request.getAnswer(), LocalDateTime.now(), 2);
        analyzeAnswerAsync(id);
    }

    private void analyzeAnswerAsync(Long followUpId) {
        new Thread(() -> {
            try {
                analyzeAnswer(followUpId);
            } catch (Exception e) {
                log.error("AI analysis failed for follow-up {}: {}", followUpId, e.getMessage());
            }
        }).start();
    }

    private void analyzeAnswer(Long followUpId) {
        FollowUp fu = followUpMapper.findById(followUpId);
        if (fu == null) return;

        try {
            String content = "问卷：" + fu.getQuestionnaire() + "\n回答：" + fu.getAnswer();
            String prompt = String.format(ANALYSIS_PROMPT, fu.getPlanDay(), content);
            String result = chatLanguageModel.generate(prompt);
            var node = objectMapper.readTree(result);
            boolean abnormal = node.has("abnormal") && node.get("abnormal").asBoolean();

            int status = abnormal ? 3 : 2;
            followUpMapper.updateAiAnalysis(followUpId, result, status);

            if (abnormal) {
                Consultation c = consultationMapper.findById(fu.getConsultationId());
                String patientName = c != null && c.getPatientName() != null ? c.getPatientName() : "患者";
                String level = node.has("level") ? node.get("level").asText() : "异常";
                notificationService.sendAbnormalAlert(fu.getConsultationId(), fu.getId(),
                        patientName, level);
            }
        } catch (Exception e) {
            log.error("AI analysis error for follow-up {}: {}", followUpId, e.getMessage());
        }
    }

    public void sendDueFollowUps() {
        List<FollowUp> dueList = followUpMapper.findDueByDate(java.time.LocalDate.now());
        for (FollowUp fu : dueList) {
            followUpMapper.updateStatus(fu.getId(), 1, LocalDateTime.now());
            notificationService.sendFollowUpNotification(fu);
        }
        log.info("Sent {} due follow-up notifications", dueList.size());
    }

    private FollowUpVO toVO(FollowUp fu) {
        FollowUpVO vo = new FollowUpVO();
        vo.setId(fu.getId());
        vo.setConsultationId(fu.getConsultationId());
        vo.setPlanDay(fu.getPlanDay());
        vo.setQuestionnaire(fu.getQuestionnaire());
        vo.setAnswer(fu.getAnswer());
        vo.setAiAnalysis(fu.getAiAnalysis());
        vo.setStatus(fu.getStatus());
        vo.setSendTime(fu.getSendTime());
        vo.setAnswerTime(fu.getAnswerTime());
        vo.setCreateTime(fu.getCreateTime());
        vo.setConsultationNo(fu.getConsultationNo());
        vo.setPatientName(fu.getPatientName());
        return vo;
    }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 4: EvaluationService + NotificationService + FollowUpScheduler

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/evaluation/service/EvaluationService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/notification/service/NotificationService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/followup/scheduler/FollowUpScheduler.java`

- [ ] **Step 1: Create EvaluationService**

```java
package com.aicall.module.evaluation.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.evaluation.dto.EvaluationVO;
import com.aicall.module.evaluation.dto.SubmitEvaluationRequest;
import com.aicall.module.evaluation.entity.Evaluation;
import com.aicall.module.evaluation.mapper.EvaluationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluationService {
    private final EvaluationMapper evaluationMapper;
    private final ConsultationMapper consultationMapper;

    @Transactional
    public void createEvaluation(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) return;
        Evaluation e = new Evaluation();
        e.setConsultationId(consultationId);
        e.setPatientId(c.getPatientId());
        evaluationMapper.insert(e);
    }

    public EvaluationVO getByConsultation(Long consultationId) {
        Evaluation e = evaluationMapper.findByConsultationId(consultationId);
        return e != null ? toVO(e) : null;
    }

    public List<EvaluationVO> getPendingByPatient(Long patientId) {
        return evaluationMapper.findPendingByPatientId(patientId).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    @Transactional
    public void submitEvaluation(Long consultationId, Long patientId, SubmitEvaluationRequest request) {
        Evaluation e = evaluationMapper.findByConsultationId(consultationId);
        if (e == null) throw BusinessException.fail("评价记录不存在");
        if (!e.getPatientId().equals(patientId)) throw BusinessException.fail("无权操作");
        if (e.getDoctorScore() != null) throw BusinessException.fail("已评价");
        evaluationMapper.updateScore(e.getId(), request.getDoctorScore(),
                request.getServiceScore(), request.getComment());
    }

    private EvaluationVO toVO(Evaluation e) {
        EvaluationVO vo = new EvaluationVO();
        vo.setId(e.getId());
        vo.setConsultationId(e.getConsultationId());
        vo.setDoctorScore(e.getDoctorScore());
        vo.setServiceScore(e.getServiceScore());
        vo.setComment(e.getComment());
        vo.setCreateTime(e.getCreateTime());
        vo.setConsultationNo(e.getConsultationNo());
        return vo;
    }
}
```

- [ ] **Step 2: Create NotificationService**

```java
package com.aicall.module.notification.service;

import com.aicall.infrastructure.websocket.WebSocketHandler;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.followup.entity.FollowUp;
import com.aicall.module.notification.dto.NotificationVO;
import com.aicall.module.notification.entity.Notification;
import com.aicall.module.notification.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationMapper notificationMapper;
    private final ConsultationMapper consultationMapper;
    private final WebSocketHandler webSocketHandler;

    @Transactional
    public void send(Integer userType, Long userId, String title, String content, List<Integer> types) {
        for (Integer type : types) {
            Notification n = new Notification();
            n.setUserType(userType);
            n.setUserId(userId);
            n.setType(type);
            n.setTitle(title);
            n.setContent(content);
            n.setStatus(type == 2 ? 1 : 1);
            n.setSendTime(LocalDateTime.now());
            if (type == 2 || type == 3) {
                notificationMapper.insert(n);
            }
        }
        if (types.contains(3)) {
            webSocketHandler.sendToUser(userId, buildWsMessage(title, content));
        }
    }

    private String buildWsMessage(String title, String content) {
        return "{\"type\":\"notification\",\"title\":\"" + title.replace("\"", "\\\"") +
                "\",\"content\":\"" + content.replace("\"", "\\\"") + "\"}";
    }

    public void sendFollowUpNotification(FollowUp fu) {
        Consultation c = consultationMapper.findById(fu.getConsultationId());
        String patientName = c != null && c.getPatientName() != null ? c.getPatientName() : "患者";
        String title = "随访提醒";
        String content = "您有一份第" + fu.getPlanDay() + "天随访问卷待填写";
        send(1, fu.getPatientId(), title, content, java.util.List.of(2, 3));
    }

    public void sendAbnormalAlert(Long consultationId, Long followUpId, String patientName, String level) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) return;
        String title = "随访异常告警";
        String content = patientName + "的第" + followUpId + "号随访出现" + level;
        // Notify all doctors assigned to this consultation via in-app
        // Simplified: use a system notification for now
        send(2, 0L, title, content, java.util.List.of(2));
    }

    public List<NotificationVO> getUserNotifications(Integer userType, Long userId, int page, int size) {
        int offset = (page - 1) * size;
        return notificationMapper.findByUserId(userType, userId, offset, size).stream()
                .map(this::toVO).collect(Collectors.toList());
    }

    public long getUnreadCount(Integer userType, Long userId) {
        return notificationMapper.countUnread(userType, userId);
    }

    @Transactional
    public void markRead(Long id) {
        notificationMapper.updateStatus(id, 2);
    }

    private NotificationVO toVO(Notification n) {
        NotificationVO vo = new NotificationVO();
        vo.setId(n.getId());
        vo.setUserType(n.getUserType());
        vo.setUserId(n.getUserId());
        vo.setType(n.getType());
        vo.setTitle(n.getTitle());
        vo.setContent(n.getContent());
        vo.setStatus(n.getStatus());
        vo.setSendTime(n.getSendTime());
        vo.setCreateTime(n.getCreateTime());
        return vo;
    }
}
```

- [ ] **Step 3: Create FollowUpScheduler**

```java
package com.aicall.module.followup.scheduler;

import com.aicall.module.evaluation.service.EvaluationService;
import com.aicall.module.followup.service.FollowUpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class FollowUpScheduler {
    private final FollowUpService followUpService;

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkAndSend() {
        log.info("Running follow-up due check...");
        followUpService.sendDueFollowUps();
    }
}
```

- [ ] **Step 4: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 5: Controllers (FollowUp + Evaluation + Notification)

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/followup/controller/FollowUpController.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/evaluation/controller/EvaluationController.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/notification/controller/NotificationController.java`

- [ ] **Step 1: Create FollowUpController**

```java
package com.aicall.module.followup.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.followup.dto.AnswerRequest;
import com.aicall.module.followup.dto.FollowUpVO;
import com.aicall.module.followup.service.FollowUpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FollowUpController {
    private final FollowUpService followUpService;

    @GetMapping("/user/followup/pending")
    @Log("患者待填写随访")
    public Result<List<FollowUpVO>> pending(Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(followUpService.getPendingByPatient(patientId));
    }

    @GetMapping("/user/followup/{id}/detail")
    @Log("患者查看随访详情")
    public Result<FollowUpVO> detail(@PathVariable Long id) {
        return Result.success(followUpService.getDetail(id));
    }

    @PutMapping("/user/followup/{id}/answer")
    @Log("提交随访回答")
    public Result<Void> answer(@PathVariable Long id, @RequestBody AnswerRequest request, Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        followUpService.submitAnswer(id, patientId, request);
        return Result.success();
    }

    @GetMapping("/doctor/followup/{consultationId}")
    @Log("医生查看随访列表")
    public Result<List<FollowUpVO>> list(@PathVariable Long consultationId) {
        return Result.success(followUpService.getByConsultation(consultationId));
    }

    @GetMapping("/doctor/followup/{id}/detail")
    @Log("医生查看随访详情")
    public Result<FollowUpVO> doctorDetail(@PathVariable Long id) {
        return Result.success(followUpService.getDetail(id));
    }

    @GetMapping("/doctor/followup/abnormal")
    @Log("医生查看异常随访")
    public Result<List<FollowUpVO>> abnormal(Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        return Result.success(followUpService.getAbnormalByDoctor(doctorId));
    }
}
```

- [ ] **Step 2: Create EvaluationController**

```java
package com.aicall.module.evaluation.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.evaluation.dto.EvaluationVO;
import com.aicall.module.evaluation.dto.SubmitEvaluationRequest;
import com.aicall.module.evaluation.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EvaluationController {
    private final EvaluationService evaluationService;

    @GetMapping("/user/evaluation/pending")
    @Log("患者待评价列表")
    public Result<List<EvaluationVO>> pending(Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(evaluationService.getPendingByPatient(patientId));
    }

    @PutMapping("/user/evaluation/{consultationId}")
    @Log("提交评价")
    public Result<Void> submit(@PathVariable Long consultationId,
                               @RequestBody SubmitEvaluationRequest request, Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        evaluationService.submitEvaluation(consultationId, patientId, request);
        return Result.success();
    }

    @GetMapping("/doctor/evaluation/{consultationId}")
    @Log("查看评价")
    public Result<EvaluationVO> getByConsultation(@PathVariable Long consultationId) {
        return Result.success(evaluationService.getByConsultation(consultationId));
    }
}
```

- [ ] **Step 3: Create NotificationController**

```java
package com.aicall.module.notification.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.notification.dto.NotificationVO;
import com.aicall.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/notification")
    @Log("患者通知列表")
    public Result<List<NotificationVO>> userNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size, Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(notificationService.getUserNotifications(1, patientId, page, size));
    }

    @GetMapping("/user/notification/unread-count")
    @Log("患者未读通知数")
    public Result<Map<String, Long>> userUnread(Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        Map<String, Long> result = new HashMap<>();
        result.put("count", notificationService.getUnreadCount(1, patientId));
        return Result.success(result);
    }

    @PutMapping("/user/notification/{id}/read")
    @Log("标记已读")
    public Result<Void> read(@PathVariable Long id) {
        notificationService.markRead(id);
        return Result.success();
    }

    @GetMapping("/doctor/notification")
    @Log("医生通知列表")
    public Result<List<NotificationVO>> doctorNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size, Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        return Result.success(notificationService.getUserNotifications(2, doctorId, page, size));
    }

    @GetMapping("/doctor/notification/unread-count")
    @Log("医生未读通知数")
    public Result<Map<String, Long>> doctorUnread(Authentication auth) {
        Long doctorId = (Long) auth.getPrincipal();
        Map<String, Long> result = new HashMap<>();
        result.put("count", notificationService.getUnreadCount(2, doctorId));
        return Result.success(result);
    }

    @PutMapping("/doctor/notification/{id}/read")
    @Log("医生标记已读")
    public Result<Void> doctorRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return Result.success();
    }
}
```

- [ ] **Step 4: Verify compilation**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn compile -q
```

---

### Task 6: Modify Existing Backend Files

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/Consultation.java`
- Modify: `aicall-backend/src/main/resources/mapper/ConsultationMapper.xml`
- Modify: `aicall-backend/src/main/java/com/aicall/module/live/controller/LiveRoomController.java`
- Modify: `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java`
- Modify: `aicall-backend/src/main/java/com/aicall/infrastructure/websocket/WebSocketHandler.java`

- [ ] **Step 1: Add evaluation JOIN to Consultation entity**

In `Consultation.java`, add after `private String minutes;`:
```java
    // JOIN field from evaluation table
    private Integer doctorScore;
    private Integer serviceScore;
    private String evaluationComment;
```

- [ ] **Step 2: Add evaluation LEFT JOIN to ConsultationMapper.xml findById**

In the `findById` select of `ConsultationMapper.xml`, add before `WHERE c.id = #{id}`:
```sql
               ev.doctor_score, ev.service_score, ev.comment AS evaluation_comment,
```
And add the JOIN before `WHERE`:
```sql
        LEFT JOIN evaluation ev ON c.id = ev.consultation_id
```

The full findById becomes:
```xml
    <select id="findById" resultType="com.aicall.module.consultation.entity.Consultation">
        SELECT c.id, c.consultation_no, c.patient_id, c.type, c.status, c.department,
               c.chief_complaint, c.medical_summary, c.fee, c.payment_status,
               c.scheduled_time, c.end_time, c.cancel_reason, c.reject_reason,
               c.minutes, c.create_time, c.update_time,
               p.name AS patient_name, p.age AS patient_age, p.gender AS patient_gender,
               ev.doctor_score, ev.service_score, ev.comment AS evaluation_comment
        FROM consultation c
        LEFT JOIN patient p ON c.patient_id = p.id
        LEFT JOIN evaluation ev ON c.id = ev.consultation_id
        WHERE c.id = #{id}
    </select>
```

- [ ] **Step 3: Modify LiveRoomController endRoom to trigger follow-up + evaluation**

In `LiveRoomController.java`, add new dependencies:
```java
    private final FollowUpService followUpService;
    private final EvaluationService evaluationService;
```
(Need to add imports for these services)

Update the `endRoom` method to trigger follow-up and evaluation creation:
```java
    @PutMapping("/{id}/end")
    @Log("结束会诊")
    public Result<RoomVO> endRoom(@PathVariable Long id) {
        RoomVO room = liveRoomService.endRoom(id);
        new Thread(() -> {
            try {
                minutesService.generateMinutes(room.getConsultationId());
                followUpService.createFollowUps(room.getConsultationId());
                evaluationService.createEvaluation(room.getConsultationId());
            } catch (Exception ignored) {
            }
        }).start();
        return Result.success(room);
    }
```

- [ ] **Step 4: Add new paths to SecurityConfig**

In `SecurityConfig.java`, add after the existing authenticated paths:
```java
                .requestMatchers("/user/followup/**").authenticated()
                .requestMatchers("/user/evaluation/**").authenticated()
                .requestMatchers("/user/notification/**").authenticated()
                .requestMatchers("/doctor/followup/**").authenticated()
                .requestMatchers("/doctor/notification/**").authenticated()
                .requestMatchers("/doctor/evaluation/**").authenticated()
```

- [ ] **Step 5: Add sendToUser method to WebSocketHandler**

In `WebSocketHandler.java`, add method:
```java
    public void sendToUser(Long userId, String message) {
        for (Map.Entry<String, Long> entry : sessionUserId.entrySet()) {
            if (entry.getValue().equals(userId)) {
                CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions
                        .get(sessionRoom.get(entry.getKey()));
                if (sessions != null) {
                    TextMessage textMessage = new TextMessage(message);
                    for (WebSocketSession s : sessions) {
                        if (s.getId().equals(entry.getKey()) && s.isOpen()) {
                            try { s.sendMessage(textMessage); } catch (IOException ignored) {}
                        }
                    }
                }
            }
        }
    }
```
And add import: `import java.util.Map;`

- [ ] **Step 6: Verify full backend compilation and tests**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn test -q 2>&1 | grep -E "Tests run|BUILD"
```

---

### Task 7: Frontend Shared API

**Files:**
- Create: `frontend/packages/shared/src/api/followup.ts`
- Create: `frontend/packages/shared/src/api/evaluation.ts`
- Create: `frontend/packages/shared/src/api/notification.ts`
- Modify: `frontend/packages/shared/src/index.ts`

- [ ] **Step 1: Create followup.ts**

```typescript
import { get, put } from './request';

export interface FollowUpItem {
  id: number;
  consultationId: number;
  planDay: number;
  questionnaire: string;
  answer: string;
  aiAnalysis: string;
  status: number;
  sendTime: string;
  answerTime: string;
  createTime: string;
  consultationNo: string;
  patientName: string;
}

export function getPendingFollowUps() {
  return get<FollowUpItem[]>('/user/followup/pending');
}

export function getFollowUpDetail(id: number) {
  return get<FollowUpItem>(`/user/followup/${id}/detail`);
}

export function submitFollowUpAnswer(id: number, answer: string) {
  return put<void>(`/user/followup/${id}/answer`, { answer });
}

export function getDoctorFollowUps(consultationId: number) {
  return get<FollowUpItem[]>(`/doctor/followup/${consultationId}`);
}

export function getDoctorFollowUpDetail(id: number) {
  return get<FollowUpItem>(`/doctor/followup/${id}/detail`);
}

export function getAbnormalFollowUps() {
  return get<FollowUpItem[]>('/doctor/followup/abnormal');
}
```

- [ ] **Step 2: Create evaluation.ts**

```typescript
import { get, put } from './request';

export interface EvaluationItem {
  id: number;
  consultationId: number;
  doctorScore: number;
  serviceScore: number;
  comment: string;
  createTime: string;
  consultationNo: string;
}

export function getPendingEvaluations() {
  return get<EvaluationItem[]>('/user/evaluation/pending');
}

export function submitEvaluation(consultationId: number, data: { doctorScore: number; serviceScore: number; comment: string }) {
  return put<void>(`/user/evaluation/${consultationId}`, data);
}
```

- [ ] **Step 3: Create notification.ts**

```typescript
import { get, put } from './request';

export interface NotificationItem {
  id: number;
  userType: number;
  userId: number;
  type: number;
  title: string;
  content: string;
  status: number;
  sendTime: string;
  createTime: string;
}

export function getUserNotifications(page = 1, size = 20) {
  return get<NotificationItem[]>('/user/notification', { params: { page, size } });
}

export function getUserUnreadCount() {
  return get<{ count: number }>('/user/notification/unread-count');
}

export function markNotificationRead(id: number) {
  return put<void>(`/user/notification/${id}/read`);
}

export function getDoctorNotifications(page = 1, size = 20) {
  return get<NotificationItem[]>('/doctor/notification', { params: { page, size } });
}

export function getDoctorUnreadCount() {
  return get<{ count: number }>('/doctor/notification/unread-count');
}

export function markDoctorNotificationRead(id: number) {
  return put<void>(`/doctor/notification/${id}/read`);
}
```

- [ ] **Step 4: Update shared index.ts**

Add after the live export:
```typescript
export * from './api/followup';
export * from './api/evaluation';
export * from './api/notification';
```

---

### Task 8: User Frontend Pages (Vant 4 H5)

**Files:**
- Create: `frontend/packages/user/src/views/FollowUpList.vue`
- Create: `frontend/packages/user/src/views/FollowUpDetail.vue`
- Create: `frontend/packages/user/src/views/EvaluationView.vue`
- Create: `frontend/packages/user/src/views/NotificationCenter.vue`
- Modify: `frontend/packages/user/src/router/index.ts`

- [ ] **Step 1: Add routes to user router**

In `router/index.ts`, add imports at top:
```typescript
import FollowUpList from '@/views/FollowUpList.vue';
import FollowUpDetail from '@/views/FollowUpDetail.vue';
import EvaluationView from '@/views/EvaluationView.vue';
import NotificationCenter from '@/views/NotificationCenter.vue';
```

Add routes in the routes array:
```typescript
  { path: '/followup', name: 'FollowUpList', component: FollowUpList, meta: { title: '我的随访', requiresAuth: true } },
  { path: '/followup/:id', name: 'FollowUpDetail', component: FollowUpDetail, meta: { title: '随访问卷', requiresAuth: true } },
  { path: '/evaluation', name: 'EvaluationView', component: EvaluationView, meta: { title: '会诊评价', requiresAuth: true } },
  { path: '/notifications', name: 'NotificationCenter', component: NotificationCenter, meta: { title: '通知中心', requiresAuth: true } },
```

- [ ] **Step 2: Create FollowUpList.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="我的随访" />
    <div class="content">
      <van-empty v-if="!loading && list.length === 0" description="暂无随访记录" />
      <van-cell-group inset v-for="item in list" :key="item.id" style="margin-bottom: 8px">
        <van-cell :title="'第' + item.planDay + '天随访'" :label="item.consultationNo" is-link
          :value="statusText(item.status)" @click="$router.push('/followup/' + item.id)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getPendingFollowUps, type FollowUpItem } from '@aicall/shared';

const list = ref<FollowUpItem[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    list.value = await getPendingFollowUps();
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
});

function statusText(status: number) {
  return ['待发送', '已发送', '已回复', '异常'][status] || '未知';
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
</style>
```

- [ ] **Step 3: Create FollowUpDetail.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="随访问卷" />
    <div class="content" v-if="detail">
      <div class="info-card">
        <div class="info-title">第{{ detail.planDay }}天随访</div>
        <div class="info-sub">会诊编号：{{ detail.consultationNo }}</div>
      </div>

      <div v-if="detail.status >= 2">
        <div class="section-title">回答内容</div>
        <div class="answer-box">{{ detail.answer || '暂无' }}</div>
        <div v-if="detail.aiAnalysis" class="section-title">AI 分析</div>
        <div class="answer-box" style="background: #fff3e0" v-if="detail.aiAnalysis">{{ detail.aiAnalysis }}</div>
      </div>

      <div v-else>
        <div class="section-title">问卷</div>
        <div v-for="(q, idx) in questions" :key="idx" class="question-card">
          <div class="q-title">{{ idx + 1 }}. {{ q.question }}</div>
          <van-radio-group v-if="q.type === 'radio'" v-model="answers[idx]" direction="horizontal">
            <van-radio v-for="opt in q.options" :key="opt" :name="opt">{{ opt }}</van-radio>
          </van-radio-group>
          <van-field v-else v-model="answers[idx]" type="textarea" :rows="3" placeholder="请输入" />
        </div>
        <van-button type="primary" block :loading="submitting" @click="handleSubmit" style="margin-top: 16px">
          提交问卷
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getFollowUpDetail, submitFollowUpAnswer } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const detail = ref<any>(null);
const questions = ref<any[]>([]);
const answers = ref<string[]>([]);
const submitting = ref(false);

onMounted(async () => {
  try {
    detail.value = await getFollowUpDetail(id);
    if (detail.value.questionnaire) {
      const raw = detail.value.questionnaire.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      questions.value = JSON.parse(raw);
      answers.value = new Array(questions.value.length).fill('');
    }
  } catch (e: any) { showToast(e.message || '加载失败'); }
});

async function handleSubmit() {
  submitting.value = true;
  try {
    await submitFollowUpAnswer(id, JSON.stringify(answers.value));
    showToast('提交成功');
    router.push('/followup');
  } catch (e: any) {
    showToast(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
.info-card { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.info-title { font-size: 18px; font-weight: 600; }
.info-sub { color: #999; font-size: 13px; margin-top: 4px; }
.section-title { font-size: 15px; font-weight: 600; margin: 12px 0 8px; padding-left: 4px; }
.answer-box { background: #fff; border-radius: 8px; padding: 16px; white-space: pre-wrap; line-height: 1.6; }
.question-card { background: #fff; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
.q-title { font-weight: 500; margin-bottom: 10px; }
</style>
```

- [ ] **Step 4: Create EvaluationView.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="会诊评价" />
    <div class="content">
      <van-empty v-if="!loading && list.length === 0" description="暂无待评价会诊" />
      <div v-for="item in list" :key="item.id" class="eval-card">
        <div class="eval-header">{{ item.consultationNo }}</div>
        <div class="eval-row"><span>医生评分</span><van-rate v-model="scores[item.consultationId]" :count="5" /></div>
        <van-field v-model="comments[item.consultationId]" type="textarea" :rows="2" placeholder="文字评价（可选）" />
        <van-button type="primary" size="small" :loading="submitting === item.consultationId"
          @click="handleSubmit(item.consultationId)">提交评价</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { showToast } from 'vant';
import { getPendingEvaluations, submitEvaluation, type EvaluationItem } from '@aicall/shared';

const list = ref<EvaluationItem[]>([]);
const loading = ref(false);
const submitting = ref(0);
const scores = reactive<Record<number, number>>({});
const comments = reactive<Record<number, string>>({});

onMounted(async () => {
  loading.value = true;
  try {
    list.value = await getPendingEvaluations();
    list.value.forEach(e => { scores[e.consultationId] = 0; comments[e.consultationId] = ''; });
  } catch (e: any) { showToast(e.message || '加载失败'); }
  finally { loading.value = false; }
});

async function handleSubmit(consultationId: number) {
  submitting.value = consultationId;
  try {
    await submitEvaluation(consultationId, {
      doctorScore: scores[consultationId],
      serviceScore: scores[consultationId],
      comment: comments[consultationId],
    });
    showToast('感谢反馈');
    list.value = list.value.filter(e => e.consultationId !== consultationId);
  } catch (e: any) { showToast(e.message || '提交失败'); }
  finally { submitting.value = 0; }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
.eval-card { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.eval-header { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.eval-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
</style>
```

- [ ] **Step 5: Create NotificationCenter.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="通知中心" />
    <div class="content">
      <van-empty v-if="!loading && list.length === 0" description="暂无通知" />
      <van-cell-group inset>
        <van-cell v-for="item in list" :key="item.id"
          :title="item.title" :label="item.content" :value="item.createTime?.slice(0, 10)"
          @click="handleRead(item)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getUserNotifications, markNotificationRead, type NotificationItem } from '@aicall/shared';

const list = ref<NotificationItem[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try { list.value = await getUserNotifications(); }
  catch (e: any) { showToast(e.message || '加载失败'); }
  finally { loading.value = false; }
});

async function handleRead(item: NotificationItem) {
  if (item.status !== 2) {
    try { await markNotificationRead(item.id); item.status = 2; } catch {}
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 12px; }
</style>
```

- [ ] **Step 6: Verify user frontend builds**

```bash
cd E:/javaclass/AiCall/frontend && pnpm --filter @aicall/user build
```

---

### Task 9: Doctor Frontend Pages (Element Plus)

**Files:**
- Modify: `frontend/packages/doctor/src/views/ConsultationDetail.vue`
- Create: `frontend/packages/doctor/src/views/DoctorNotification.vue`
- Modify: `frontend/packages/doctor/src/router/index.ts`

- [ ] **Step 1: Add follow-up tab to doctor ConsultationDetail.vue**

In the `<el-tabs>` section, add a new tab pane after existing tabs:
```vue
        <el-tab-pane label="随访记录">
          <el-table :data="followUps" stripe v-loading="followUpLoading">
            <el-table-column label="随访天数">
              <template #default="{ row }">第{{ row.planDay }}天</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="['info', '', 'success', 'danger'][row.status] || 'info'" size="small">
                  {{ ['待发送', '已发送', '已回复', '异常'][row.status] || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sendTime" label="发送时间" width="160" />
            <el-table-column prop="answerTime" label="回复时间" width="160" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="primary" @click="showFollowUpDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
```

In `<script setup>`, add imports:
```typescript
import { getDoctorFollowUps } from '@aicall/shared';
```

Add data:
```typescript
const followUps = ref<any[]>([]);
const followUpLoading = ref(false);
```

Load follow-ups after `loadData()`:
```typescript
async function loadFollowUps() {
  followUpLoading.value = true;
  try {
    followUps.value = await getDoctorFollowUps(id);
  } catch { /* optional */ }
  finally { followUpLoading.value = false; }
}
```

Update `onMounted` or `loadData` to also call `loadFollowUps()` after detail loads.

Add:
```typescript
function showFollowUpDetail(row: any) {
  ElMessageBox.alert(
    '问卷：' + (row.questionnaire || '无') + '\n\n回答：' + (row.answer || '暂无') +
    '\n\nAI分析：' + (row.aiAnalysis || '暂无'),
    '第' + row.planDay + '天随访详情',
    { confirmButtonText: '关闭' }
  );
}
```

- [ ] **Step 2: Create DoctorNotification.vue**

```vue
<template>
  <div>
    <el-page-header @back="router.back()" title="返回" content="通知中心" style="margin-bottom: 20px" />
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="content" label="内容" min-width="300" />
      <el-table-column prop="sendTime" label="时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 2 ? 'info' : 'warning'" size="small">
            {{ row.status === 2 ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button v-if="row.status !== 2" link type="primary" @click="handleRead(row)">标已读</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getDoctorNotifications, markDoctorNotificationRead, type NotificationItem } from '@aicall/shared';

const router = useRouter();
const list = ref<NotificationItem[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try { list.value = await getDoctorNotifications(); }
  catch (e: any) { ElMessage.error(e.message || '加载失败'); }
  finally { loading.value = false; }
});

async function handleRead(item: NotificationItem) {
  try { await markDoctorNotificationRead(item.id); item.status = 2; }
  catch {}
}
</script>
```

- [ ] **Step 3: Add doctor notification route**

In `doctor/src/router/index.ts`, add import:
```typescript
      { path: 'notifications', name: 'DoctorNotification', component: () => import('@/views/DoctorNotification.vue'), meta: { title: '通知中心' } },
```

- [ ] **Step 4: Verify doctor frontend builds**

```bash
cd E:/javaclass/AiCall/frontend && pnpm --filter @aicall/doctor build
```

---

### Task 10: Integration Verification

- [ ] **Step 1: Run all backend tests**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn test -q 2>&1 | grep -E "Tests run|BUILD"
```

- [ ] **Step 2: Build all frontends**

```bash
cd E:/javaclass/AiCall/frontend && pnpm --filter @aicall/user build && pnpm --filter @aicall/doctor build && pnpm --filter @aicall/admin build
```

- [ ] **Step 3: Start backend and verify endpoints**

```bash
cd E:/javaclass/AiCall/aicall-backend && mvn spring-boot:run &
# Verify no startup errors
# Test key endpoints:
# curl http://localhost:8080/api/user/followup/pending (with auth token)
# curl http://localhost:8080/api/user/notification/unread-count (with auth token)
```
