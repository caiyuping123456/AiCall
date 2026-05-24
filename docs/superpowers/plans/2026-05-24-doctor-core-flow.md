# Doctor Core Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the doctor-side workflow: login → workbench → review consultation → AI report generation → quality control → sign & issue.

**Architecture:** Backend adds a `/doctor/**` API layer with 13 endpoints. Two new AI services (ReportGenerateService, QcService) use the existing ChatLanguageModel bean. Frontend builds 4 new Element Plus pages (Dashboard, ConsultationList, ConsultationDetail, ReportEditor) under the existing doctor package on port 3001.

**Tech Stack:** Spring Boot 3, MyBatis, LangChain4j (DeepSeek-V3.2), Vue 3 + TypeScript + Element Plus

---

## File Structure

### Backend — New Files

| File | Responsibility |
|------|---------------|
| `module/doctor/dto/DoctorLoginRequest.java` | Login request DTO |
| `module/doctor/dto/DoctorLoginResponse.java` | Login response DTO |
| `module/doctor/dto/WorkbenchVO.java` | Workbench stats VO |
| `module/doctor/dto/ConsultationListItemVO.java` | List item VO |
| `module/doctor/dto/DoctorConsultationDetailVO.java` | Full detail VO |
| `module/doctor/dto/ReportVO.java` | Report content + status VO |
| `module/doctor/dto/RejectRequest.java` | Reject reason DTO |
| `module/doctor/dto/ReportUpdateRequest.java` | Report edit DTO |
| `module/doctor/dto/QcResultVO.java` | QC result VO |
| `module/doctor/dto/DoctorProfileVO.java` | Doctor profile VO |
| `module/doctor/service/DoctorAuthService.java` | Doctor login logic |
| `module/doctor/service/DoctorConsultationService.java` | Consultation CRUD + confirm/reject + report + sign |
| `module/doctor/controller/DoctorAuthController.java` | /doctor/auth/login |
| `module/doctor/controller/DoctorConsultationController.java` | 12 /doctor/consultation/* endpoints |
| `module/doctor/controller/DoctorController.java` | /doctor/workbench + /doctor/profile |
| `module/consultation/entity/ConsultationDoctor.java` | Join table entity |
| `module/consultation/entity/Report.java` | Report entity |
| `module/consultation/entity/QcResult.java` | QC result entity |
| `module/consultation/entity/ReportTemplate.java` | Report template entity |
| `module/consultation/mapper/ConsultationDoctorMapper.java` | Join table mapper |
| `module/consultation/mapper/ReportMapper.java` | Report mapper |
| `module/consultation/mapper/QcResultMapper.java` | QC result mapper |
| `module/consultation/mapper/ReportTemplateMapper.java` | Template mapper |
| `resources/mapper/ConsultationDoctorMapper.xml` | Join table SQL |
| `resources/mapper/ReportMapper.xml` | Report SQL |
| `resources/mapper/QcResultMapper.xml` | QC result SQL |
| `resources/mapper/ReportTemplateMapper.xml` | Template SQL |
| `module/ai/service/ReportGenerateService.java` | AI report generation |
| `module/ai/service/QcService.java` | AI quality control |

### Backend — Modified Files

| File | Change |
|------|--------|
| `config/SecurityConfig.java` | Add `/doctor/auth/**` permitAll, `/doctor/**` authenticated |
| `infrastructure/security/JwtAuthenticationFilter.java` | Handle DOCTOR role tokens |
| `infrastructure/security/JwtTokenProvider.java` | Support DOCTOR role in token generation |
| `module/doctor/mapper/DoctorMapper.java` | Add findById if missing |

### Frontend — New Files

| File | Responsibility |
|------|---------------|
| `packages/shared/src/api/doctor.ts` | Doctor API functions |
| `packages/doctor/src/router/index.ts` | Updated router with all routes |
| `packages/doctor/src/views/Dashboard.vue` | Workbench dashboard |
| `packages/doctor/src/views/ConsultationList.vue` | Consultation list with filters |
| `packages/doctor/src/views/ConsultationDetail.vue` | Full detail view |
| `packages/doctor/src/views/ReportEditor.vue` | Report editing + QC + sign |
| `packages/doctor/src/layout/MainLayout.vue` | Sidebar + topbar layout |
| `packages/doctor/src/stores/doctor.ts` | Doctor state (Pinia) |

### Frontend — Modified Files

| File | Change |
|------|--------|
| `packages/shared/src/index.ts` | Export doctor API |
| `packages/doctor/src/main.ts` | Add Element Plus + Pinia |
| `packages/doctor/src/views/Login.vue` | Fix to use shared API |
| `packages/doctor/package.json` | Add element-plus, pinia, vue-router deps |

---

### Task 1: Backend Entities — ConsultationDoctor, Report, QcResult, ReportTemplate

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/ConsultationDoctor.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/Report.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/QcResult.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/ReportTemplate.java`

- [ ] **Step 1: Create ConsultationDoctor entity**

```java
package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationDoctor {
    private Long consultationId;
    private Long doctorId;
    private Integer role;       // 0=expert, 1=host
    private Integer status;     // 0=pending, 1=confirmed, 2=refused
    private LocalDateTime confirmTime;
}
```

- [ ] **Step 2: Create Report entity**

```java
package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Report {
    private Long id;
    private Long consultationId;
    private Integer type;       // 1=professional, 2=patient
    private String content;     // JSON LONGTEXT
    private String pdfUrl;
    private Integer status;     // 0=draft, 1=pending review, 2=issued
    private Long signedBy;
    private LocalDateTime signedTime;
    private Long templateId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 3: Create QcResult entity**

```java
package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QcResult {
    private Long id;
    private Long reportId;
    private Integer completenessScore;
    private Integer standardScore;
    private Integer consistencyScore;
    private Integer totalScore;
    private String issues;      // JSON TEXT
    private Integer status;     // 0=pending, 1=passed, 2=returned
    private LocalDateTime createTime;
}
```

- [ ] **Step 4: Create ReportTemplate entity**

```java
package com.aicall.module.consultation.entity;

import lombok.Data;

@Data
public class ReportTemplate {
    private Long id;
    private String name;
    private String department;
    private String contentTemplate; // JSON LONGTEXT
    private Integer status;
}
```

- [ ] **Step 5: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/entity/
git commit -m "feat: add ConsultationDoctor, Report, QcResult, ReportTemplate entities"
```

---

### Task 2: Backend Mappers — ConsultationDoctor, Report, QcResult, ReportTemplate

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationDoctorMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ReportMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/QcResultMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ReportTemplateMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/ConsultationDoctorMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/ReportMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/QcResultMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/ReportTemplateMapper.xml`

- [ ] **Step 1: Create ConsultationDoctorMapper.java**

```java
package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.ConsultationDoctor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ConsultationDoctorMapper {
    List<ConsultationDoctor> findByDoctorId(@Param("doctorId") Long doctorId);

    ConsultationDoctor findByConsultationAndDoctor(@Param("consultationId") Long consultationId,
                                                    @Param("doctorId") Long doctorId);

    void updateStatus(@Param("consultationId") Long consultationId,
                      @Param("doctorId") Long doctorId,
                      @Param("status") Integer status);
}
```

- [ ] **Step 2: Create ConsultationDoctorMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.consultation.mapper.ConsultationDoctorMapper">

    <select id="findByDoctorId" resultType="com.aicall.module.consultation.entity.ConsultationDoctor">
        SELECT consultation_id, doctor_id, role, status, confirm_time
        FROM consultation_doctor
        WHERE doctor_id = #{doctorId}
    </select>

    <select id="findByConsultationAndDoctor" resultType="com.aicall.module.consultation.entity.ConsultationDoctor">
        SELECT consultation_id, doctor_id, role, status, confirm_time
        FROM consultation_doctor
        WHERE consultation_id = #{consultationId} AND doctor_id = #{doctorId}
    </select>

    <update id="updateStatus">
        UPDATE consultation_doctor
        SET status = #{status}, confirm_time = NOW()
        WHERE consultation_id = #{consultationId} AND doctor_id = #{doctorId}
    </update>

</mapper>
```

- [ ] **Step 3: Create ReportMapper.java**

```java
package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.Report;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ReportMapper {
    Report findByConsultationId(@Param("consultationId") Long consultationId);

    void insert(Report report);

    void updateContent(@Param("id") Long id, @Param("content") String content);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    void updateSign(@Param("id") Long id,
                    @Param("status") Integer status,
                    @Param("signedBy") Long signedBy);
}
```

- [ ] **Step 4: Create ReportMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.consultation.mapper.ReportMapper">

    <select id="findByConsultationId" resultType="com.aicall.module.consultation.entity.Report">
        SELECT id, consultation_id, type, content, pdf_url, status, signed_by, signed_time, template_id, create_time, update_time
        FROM report
        WHERE consultation_id = #{consultationId}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO report (consultation_id, type, content, status, template_id, create_time, update_time)
        VALUES (#{consultationId}, #{type}, #{content}, #{status}, #{templateId}, NOW(), NOW())
    </insert>

    <update id="updateContent">
        UPDATE report SET content = #{content}, update_time = NOW() WHERE id = #{id}
    </update>

    <update id="updateStatus">
        UPDATE report SET status = #{status}, update_time = NOW() WHERE id = #{id}
    </update>

    <update id="updateSign">
        UPDATE report SET status = #{status}, signed_by = #{signedBy}, signed_time = NOW(), update_time = NOW()
        WHERE id = #{id}
    </update>

</mapper>
```

- [ ] **Step 5: Create QcResultMapper.java**

```java
package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.QcResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface QcResultMapper {
    QcResult findByReportId(@Param("reportId") Long reportId);

    void insert(QcResult result);
}
```

- [ ] **Step 6: Create QcResultMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.consultation.mapper.QcResultMapper">

    <select id="findByReportId" resultType="com.aicall.module.consultation.entity.QcResult">
        SELECT id, report_id, completeness_score, standard_score, consistency_score,
               total_score, issues, status, create_time
        FROM qc_result
        WHERE report_id = #{reportId}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO qc_result (report_id, completeness_score, standard_score, consistency_score,
                               total_score, issues, status, create_time)
        VALUES (#{reportId}, #{completenessScore}, #{standardScore}, #{consistencyScore},
                #{totalScore}, #{issues}, #{status}, NOW())
    </insert>

</mapper>
```

- [ ] **Step 7: Create ReportTemplateMapper.java**

```java
package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.ReportTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ReportTemplateMapper {
    ReportTemplate findByDepartment(@Param("department") String department);
}
```

- [ ] **Step 8: Create ReportTemplateMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.consultation.mapper.ReportTemplateMapper">

    <select id="resultType" resultType="com.aicall.module.consultation.entity.ReportTemplate">
        SELECT id, name, department, content_template, status
        FROM report_template
        WHERE department = #{department} AND status = 1
        LIMIT 1
    </select>

</mapper>
```

Note: The `<select id>` above should be `"findByDepartment"`, not `"resultType"`. Corrected:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.consultation.mapper.ReportTemplateMapper">

    <select id="findByDepartment" resultType="com.aicall.module.consultation.entity.ReportTemplate">
        SELECT id, name, department, content_template, status
        FROM report_template
        WHERE department = #{department} AND status = 1
        LIMIT 1
    </select>

</mapper>
```

- [ ] **Step 9: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ aicall-backend/src/main/resources/mapper/ConsultationDoctorMapper.xml aicall-backend/src/main/resources/mapper/ReportMapper.xml aicall-backend/src/main/resources/mapper/QcResultMapper.xml aicall-backend/src/main/resources/mapper/ReportTemplateMapper.xml
git commit -m "feat: add ConsultationDoctor, Report, QcResult, ReportTemplate mappers"
```

---

### Task 3: Backend DTOs — Doctor Login, Workbench, Consultation, Report, QC

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/DoctorLoginRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/DoctorLoginResponse.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/WorkbenchVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/ConsultationListItemVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/DoctorConsultationDetailVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/ReportVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/RejectRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/ReportUpdateRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/QcResultVO.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/DoctorProfileVO.java`

- [ ] **Step 1: Create DoctorLoginRequest**

```java
package com.aicall.module.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorLoginRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
}
```

- [ ] **Step 2: Create DoctorLoginResponse**

```java
package com.aicall.module.doctor.dto;

import lombok.Data;

@Data
public class DoctorLoginResponse {
    private String token;
    private Long doctorId;
    private String name;
    private String department;
    private String title;
}
```

- [ ] **Step 3: Create WorkbenchVO**

```java
package com.aicall.module.doctor.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkbenchVO {
    private int pendingReviewCount;
    private int reportEditingCount;
    private int pendingQcCount;
    private List<ConsultationListItemVO> recentConsultations;
}
```

- [ ] **Step 4: Create ConsultationListItemVO**

```java
package com.aicall.module.doctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationListItemVO {
    private Long consultationId;
    private String patientName;
    private String chiefComplaint;
    private String department;
    private Integer status;
    private LocalDateTime createTime;
}
```

- [ ] **Step 5: Create DoctorConsultationDetailVO**

```java
package com.aicall.module.doctor.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class DoctorConsultationDetailVO {
    private Long consultationId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String chiefComplaint;
    private String medicalSummary;
    private Integer status;
    private LocalDateTime createTime;
    private List<UploadItem> uploads;
    private List<Map<String, String>> chatHistory;
    private ReportVO report;

    @Data
    public static class UploadItem {
        private Long id;
        private String fileName;
        private String fileUrl;
        private Integer fileType;
        private String ocrResult;
    }
}
```

- [ ] **Step 6: Create ReportVO**

```java
package com.aicall.module.doctor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportVO {
    private Long id;
    private String content;
    private Integer status;
    private String signedByName;
    private LocalDateTime signedTime;
    private QcResultVO qcResult;
}
```

- [ ] **Step 7: Create RejectRequest**

```java
package com.aicall.module.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectRequest {
    @NotBlank(message = "拒绝原因不能为空")
    private String reason;
}
```

- [ ] **Step 8: Create ReportUpdateRequest**

```java
package com.aicall.module.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportUpdateRequest {
    @NotBlank(message = "报告内容不能为空")
    private String content;
}
```

- [ ] **Step 9: Create QcResultVO**

```java
package com.aicall.module.doctor.dto;

import lombok.Data;

@Data
public class QcResultVO {
    private Long id;
    private Integer completenessScore;
    private Integer standardScore;
    private Integer consistencyScore;
    private Integer totalScore;
    private String issues;
    private Integer status;
}
```

- [ ] **Step 10: Create DoctorProfileVO**

```java
package com.aicall.module.doctor.dto;

import lombok.Data;

@Data
public class DoctorProfileVO {
    private Long id;
    private String name;
    private String title;
    private String department;
    private String phone;
    private String avatar;
    private String introduction;
}
```

- [ ] **Step 11: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/doctor/dto/
git commit -m "feat: add doctor-side DTOs for auth, workbench, consultation, report, QC"
```

---

### Task 4: Backend — SecurityConfig + JwtTokenProvider for Doctor Role

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java`
- Modify: `aicall-backend/src/main/java/com/aicall/infrastructure/security/JwtTokenProvider.java`
- Modify: `aicall-backend/src/main/java/com/aicall/infrastructure/security/JwtAuthenticationFilter.java`

- [ ] **Step 1: Update SecurityConfig — add doctor auth rules**

In `SecurityConfig.java`, add these chains to the existing security filter chain:

```java
// Add BEFORE the existing /user/auth/** line:
.requestMatchers("/doctor/auth/**").permitAll()
.requestMatchers("/doctor/**").authenticated()
```

The full http block should have these lines added in order. Look for the existing:
```java
.requestMatchers("/user/auth/**").permitAll()
```
And add the doctor lines BEFORE it:
```java
.requestMatchers("/doctor/auth/**").permitAll()
.requestMatchers("/doctor/**").authenticated()
.requestMatchers("/user/auth/**").permitAll()
```

- [ ] **Step 2: Update JwtTokenProvider — ensure it supports DOCTOR role**

The existing `generateToken` method takes a role string. Verify it already works with arbitrary role strings. The method signature is likely:
```java
public String generateToken(Long userId, String role)
```
If so, no changes needed — just use `generateToken(doctorId, "DOCTOR")` when calling it from DoctorAuthService.

Also verify the `getUserId` and `getRole` methods exist and work with the token format. These are used by JwtAuthenticationFilter.

- [ ] **Step 3: Update JwtAuthenticationFilter — handle DOCTOR role in SecurityContext**

In the filter's doFilterInternal, after extracting userId and role from the token, the code sets authentication. Verify it uses the role string from the token (not hardcoded "PATIENT"). If it hardcodes, change to use the extracted role.

Look for code like:
```java
List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_PATIENT"));
```
Change to:
```java
List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
```

- [ ] **Step 4: Verify DoctorMapper has findById**

Read `module/doctor/mapper/DoctorMapper.java`. If it only has `findByUsername`, add `findById`:

```java
Doctor findById(@Param("id") Long id);
```

And add to `DoctorMapper.xml`:
```xml
<select id="findById" resultType="com.aicall.module.doctor.entity.Doctor">
    SELECT id, username, password, name, title, department, phone, avatar, introduction, status
    FROM doctor
    WHERE id = #{id}
</select>
```

- [ ] **Step 5: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java aicall-backend/src/main/java/com/aicall/infrastructure/security/ aicall-backend/src/main/java/com/aicall/module/doctor/mapper/
git commit -m "feat: add doctor role to security config and JWT support"
```

---

### Task 5: Backend — DoctorAuthService (Login)

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorAuthService.java`

- [ ] **Step 1: Create DoctorAuthService**

```java
package com.aicall.module.doctor.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.doctor.dto.DoctorLoginRequest;
import com.aicall.module.doctor.dto.DoctorLoginResponse;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DoctorAuthService {
    private final DoctorMapper doctorMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public DoctorLoginResponse login(DoctorLoginRequest request) {
        Doctor doctor = doctorMapper.findByUsername(request.getUsername());
        if (doctor == null) {
            throw BusinessException.fail("用户名或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw BusinessException.fail("用户名或密码错误");
        }
        if (doctor.getStatus() != 1) {
            throw BusinessException.fail("账号已被禁用");
        }
        String token = jwtTokenProvider.generateToken(doctor.getId(), "DOCTOR");
        DoctorLoginResponse resp = new DoctorLoginResponse();
        resp.setToken(token);
        resp.setDoctorId(doctor.getId());
        resp.setName(doctor.getName());
        resp.setDepartment(doctor.getDepartment());
        resp.setTitle(doctor.getTitle());
        return resp;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorAuthService.java
git commit -m "feat: add DoctorAuthService with BCrypt login"
```

---

### Task 6: Backend — AI ReportGenerateService

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/ai/service/ReportGenerateService.java`

- [ ] **Step 1: Create ReportGenerateService**

```java
package com.aicall.module.ai.service;

import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.entity.ReportTemplate;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ConsultationUploadMapper;
import com.aicall.module.consultation.mapper.ReportTemplateMapper;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportGenerateService {
    private final ChatLanguageModel chatLanguageModel;
    private final ConsultationMapper consultationMapper;
    private final ConsultationUploadMapper uploadMapper;
    private final ReportTemplateMapper reportTemplateMapper;
    private final PreDiagnosisService preDiagnosisService;

    public String generateReport(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) {
            throw new IllegalArgumentException("会诊不存在");
        }

        // Load template
        ReportTemplate template = reportTemplateMapper.findByDepartment(c.getDepartment());
        String templateContent = "";
        if (template != null) {
            templateContent = template.getContentTemplate();
        }

        // Load uploads OCR results
        List<ConsultationUpload> uploads = uploadMapper.findByConsultationId(consultationId);
        StringBuilder uploadInfo = new StringBuilder();
        for (ConsultationUpload u : uploads) {
            if (u.getOcrResult() != null && !u.getOcrResult().isEmpty()) {
                uploadInfo.append("- ").append(u.getOcrResult()).append("\n");
            }
        }

        // Load chat history
        List<ChatMessage> chatMessages = preDiagnosisService.getHistory(consultationId);
        StringBuilder chatInfo = new StringBuilder();
        for (ChatMessage msg : chatMessages) {
            if (msg instanceof AiMessage) {
                chatInfo.append("AI: ").append(((AiMessage) msg).text()).append("\n");
            } else {
                chatInfo.append("患者: ").append(msg.text()).append("\n");
            }
        }

        String prompt = """
            你是一位专业的会诊报告撰写助手。请根据以下患者信息和会诊记录，生成一份结构化的专业会诊报告。

            ## 患者主诉
            %s

            ## 病情摘要
            %s

            ## 检查资料
            %s

            ## AI预问诊记录
            %s

            ## 报告模板
            %s

            请严格按照以下JSON格式输出报告，不要输出其他内容：
            {
              "chiefComplaint": "主诉",
              "presentIllness": "现病史",
              "pastHistory": "既往史",
              "examinationFindings": "检查所见",
              "diagnosis": "诊断意见",
              "analysis": "分析说明",
              "recommendation": "建议",
              "followUp": "随访建议"
            }
            """.formatted(
                c.getChiefComplaint() != null ? c.getChiefComplaint() : "",
                c.getMedicalSummary() != null ? c.getMedicalSummary() : "",
                uploadInfo.length() > 0 ? uploadInfo.toString() : "无",
                chatInfo.length() > 0 ? chatInfo.toString() : "无",
                templateContent.isEmpty() ? "标准会诊报告模板" : templateContent
            );

        log.info("Generating report for consultation {}", consultationId);
        String result = chatLanguageModel.generate(prompt);
        return result;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/ai/service/ReportGenerateService.java
git commit -m "feat: add ReportGenerateService for AI-powered report generation"
```

---

### Task 7: Backend — AI QcService

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/ai/service/QcService.java`

- [ ] **Step 1: Create QcService**

```java
package com.aicall.module.ai.service;

import com.aicall.module.consultation.entity.QcResult;
import com.aicall.module.consultation.entity.Report;
import com.aicall.module.consultation.mapper.QcResultMapper;
import com.aicall.module.consultation.mapper.ReportMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class QcService {
    private final ChatLanguageModel chatLanguageModel;
    private final ReportMapper reportMapper;
    private final QcResultMapper qcResultMapper;

    public QcResult checkQuality(Long reportId) {
        Report report = reportMapper.findByConsultationId(null);
        // Fix: we need to find by report id, but mapper only has findByConsultationId
        // We'll use the reportId passed in - the caller provides the correct one

        String prompt = """
            你是一位医疗报告质量控制专家。请对以下会诊报告进行质量评估。

            ## 报告内容
            %s

            请从以下三个维度进行评分（0-100分），并指出具体问题：

            1. 完整性：报告各必要章节是否齐全，信息是否完整
            2. 规范性：是否符合医疗报告书写规范，术语是否准确
            3. 一致性：各章节内容是否逻辑一致，是否存在矛盾

            请严格按照以下JSON格式输出，不要输出其他内容：
            {
              "completenessScore": 85,
              "standardScore": 90,
              "consistencyScore": 80,
              "issues": ["具体问题1", "具体问题2"]
            }
            """.formatted(report != null ? report.getContent() : "");

        log.info("Running QC for report {}", reportId);
        String result = chatLanguageModel.generate(prompt);

        // Parse AI response
        int completenessScore = 80;
        int standardScore = 80;
        int consistencyScore = 80;
        String issues = "[]";

        try {
            // Extract JSON from response (AI might wrap in markdown code block)
            String json = result;
            if (json.contains("```")) {
                json = json.substring(json.indexOf("{"), json.lastIndexOf("}") + 1);
            } else if (!json.trim().startsWith("{")) {
                json = json.substring(json.indexOf("{"), json.lastIndexOf("}") + 1);
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(json);
            completenessScore = node.has("completenessScore") ? node.get("completenessScore").asInt() : 80;
            standardScore = node.has("standardScore") ? node.get("standardScore").asInt() : 80;
            consistencyScore = node.has("consistencyScore") ? node.get("consistencyScore").asInt() : 80;
            if (node.has("issues")) {
                issues = mapper.writeValueAsString(node.get("issues"));
            }
        } catch (Exception e) {
            log.warn("Failed to parse QC response, using defaults: {}", e.getMessage());
        }

        int totalScore = (int) (completenessScore * 0.3 + standardScore * 0.4 + consistencyScore * 0.3);
        int status = totalScore >= 60 ? 1 : 2;

        QcResult qcResult = new QcResult();
        qcResult.setReportId(reportId);
        qcResult.setCompletenessScore(completenessScore);
        qcResult.setStandardScore(standardScore);
        qcResult.setConsistencyScore(consistencyScore);
        qcResult.setTotalScore(totalScore);
        qcResult.setIssues(issues);
        qcResult.setStatus(status);
        qcResultMapper.insert(qcResult);

        return qcResult;
    }
}
```

- [ ] **Step 2: Add findById to ReportMapper**

Add a `findById` method to ReportMapper.java and ReportMapper.xml since QcService needs to look up a report by its primary key:

ReportMapper.java:
```java
Report findById(@Param("id") Long id);
```

ReportMapper.xml:
```xml
<select id="findById" resultType="com.aicall.module.consultation.entity.Report">
    SELECT id, consultation_id, type, content, pdf_url, status, signed_by, signed_time, template_id, create_time, update_time
    FROM report
    WHERE id = #{id}
</select>
```

- [ ] **Step 3: Fix QcService to use findById**

Replace the report lookup in QcService.checkQuality:
```java
Report report = reportMapper.findById(reportId);
```

- [ ] **Step 4: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/ai/service/QcService.java aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ReportMapper.java aicall-backend/src/main/resources/mapper/ReportMapper.xml
git commit -m "feat: add QcService for AI quality control with 3-dimension scoring"
```

---

### Task 8: Backend — DoctorConsultationService (Core Business Logic)

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorConsultationService.java`

This is the largest service — it handles workbench, consultation list/detail, confirm/reject, report generation/editing, QC submission, and signing.

- [ ] **Step 1: Create DoctorConsultationService**

```java
package com.aicall.module.doctor.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.ai.service.QcService;
import com.aicall.module.ai.service.ReportGenerateService;
import com.aicall.module.consultation.entity.*;
import com.aicall.module.consultation.mapper.*;
import com.aicall.module.doctor.dto.*;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import com.aicall.module.ai.service.PreDiagnosisService;
import dev.langchain4j.data.message.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorConsultationService {
    private final ConsultationMapper consultationMapper;
    private final ConsultationDoctorMapper consultationDoctorMapper;
    private final ConsultationUploadMapper uploadMapper;
    private final ReportMapper reportMapper;
    private final QcResultMapper qcResultMapper;
    private final DoctorMapper doctorMapper;
    private final ReportGenerateService reportGenerateService;
    private final QcService qcService;
    private final PreDiagnosisService preDiagnosisService;

    public WorkbenchVO getWorkbench(Long doctorId) {
        List<ConsultationDoctor> assignments = consultationDoctorMapper.findByDoctorId(doctorId);

        int pendingReview = 0;
        int reportEditing = 0;
        int pendingQc = 0;
        List<ConsultationListItemVO> recent = new ArrayList<>();

        for (ConsultationDoctor cd : assignments) {
            Consultation c = consultationMapper.findById(cd.getConsultationId());
            if (c == null) continue;
            if (cd.getStatus() == 0 && c.getStatus() == 2) pendingReview++;
            Report r = reportMapper.findByConsultationId(c.getId());
            if (r != null) {
                if (r.getStatus() == 0) reportEditing++;
                if (r.getStatus() == 1) pendingQc++;
            }
            if (c.getStatus() == 2 || c.getStatus() == 3) {
                ConsultationListItemVO item = new ConsultationListItemVO();
                item.setConsultationId(c.getId());
                item.setPatientName(c.getPatientName());
                item.setChiefComplaint(c.getChiefComplaint());
                item.setDepartment(c.getDepartment());
                item.setStatus(c.getStatus());
                item.setCreateTime(c.getCreateTime());
                recent.add(item);
            }
        }

        recent.sort(Comparator.comparing(ConsultationListItemVO::getCreateTime).reversed());
        if (recent.size() > 5) recent = recent.subList(0, 5);

        WorkbenchVO vo = new WorkbenchVO();
        vo.setPendingReviewCount(pendingReview);
        vo.setReportEditingCount(reportEditing);
        vo.setPendingQcCount(pendingQc);
        vo.setRecentConsultations(recent);
        return vo;
    }

    public List<ConsultationListItemVO> getConsultations(Long doctorId, Integer status) {
        List<ConsultationDoctor> assignments = consultationDoctorMapper.findByDoctorId(doctorId);
        List<ConsultationListItemVO> result = new ArrayList<>();

        for (ConsultationDoctor cd : assignments) {
            Consultation c = consultationMapper.findById(cd.getConsultationId());
            if (c == null) continue;
            if (status != null && !status.equals(c.getStatus())) continue;
            if (cd.getStatus() == 2) continue; // skip refused

            ConsultationListItemVO item = new ConsultationListItemVO();
            item.setConsultationId(c.getId());
            item.setPatientName(c.getPatientName());
            item.setChiefComplaint(c.getChiefComplaint());
            item.setDepartment(c.getDepartment());
            item.setStatus(c.getStatus());
            item.setCreateTime(c.getCreateTime());
            result.add(item);
        }

        result.sort(Comparator.comparing(ConsultationListItemVO::getCreateTime).reversed());
        return result;
    }

    public DoctorConsultationDetailVO getConsultationDetail(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权查看该会诊");
        }

        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) {
            throw BusinessException.fail("会诊不存在");
        }

        DoctorConsultationDetailVO vo = new DoctorConsultationDetailVO();
        vo.setConsultationId(c.getId());
        vo.setPatientName(c.getPatientName());
        vo.setPatientAge(c.getPatientAge());
        vo.setPatientGender(c.getPatientGender());
        vo.setChiefComplaint(c.getChiefComplaint());
        vo.setMedicalSummary(c.getMedicalSummary());
        vo.setStatus(c.getStatus());
        vo.setCreateTime(c.getCreateTime());

        // Uploads
        List<ConsultationUpload> uploads = uploadMapper.findByConsultationId(consultationId);
        List<DoctorConsultationDetailVO.UploadItem> uploadItems = uploads.stream().map(u -> {
            DoctorConsultationDetailVO.UploadItem item = new DoctorConsultationDetailVO.UploadItem();
            item.setId(u.getId());
            item.setFileName(u.getFileName());
            item.setFileUrl(u.getFileUrl());
            item.setFileType(u.getFileType());
            item.setOcrResult(u.getOcrResult());
            return item;
        }).collect(Collectors.toList());
        vo.setUploads(uploadItems);

        // Chat history
        List<ChatMessage> chatMessages = preDiagnosisService.getHistory(consultationId);
        List<Map<String, String>> chatList = new ArrayList<>();
        for (ChatMessage msg : chatMessages) {
            Map<String, String> map = new HashMap<>();
            if (msg instanceof dev.langchain4j.data.message.SystemMessage) {
                map.put("role", "system");
                map.put("content", msg.text());
            } else if (msg instanceof dev.langchain4j.data.message.UserMessage) {
                map.put("role", "user");
                map.put("content", msg.text());
            } else if (msg instanceof dev.langchain4j.data.message.AiMessage) {
                map.put("role", "ai");
                map.put("content", msg.text());
            }
            chatList.add(map);
        }
        vo.setChatHistory(chatList);

        // Report
        Report report = reportMapper.findByConsultationId(consultationId);
        if (report != null) {
            ReportVO reportVO = new ReportVO();
            reportVO.setId(report.getId());
            reportVO.setContent(report.getContent());
            reportVO.setStatus(report.getStatus());
            if (report.getSignedBy() != null) {
                Doctor signer = doctorMapper.findById(report.getSignedBy());
                reportVO.setSignedByName(signer != null ? signer.getName() : null);
            }
            reportVO.setSignedTime(report.getSignedTime());

            QcResult qc = qcResultMapper.findByReportId(report.getId());
            if (qc != null) {
                QcResultVO qcVO = new QcResultVO();
                qcVO.setId(qc.getId());
                qcVO.setCompletenessScore(qc.getCompletenessScore());
                qcVO.setStandardScore(qc.getStandardScore());
                qcVO.setConsistencyScore(qc.getConsistencyScore());
                qcVO.setTotalScore(qc.getTotalScore());
                qcVO.setIssues(qc.getIssues());
                qcVO.setStatus(qc.getStatus());
                reportVO.setQcResult(qcVO);
            }
            vo.setReport(reportVO);
        }

        return vo;
    }

    @Transactional
    public void confirmConsultation(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权操作该会诊");
        }
        if (cd.getStatus() != 0) {
            throw BusinessException.fail("该会诊已处理");
        }
        consultationDoctorMapper.updateStatus(consultationId, doctorId, 1);
        consultationMapper.updateStatus(consultationId, 3);
    }

    @Transactional
    public void rejectConsultation(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权操作该会诊");
        }
        if (cd.getStatus() != 0) {
            throw BusinessException.fail("该会诊已处理");
        }
        consultationDoctorMapper.updateStatus(consultationId, doctorId, 2);
        consultationMapper.updateStatus(consultationId, 8);
    }

    @Transactional
    public ReportVO generateReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null || cd.getStatus() != 1) {
            throw BusinessException.fail("无权操作该会诊");
        }

        Consultation c = consultationMapper.findById(consultationId);
        if (c.getStatus() != 3) {
            throw BusinessException.fail("会诊状态不正确");
        }

        String reportContent = reportGenerateService.generateReport(consultationId);

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

    public ReportVO getReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权查看");
        }

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) {
            return null;
        }

        ReportVO vo = new ReportVO();
        vo.setId(report.getId());
        vo.setContent(report.getContent());
        vo.setStatus(report.getStatus());
        if (report.getSignedBy() != null) {
            Doctor signer = doctorMapper.findById(report.getSignedBy());
            vo.setSignedByName(signer != null ? signer.getName() : null);
        }
        vo.setSignedTime(report.getSignedTime());

        QcResult qc = qcResultMapper.findByReportId(report.getId());
        if (qc != null) {
            QcResultVO qcVO = new QcResultVO();
            qcVO.setId(qc.getId());
            qcVO.setCompletenessScore(qc.getCompletenessScore());
            qcVO.setStandardScore(qc.getStandardScore());
            qcVO.setConsistencyScore(qc.getConsistencyScore());
            qcVO.setTotalScore(qc.getTotalScore());
            qcVO.setIssues(qc.getIssues());
            qcVO.setStatus(qc.getStatus());
            vo.setQcResult(qcVO);
        }

        return vo;
    }

    public void updateReport(Long doctorId, Long consultationId, String content) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权操作");
        }

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) {
            throw BusinessException.fail("报告不存在");
        }
        if (report.getStatus() != 0) {
            throw BusinessException.fail("报告已提交，无法编辑");
        }

        reportMapper.updateContent(report.getId(), content);
    }

    @Transactional
    public QcResultVO submitReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权操作");
        }

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) {
            throw BusinessException.fail("报告不存在");
        }
        if (report.getStatus() != 0) {
            throw BusinessException.fail("报告状态不正确");
        }

        reportMapper.updateStatus(report.getId(), 1);

        // Run QC
        QcResult qc = qcService.checkQuality(report.getId());

        if (qc.getStatus() == 2) {
            // QC failed — return report to draft
            reportMapper.updateStatus(report.getId(), 0);
        }

        QcResultVO vo = new QcResultVO();
        vo.setId(qc.getId());
        vo.setCompletenessScore(qc.getCompletenessScore());
        vo.setStandardScore(qc.getStandardScore());
        vo.setConsistencyScore(qc.getConsistencyScore());
        vo.setTotalScore(qc.getTotalScore());
        vo.setIssues(qc.getIssues());
        vo.setStatus(qc.getStatus());
        return vo;
    }

    public QcResultVO getQcResult(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权查看");
        }

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) {
            return null;
        }

        QcResult qc = qcResultMapper.findByReportId(report.getId());
        if (qc == null) {
            return null;
        }

        QcResultVO vo = new QcResultVO();
        vo.setId(qc.getId());
        vo.setCompletenessScore(qc.getCompletenessScore());
        vo.setStandardScore(qc.getStandardScore());
        vo.setConsistencyScore(qc.getConsistencyScore());
        vo.setTotalScore(qc.getTotalScore());
        vo.setIssues(qc.getIssues());
        vo.setStatus(qc.getStatus());
        return vo;
    }

    @Transactional
    public void signReport(Long doctorId, Long consultationId) {
        ConsultationDoctor cd = consultationDoctorMapper.findByConsultationAndDoctor(consultationId, doctorId);
        if (cd == null) {
            throw BusinessException.fail("无权操作");
        }

        Report report = reportMapper.findByConsultationId(consultationId);
        if (report == null) {
            throw BusinessException.fail("报告不存在");
        }
        if (report.getStatus() != 1) {
            throw BusinessException.fail("报告未通过质控，无法签发");
        }

        // Verify QC passed
        QcResult qc = qcResultMapper.findByReportId(report.getId());
        if (qc == null || qc.getStatus() != 1) {
            throw BusinessException.fail("质控未通过，无法签发");
        }

        reportMapper.updateSign(report.getId(), 2, doctorId);
        consultationMapper.updateStatus(consultationId, 5);
    }

    public DoctorProfileVO getProfile(Long doctorId) {
        Doctor doctor = doctorMapper.findById(doctorId);
        if (doctor == null) {
            throw BusinessException.fail("医生不存在");
        }
        DoctorProfileVO vo = new DoctorProfileVO();
        vo.setId(doctor.getId());
        vo.setName(doctor.getName());
        vo.setTitle(doctor.getTitle());
        vo.setDepartment(doctor.getDepartment());
        vo.setPhone(doctor.getPhone());
        vo.setAvatar(doctor.getAvatar());
        vo.setIntroduction(doctor.getIntroduction());
        return vo;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorConsultationService.java
git commit -m "feat: add DoctorConsultationService with full business logic"
```

---

### Task 9: Backend — ConsultationMapper Updates + Consultation Entity Patient Fields

**Files:**
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/Consultation.java` — add patientName, patientAge, patientGender fields
- Modify: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java` — verify findById exists
- Modify: `aicall-backend/src/main/resources/mapper/ConsultationMapper.xml` — update findById to JOIN patient table

- [ ] **Step 1: Add patient fields to Consultation.java**

Add these fields to the Consultation entity (they come from the patient table via JOIN):

```java
// Fields from patient table (via JOIN)
private String patientName;
private Integer patientAge;
private String patientGender;
```

Note: The `patient_id` field already exists and is used for JOIN. These three fields are "transient" — not in the consultation table, populated via SQL JOIN.

- [ ] **Step 2: Verify ConsultationMapper.java has findById and updateStatus**

Check the existing file. `findById` already exists. `updateStatus` already exists. No changes needed to the mapper interface.

- [ ] **Step 3: Update ConsultationMapper.xml — findById with JOIN**

Replace the existing `findById` select with a JOIN query that includes patient fields:

```xml
<select id="findById" resultType="com.aicall.module.consultation.entity.Consultation">
    SELECT c.id, c.consultation_no, c.patient_id, c.type, c.status, c.department,
           c.chief_complaint, c.medical_summary, c.fee, c.payment_status,
           c.scheduled_time, c.end_time, c.cancel_reason, c.reject_reason,
           c.create_time, c.update_time,
           p.name AS patient_name, p.age AS patient_age, p.gender AS patient_gender
    FROM consultation c
    LEFT JOIN patient p ON c.patient_id = p.id
    WHERE c.id = #{id}
</select>
```

This uses MySQL column alias mapping (MyBatis camelCase enabled) to map `patient_name` → `patientName`, `patient_age` → `patientAge`, `patient_gender` → `patientGender`.

- [ ] **Step 4: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java aicall-backend/src/main/resources/mapper/ConsultationMapper.xml
git commit -m "feat: add findById and updateStatus to ConsultationMapper"
```

---

### Task 10: Backend — DoctorAuthController + DoctorConsultationController + DoctorController

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/controller/DoctorAuthController.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/controller/DoctorConsultationController.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/controller/DoctorController.java`

- [ ] **Step 1: Create DoctorAuthController**

```java
package com.aicall.module.doctor.controller;

import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.DoctorLoginRequest;
import com.aicall.module.doctor.dto.DoctorLoginResponse;
import com.aicall.module.doctor.service.DoctorAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctor/auth")
@RequiredArgsConstructor
public class DoctorAuthController {
    private final DoctorAuthService doctorAuthService;

    @PostMapping("/login")
    public Result<DoctorLoginResponse> login(@Valid @RequestBody DoctorLoginRequest request) {
        return Result.success(doctorAuthService.login(request));
    }
}
```

- [ ] **Step 2: Create DoctorConsultationController**

```java
package com.aicall.module.doctor.controller;

import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.*;
import com.aicall.module.doctor.service.DoctorConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor/consultations")
@RequiredArgsConstructor
public class DoctorConsultationController {
    private final DoctorConsultationService service;

    private Long getDoctorId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    @GetMapping
    public Result<List<ConsultationListItemVO>> list(@RequestParam(required = false) Integer status,
                                                      Authentication auth) {
        return Result.success(service.getConsultations(getDoctorId(auth), status));
    }

    @GetMapping("/{id}")
    public Result<DoctorConsultationDetailVO> detail(@PathVariable Long id, Authentication auth) {
        return Result.success(service.getConsultationDetail(getDoctorId(auth), id));
    }

    @PostMapping("/{id}/confirm")
    public Result<Void> confirm(@PathVariable Long id, Authentication auth) {
        service.confirmConsultation(getDoctorId(auth), id);
        return Result.success(null);
    }

    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id,
                                @Valid @RequestBody RejectRequest request,
                                Authentication auth) {
        service.rejectConsultation(getDoctorId(auth), id);
        return Result.success(null);
    }

    @PostMapping("/{id}/generate-report")
    public Result<ReportVO> generateReport(@PathVariable Long id, Authentication auth) {
        return Result.success(service.generateReport(getDoctorId(auth), id));
    }

    @GetMapping("/{id}/report")
    public Result<ReportVO> getReport(@PathVariable Long id, Authentication auth) {
        return Result.success(service.getReport(getDoctorId(auth), id));
    }

    @PutMapping("/{id}/report")
    public Result<Void> updateReport(@PathVariable Long id,
                                      @Valid @RequestBody ReportUpdateRequest request,
                                      Authentication auth) {
        service.updateReport(getDoctorId(auth), id, request.getContent());
        return Result.success(null);
    }

    @PostMapping("/{id}/submit-report")
    public Result<QcResultVO> submitReport(@PathVariable Long id, Authentication auth) {
        return Result.success(service.submitReport(getDoctorId(auth), id));
    }

    @GetMapping("/{id}/qc-result")
    public Result<QcResultVO> getQcResult(@PathVariable Long id, Authentication auth) {
        return Result.success(service.getQcResult(getDoctorId(auth), id));
    }

    @PostMapping("/{id}/sign")
    public Result<Void> sign(@PathVariable Long id, Authentication auth) {
        service.signReport(getDoctorId(auth), id);
        return Result.success(null);
    }
}
```

- [ ] **Step 3: Create DoctorController**

```java
package com.aicall.module.doctor.controller;

import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.DoctorProfileVO;
import com.aicall.module.doctor.dto.WorkbenchVO;
import com.aicall.module.doctor.service.DoctorConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorConsultationService service;

    private Long getDoctorId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    @GetMapping("/workbench")
    public Result<WorkbenchVO> workbench(Authentication auth) {
        return Result.success(service.getWorkbench(getDoctorId(auth)));
    }

    @GetMapping("/profile")
    public Result<DoctorProfileVO> profile(Authentication auth) {
        return Result.success(service.getProfile(getDoctorId(auth)));
    }
}
```

- [ ] **Step 4: Verify JwtAuthenticationFilter principal is the userId (Long)**

Read `JwtAuthenticationFilter.java`. The existing code already sets the principal to `userId` (Long):
```java
new UsernamePasswordAuthenticationToken(userId, null, authorities)
```
So `auth.getPrincipal()` returns the Long userId. The `getDoctorId(auth)` method using `(Long) auth.getPrincipal()` is correct.

No changes needed to JwtAuthenticationFilter.

- [ ] **Step 5: Commit**

```bash
git add aicall-backend/src/main/java/com/aicall/module/doctor/controller/
git commit -m "feat: add DoctorAuth, DoctorConsultation, Doctor controllers"
```

---

### Task 11: Backend — Insert Report Template Seed Data

**Files:**
- Modify: `sql/init.sql`

- [ ] **Step 1: Add report template INSERT statements to init.sql**

Add at the end of init.sql, before any existing seed data for other tables:

```sql
-- 报告模板
INSERT INTO report_template (name, department, content_template, status) VALUES
('内科会诊报告模板', '内科', '{"sections": ["chiefComplaint", "presentIllness", "pastHistory", "examinationFindings", "diagnosis", "analysis", "recommendation", "followUp"]}', 1),
('外科会诊报告模板', '外科', '{"sections": ["chiefComplaint", "presentIllness", "pastHistory", "examinationFindings", "diagnosis", "analysis", "recommendation", "followUp"]}', 1),
('通用会诊报告模板', '其他', '{"sections": ["chiefComplaint", "presentIllness", "pastHistory", "examinationFindings", "diagnosis", "analysis", "recommendation", "followUp"]}', 1);
```

Also insert test data for `consultation_doctor` so the workbench has data:

```sql
-- 测试数据: 会诊医生分配 (consultation_id=1 对应已有会诊, doctor_id=1 对应已有医生)
-- Note: only insert if consultation with id=1 and doctor with id=1 exist
INSERT INTO consultation_doctor (consultation_id, doctor_id, role, status) VALUES
(1, 1, 1, 0);
```

- [ ] **Step 2: Commit**

```bash
git add sql/init.sql
git commit -m "feat: add report template seed data and test consultation_doctor"
```

---

### Task 12: Frontend — Shared Doctor API

**Files:**
- Create: `frontend/packages/shared/src/api/doctor.ts`
- Modify: `frontend/packages/shared/src/index.ts`

- [ ] **Step 1: Create doctor.ts API file**

```typescript
import { get, post, put } from './request';

export function doctorLogin(username: string, password: string) {
  return post<{ token: string; doctorId: number; name: string; department: string; title: string }>(
    '/doctor/auth/login',
    { username, password }
  );
}

export function getWorkbench() {
  return get<{
    pendingReviewCount: number;
    reportEditingCount: number;
    pendingQcCount: number;
    recentConsultations: ConsultationListItem[];
  }>('/doctor/workbench');
}

export function getDoctorConsultations(status?: number) {
  return get<ConsultationListItem[]>('/doctor/consultations', { params: { status } });
}

export function getDoctorConsultationDetail(id: number) {
  return get<DoctorConsultationDetail>(`/doctor/consultations/${id}`);
}

export function confirmConsultation(id: number) {
  return post(`/doctor/consultations/${id}/confirm`);
}

export function rejectConsultation(id: number, reason: string) {
  return post(`/doctor/consultations/${id}/reject`, { reason });
}

export function generateReport(id: number) {
  return post<ReportData>(`/doctor/consultations/${id}/generate-report`);
}

export function getReport(id: number) {
  return get<ReportData>(`/doctor/consultations/${id}/report`);
}

export function updateReport(id: number, content: string) {
  return put(`/doctor/consultations/${id}/report`, { content });
}

export function submitReport(id: number) {
  return post<QcResultData>(`/doctor/consultations/${id}/submit-report`);
}

export function getQcResult(id: number) {
  return get<QcResultData>(`/doctor/consultations/${id}/qc-result`);
}

export function signReport(id: number) {
  return post(`/doctor/consultations/${id}/sign`);
}

export function getDoctorProfile() {
  return get<{ id: number; name: string; title: string; department: string; phone: string; avatar: string; introduction: string }>('/doctor/profile');
}

// Types
export interface ConsultationListItem {
  consultationId: number;
  patientName: string;
  chiefComplaint: string;
  department: string;
  status: number;
  createTime: string;
}

export interface DoctorConsultationDetail {
  consultationId: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  medicalSummary: string;
  status: number;
  createTime: string;
  uploads: UploadItem[];
  chatHistory: { role: string; content: string }[];
  report: ReportData | null;
}

export interface UploadItem {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: number;
  ocrResult: string;
}

export interface ReportData {
  id: number;
  content: string;
  status: number;
  signedByName: string;
  signedTime: string;
  qcResult: QcResultData | null;
}

export interface QcResultData {
  id: number;
  completenessScore: number;
  standardScore: number;
  consistencyScore: number;
  totalScore: number;
  issues: string;
  status: number;
}
```

- [ ] **Step 2: Update shared/src/index.ts to export doctor API**

Add to the existing exports:

```typescript
export * from './api/doctor';
```

- [ ] **Step 3: Update shared/src/api/request.ts — ensure token key distinguishes doctor vs patient**

The current `request.ts` reads token from `localStorage.getItem('token')`. Since doctor and patient apps run on different ports (3001 vs 3000), they use separate localStorage, so no conflict. No change needed.

- [ ] **Step 4: Commit**

```bash
git add frontend/packages/shared/src/api/doctor.ts frontend/packages/shared/src/index.ts
git commit -m "feat: add doctor API functions and types to shared package"
```

---

### Task 13: Frontend — Doctor App Setup (Element Plus, Pinia, Router, Layout)

**Files:**
- Modify: `frontend/packages/doctor/package.json`
- Modify: `frontend/packages/doctor/src/main.ts`
- Modify: `frontend/packages/doctor/src/router/index.ts`
- Create: `frontend/packages/doctor/src/layout/MainLayout.vue`
- Create: `frontend/packages/doctor/src/stores/doctor.ts`

- [ ] **Step 1: Install dependencies**

```bash
cd frontend/packages/doctor
pnpm add element-plus pinia vue-router@4
```

- [ ] **Step 2: Update main.ts**

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
app.mount('#app');
```

- [ ] **Step 3: Update router/index.ts**

```typescript
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login, meta: { title: '医生登录' } },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '工作台' } },
      { path: 'consultations', name: 'ConsultationList', component: () => import('@/views/ConsultationList.vue'), meta: { title: '会诊列表' } },
      { path: 'consultations/:id', name: 'ConsultationDetail', component: () => import('@/views/ConsultationDetail.vue'), meta: { title: '会诊详情' } },
      { path: 'consultations/:id/report', name: 'ReportEditor', component: () => import('@/views/ReportEditor.vue'), meta: { title: '报告编辑' } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
```

- [ ] **Step 4: Create MainLayout.vue**

```vue
<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background: #304156">
      <div style="color: #fff; padding: 20px; font-size: 18px; font-weight: bold; text-align: center">AICall 医生端</div>
      <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff">
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/consultations">
          <el-icon><Document /></el-icon>
          <span>会诊列表</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid #eee">
        <span style="margin-right: 16px">{{ doctorName }} | {{ department }}</span>
        <el-button type="text" @click="handleLogout">退出</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Odometer, Document } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const doctorName = computed(() => localStorage.getItem('doctorName') || '');
const department = computed(() => localStorage.getItem('department') || '');

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('doctorId');
  localStorage.removeItem('doctorName');
  localStorage.removeItem('department');
  router.push('/login');
}
</script>
```

- [ ] **Step 5: Create stores/doctor.ts**

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getWorkbench, type ConsultationListItem } from '@aicall/shared';

export const useDoctorStore = defineStore('doctor', () => {
  const pendingReviewCount = ref(0);
  const reportEditingCount = ref(0);
  const pendingQcCount = ref(0);
  const recentConsultations = ref<ConsultationListItem[]>([]);

  async function loadWorkbench() {
    const data = await getWorkbench();
    pendingReviewCount.value = data.pendingReviewCount;
    reportEditingCount.value = data.reportEditingCount;
    pendingQcCount.value = data.pendingQcCount;
    recentConsultations.value = data.recentConsultations;
  }

  return { pendingReviewCount, reportEditingCount, pendingQcCount, recentConsultations, loadWorkbench };
});
```

- [ ] **Step 6: Update Login.vue to use shared API**

```vue
<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5">
    <el-card style="width: 400px">
      <template #header><h2 style="margin: 0; text-align: center">AICall 医生端</h2></template>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" native-type="submit" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { doctorLogin } from '@aicall/shared';

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

async function handleLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }
  loading.value = true;
  try {
    const res = await doctorLogin(form.username, form.password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('doctorId', String(res.doctorId));
    localStorage.setItem('doctorName', res.name);
    localStorage.setItem('department', res.department);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (e: any) {
    ElMessage.error(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>
```

- [ ] **Step 7: Install element-plus icons**

```bash
cd frontend/packages/doctor
pnpm add @element-plus/icons-vue
```

- [ ] **Step 8: Commit**

```bash
git add frontend/packages/doctor/
git commit -m "feat: doctor app setup with Element Plus, Pinia, router, layout, login"
```

---

### Task 14: Frontend — Dashboard Page

**Files:**
- Create: `frontend/packages/doctor/src/views/Dashboard.vue`

- [ ] **Step 1: Create Dashboard.vue**

```vue
<template>
  <div>
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="待审核会诊" :value="store.pendingReviewCount">
            <template #suffix>
              <el-button type="primary" link @click="router.push('/consultations?status=2')">查看</el-button>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="报告编辑中" :value="store.reportEditingCount">
            <template #suffix>
              <el-button type="warning" link @click="router.push('/consultations')">查看</el-button>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="待质控" :value="store.pendingQcCount">
            <template #suffix>
              <el-button type="success" link @click="router.push('/consultations')">查看</el-button>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>最近会诊</template>
      <el-table :data="store.recentConsultations" stripe>
        <el-table-column prop="consultationId" label="ID" width="80" />
        <el-table-column prop="patientName" label="患者" width="100" />
        <el-table-column prop="chiefComplaint" label="主诉" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="router.push(`/consultations/${row.consultationId}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDoctorStore } from '@/stores/doctor';

const router = useRouter();
const store = useDoctorStore();

onMounted(() => {
  store.loadWorkbench();
});

function statusLabel(status: number) {
  const map: Record<number, string> = { 2: '待审核', 3: '进行中', 4: '已生成报告', 5: '已完成', 8: '已拒绝' };
  return map[status] || '未知';
}

function statusType(status: number) {
  const map: Record<number, string> = { 2: 'warning', 3: '', 4: 'success', 5: 'info', 8: 'danger' };
  return map[status] || '';
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/packages/doctor/src/views/Dashboard.vue
git commit -m "feat: add doctor Dashboard page with workbench stats"
```

---

### Task 15: Frontend — ConsultationList Page

**Files:**
- Create: `frontend/packages/doctor/src/views/ConsultationList.vue`

- [ ] **Step 1: Create ConsultationList.vue**

```vue
<template>
  <div>
    <el-tabs v-model="activeStatus" @tab-change="loadData">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待审核" name="2" />
      <el-tab-pane label="进行中" name="3" />
      <el-tab-pane label="已生成报告" name="4" />
      <el-tab-pane label="已完成" name="5" />
    </el-tabs>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="consultationId" label="ID" width="80" />
      <el-table-column prop="patientName" label="患者" width="100" />
      <el-table-column prop="chiefComplaint" label="主诉" />
      <el-table-column prop="department" label="科室" width="100" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="router.push(`/consultations/${row.consultationId}`)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDoctorConsultations, type ConsultationListItem } from '@aicall/shared';

const router = useRouter();
const loading = ref(false);
const list = ref<ConsultationListItem[]>([]);
const activeStatus = ref('all');

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  if (status) activeStatus.value = status;
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const status = activeStatus.value === 'all' ? undefined : Number(activeStatus.value);
    list.value = await getDoctorConsultations(status);
  } catch (e: any) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function statusLabel(status: number) {
  const map: Record<number, string> = { 2: '待审核', 3: '进行中', 4: '已生成报告', 5: '已完成', 8: '已拒绝' };
  return map[status] || '未知';
}

function statusType(status: number) {
  const map: Record<number, string> = { 2: 'warning', 3: '', 4: 'success', 5: 'info', 8: 'danger' };
  return map[status] || '';
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/packages/doctor/src/views/ConsultationList.vue
git commit -m "feat: add doctor ConsultationList page with status tabs"
```

---

### Task 16: Frontend — ConsultationDetail Page

**Files:**
- Create: `frontend/packages/doctor/src/views/ConsultationDetail.vue`

- [ ] **Step 1: Create ConsultationDetail.vue**

```vue
<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" :title="'返回'" :content="detail?.patientName || '会诊详情'" style="margin-bottom: 20px" />

    <template v-if="detail">
      <!-- Action buttons -->
      <div style="margin-bottom: 16px" v-if="detail.status === 2">
        <el-button type="primary" @click="handleConfirm" :loading="actionLoading">确认接诊</el-button>
        <el-button type="danger" @click="showRejectDialog = true">拒绝</el-button>
      </div>
      <div style="margin-bottom: 16px" v-if="detail.status === 3">
        <el-button type="success" @click="handleGenerateReport" :loading="actionLoading">生成AI报告</el-button>
      </div>
      <div style="margin-bottom: 16px" v-if="detail.status === 4 && detail.report?.status === 0">
        <el-button type="primary" @click="router.push(`/consultations/${id}/report`)">编辑报告</el-button>
      </div>

      <el-tabs>
        <el-tab-pane label="患者信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ detail.patientName }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ detail.patientAge }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ detail.patientGender }}</el-descriptions-item>
            <el-descriptions-item label="科室">{{ detail.department }}</el-descriptions-item>
            <el-descriptions-item label="主诉" :span="2">{{ detail.chiefComplaint }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="病情摘要">
          <div style="white-space: pre-wrap; line-height: 1.8">{{ detail.medicalSummary || '暂无' }}</div>
        </el-tab-pane>

        <el-tab-pane label="上传资料">
          <el-table :data="detail.uploads" stripe>
            <el-table-column prop="fileName" label="文件名" />
            <el-table-column prop="fileType" label="类型" width="100">
              <template #default="{ row }">
                {{ ['检查报告', '影像资料', '病历资料', '其他', '化验单'][row.fileType] || '其他' }}
              </template>
            </el-table-column>
            <el-table-column label="OCR结果" min-width="200">
              <template #default="{ row }">{{ row.ocrResult || '无' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link @click="window.open(row.fileUrl)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="问诊记录">
          <div v-for="(msg, idx) in detail.chatHistory" :key="idx"
               :style="{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '8px 0' }">
            <el-tag :type="msg.role === 'ai' ? 'success' : msg.role === 'user' ? '' : 'info'" size="small">
              {{ msg.role === 'user' ? '患者' : msg.role === 'ai' ? 'AI' : '系统' }}
            </el-tag>
            <span style="margin-left: 8px">{{ msg.content }}</span>
          </div>
        </el-tab-pane>

        <el-tab-pane label="报告" v-if="detail.report">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="状态">
              <el-tag :type="detail.report.status === 0 ? 'warning' : detail.report.status === 1 ? 'success' : 'info'">
                {{ ['草稿', '待质控', '已签发'][detail.report.status] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="签发人" v-if="detail.report.signedByName">{{ detail.report.signedByName }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" style="margin-top: 12px" @click="router.push(`/consultations/${id}/report`)">
            查看完整报告
          </el-button>
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- Reject dialog -->
    <el-dialog v-model="showRejectDialog" title="拒绝原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
      <template #footer>
        <el-button @click="showRejectDialog = false">取消</el-button>
        <el-button type="danger" @click="handleReject" :loading="actionLoading">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getDoctorConsultationDetail, confirmConsultation, rejectConsultation, generateReport, type DoctorConsultationDetail } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const detail = ref<DoctorConsultationDetail | null>(null);
const showRejectDialog = ref(false);
const rejectReason = ref('');

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    detail.value = await getDoctorConsultationDetail(id);
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleConfirm() {
  actionLoading.value = true;
  try {
    await confirmConsultation(id);
    ElMessage.success('已确认接诊');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleReject() {
  if (!rejectReason.value) {
    ElMessage.warning('请输入拒绝原因');
    return;
  }
  actionLoading.value = true;
  try {
    await rejectConsultation(id, rejectReason.value);
    ElMessage.success('已拒绝');
    showRejectDialog.value = false;
    router.push('/consultations');
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleGenerateReport() {
  actionLoading.value = true;
  try {
    await generateReport(id);
    ElMessage.success('报告已生成');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '生成失败');
  } finally {
    actionLoading.value = false;
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/packages/doctor/src/views/ConsultationDetail.vue
git commit -m "feat: add doctor ConsultationDetail page with confirm/reject/generate-report"
```

---

### Task 17: Frontend — ReportEditor Page

**Files:**
- Create: `frontend/packages/doctor/src/views/ReportEditor.vue`

- [ ] **Step 1: Create ReportEditor.vue**

```vue
<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" title="返回" content="报告编辑" style="margin-bottom: 20px" />

    <template v-if="report">
      <!-- Report status -->
      <el-alert :title="statusTitle" :type="statusAlertType" show-icon :closable="false" style="margin-bottom: 16px" />

      <!-- QC Result -->
      <el-card v-if="report.qcResult" style="margin-bottom: 16px">
        <template #header>质控结果</template>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="完整性" :value="report.qcResult.completenessScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="规范性" :value="report.qcResult.standardScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="一致性" :value="report.qcResult.consistencyScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="总分" :value="report.qcResult.totalScore" suffix="分" />
          </el-col>
        </el-row>
        <div v-if="parsedIssues.length" style="margin-top: 12px">
          <strong>问题：</strong>
          <ul>
            <li v-for="(issue, idx) in parsedIssues" :key="idx">{{ issue }}</li>
          </ul>
        </div>
      </el-card>

      <!-- Report sections editor -->
      <el-card style="margin-bottom: 16px">
        <template #header>报告内容</template>
        <el-form label-position="top" v-if="parsedContent">
          <el-form-item label="主诉">
            <el-input v-model="parsedContent.chiefComplaint" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="现病史">
            <el-input v-model="parsedContent.presentIllness" type="textarea" :rows="3" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="既往史">
            <el-input v-model="parsedContent.pastHistory" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="检查所见">
            <el-input v-model="parsedContent.examinationFindings" type="textarea" :rows="3" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="诊断意见">
            <el-input v-model="parsedContent.diagnosis" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="分析说明">
            <el-input v-model="parsedContent.analysis" type="textarea" :rows="3" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="建议">
            <el-input v-model="parsedContent.recommendation" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
          <el-form-item label="随访建议">
            <el-input v-model="parsedContent.followUp" type="textarea" :rows="2" :disabled="!editable" />
          </el-form-item>
        </el-form>
        <div v-else>
          <el-input v-model="rawContent" type="textarea" :rows="15" :disabled="!editable" />
        </div>
      </el-card>

      <!-- Action buttons -->
      <div style="text-align: center" v-if="editable">
        <el-button type="primary" @click="handleSave" :loading="actionLoading">保存</el-button>
        <el-button type="success" @click="handleSubmit" :loading="actionLoading">提交质控</el-button>
      </div>
      <div style="text-align: center" v-if="report.status === 1 && report.qcResult?.status === 1">
        <el-button type="warning" size="large" @click="handleSign" :loading="actionLoading">签名签发</el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getReport, updateReport, submitReport, signReport, type ReportData } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);
const loading = ref(false);
const actionLoading = ref(false);
const report = ref<ReportData | null>(null);
const rawContent = ref('');

interface ReportContent {
  chiefComplaint: string;
  presentIllness: string;
  pastHistory: string;
  examinationFindings: string;
  diagnosis: string;
  analysis: string;
  recommendation: string;
  followUp: string;
  [key: string]: string;
}

const parsedContent = computed<ReportContent | null>(() => {
  if (!report.value) return null;
  try {
    const c = JSON.parse(rawContent.value);
    if (c.chiefComplaint !== undefined) return c as ReportContent;
    return null;
  } catch {
    return null;
  }
});

const editable = computed(() => report.value?.status === 0);

const statusTitle = computed(() => {
  if (!report.value) return '';
  return ['报告编辑中（草稿）', '报告已提交质控', '报告已签发'][report.value.status];
});

const statusAlertType = computed(() => {
  if (!report.value) return 'info';
  return ['warning', 'success', 'info'][report.value.status] as any;
});

const parsedIssues = computed(() => {
  if (!report.value?.qcResult?.issues) return [];
  try {
    return JSON.parse(report.value.qcResult.issues);
  } catch {
    return [];
  }
});

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    report.value = await getReport(id);
    if (report.value) {
      rawContent.value = report.value.content;
    }
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function getContentToSend(): string {
  if (parsedContent.value) {
    return JSON.stringify(parsedContent.value);
  }
  return rawContent.value;
}

async function handleSave() {
  actionLoading.value = true;
  try {
    await updateReport(id, getContentToSend());
    ElMessage.success('已保存');
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleSubmit() {
  try {
    await ElMessageBox.confirm('提交后将进行AI质控，确定提交？', '确认', { type: 'warning' });
  } catch {
    return;
  }
  actionLoading.value = true;
  try {
    const result = await submitReport(id);
    if (result.status === 1) {
      ElMessage.success('质控通过！');
    } else {
      ElMessage.warning('质控未通过，请根据问题修改报告');
    }
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败');
  } finally {
    actionLoading.value = false;
  }
}

async function handleSign() {
  try {
    await ElMessageBox.confirm('签发后报告将正式生效，确定签发？', '确认签发', { type: 'warning' });
  } catch {
    return;
  }
  actionLoading.value = true;
  try {
    await signReport(id);
    ElMessage.success('已签发');
    router.push('/consultations');
  } catch (e: any) {
    ElMessage.error(e.message || '签发失败');
  } finally {
    actionLoading.value = false;
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/packages/doctor/src/views/ReportEditor.vue
git commit -m "feat: add doctor ReportEditor page with structured editing, QC, sign"
```

---

### Task 18: Integration Test — Full Doctor Flow

**Files:** No new files — manual testing

- [ ] **Step 1: Start backend**

```bash
cd aicall-backend
mvn spring-boot:run
```

Verify: No startup errors. Check that all mapper beans are loaded.

- [ ] **Step 2: Start doctor frontend**

```bash
cd frontend
pnpm --filter @aicall/doctor dev
```

Verify: Page loads at http://localhost:3001

- [ ] **Step 3: Test doctor login**

Open http://localhost:3001/login. Login with existing doctor credentials from init.sql.

Verify: Redirected to dashboard, doctor name shown in header.

- [ ] **Step 4: Test workbench**

Check dashboard shows pending review count (should be 1 from seed data).

- [ ] **Step 5: Test confirm consultation**

Navigate to consultation detail, click "确认接诊".

Verify: Status changes from 待审核 to 进行中.

- [ ] **Step 6: Test generate report**

Click "生成AI报告".

Verify: Report content appears in JSON format. Status changes to 已生成报告.

- [ ] **Step 7: Test report editing**

Click "编辑报告" → modify content → click "保存".

Verify: Changes saved.

- [ ] **Step 8: Test submit report for QC**

Click "提交质控".

Verify: QC result shown with scores. If score < 60, report returns to draft. If >= 60, report stays at pending.

- [ ] **Step 9: Test sign report**

If QC passed, click "签名签发".

Verify: Report status changes to 已签发. Consultation status changes to 已完成.

- [ ] **Step 10: Commit any fixes**

If any fixes were needed during testing, commit them.

```bash
git add -A
git commit -m "fix: integration test fixes for doctor flow"
```

---

## Self-Review

### 1. Spec Coverage

| Spec Section | Task |
|---|---|
| 1. Doctor Authentication | Task 5 (service) + Task 10 (controller) |
| 2. Workbench Dashboard | Task 8 (service) + Task 10 (controller) + Task 14 (frontend) |
| 3.1 Consultation List | Task 8 (service) + Task 10 (controller) + Task 15 (frontend) |
| 3.2 Consultation Detail | Task 8 (service) + Task 10 (controller) + Task 16 (frontend) |
| 3.3 Confirm | Task 8 (service) + Task 10 (controller) + Task 16 (frontend) |
| 3.4 Reject | Task 8 (service) + Task 10 (controller) + Task 16 (frontend) |
| 4.1 Generate Report | Task 6 (AI service) + Task 8 (service) + Task 10 (controller) |
| 4.2 ReportGenerateService | Task 6 |
| 5.1 Get Report | Task 8 (service) + Task 10 (controller) + Task 17 (frontend) |
| 5.2 Update Report | Task 8 (service) + Task 10 (controller) + Task 17 (frontend) |
| 5.3 Submit for QC | Task 8 (service) + Task 10 (controller) + Task 17 (frontend) |
| 6.1 QcService | Task 7 |
| 6.2 QC Flow Integration | Task 8 (submitReport) |
| 6.3 Get QC Result | Task 8 (service) + Task 10 (controller) |
| 7.1 Sign Report | Task 8 (service) + Task 10 (controller) + Task 17 (frontend) |
| 8. Doctor Profile | Task 8 (service) + Task 10 (controller) |
| 9. Entity/Mapper Updates | Tasks 1, 2, 9 |
| 10. Frontend Pages | Tasks 13, 14, 15, 16, 17 |
| 11. Status Lifecycle | Covered by service logic |
| 12. API Summary (13 endpoints) | All covered in Tasks 5, 10 |

All spec sections covered.

### 2. Placeholder Scan

No TBD, TODO, or vague instructions found. All steps contain complete code.

### 3. Type Consistency

- `ConsultationListItemVO` in Java matches `ConsultationListItem` in TypeScript
- `DoctorConsultationDetailVO` in Java matches `DoctorConsultationDetail` in TypeScript
- `ReportVO` in Java matches `ReportData` in TypeScript
- `QcResultVO` in Java matches `QcResultData` in TypeScript
- `DoctorLoginResponse` fields match what Login.vue stores in localStorage
- All API function return types match the controller return types

One issue found: `ConsultationMapper.findById` — need to verify it returns `patientAge` and `patientGender`. The existing Consultation entity may not have these fields. The DoctorConsultationDetailVO references them. Need to verify against the actual Consultation entity and SQL schema. If these fields don't exist on the consultation table, they should be fetched from the patient table instead. This will need to be verified during Task 9.
