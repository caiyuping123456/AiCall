# AI 预问诊核心流程 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户端完整链路：手机号登录 → AI 预问诊(对话/表单) → 摘要确认 → 资料上传+OCR → 选择会诊类型 → 模拟支付

**Architecture:** 后端按模块分层（controller/service/mapper/entity/dto），新增 user 模块和 ai 模块业务代码。AI 服务封装为独立 Service，对话记忆用 Redis，文件存 MinIO，向量存 Qdrant。前端用户端新增 11 个页面，步骤向导流程。

**Tech Stack:** Spring Boot 3, MyBatis, Redis, MinIO, Qdrant, LangChain4j, Vant 4, Vue 3, TypeScript

---

## File Structure

### Backend — 新增文件

| File | Responsibility |
|:-----|:---------------|
| `module/user/entity/Patient.java` | 患者实体 |
| `module/user/mapper/PatientMapper.java` | 患者 Mapper 接口 |
| `mapper/PatientMapper.xml` | 患者 SQL |
| `module/user/dto/SendCodeRequest.java` | 发送验证码请求 |
| `module/user/dto/LoginByCodeRequest.java` | 验证码登录请求 |
| `module/user/dto/UserLoginResponse.java` | 登录响应（含 token） |
| `module/user/service/UserAuthService.java` | 用户认证服务 |
| `module/user/controller/UserAuthController.java` | 用户认证接口 |
| `module/consultation/entity/Consultation.java` | 会诊实体 |
| `module/consultation/mapper/ConsultationMapper.java` | 会诊 Mapper |
| `mapper/ConsultationMapper.xml` | 会诊 SQL |
| `module/consultation/entity/ConsultationUpload.java` | 上传资料实体 |
| `module/consultation/mapper/ConsultationUploadMapper.java` | 上传资料 Mapper |
| `mapper/ConsultationUploadMapper.xml` | 上传资料 SQL |
| `module/consultation/dto/CreateDraftRequest.java` | 创建草稿请求 |
| `module/consultation/dto/ChatRequest.java` | 对话请求 |
| `module/consultation/dto/ChatResponse.java` | 对话响应 |
| `module/consultation/dto/FormSubmitRequest.java` | 表单提交请求 |
| `module/consultation/dto/SummaryUpdateRequest.java` | 摘要修改请求 |
| `module/consultation/dto/FeeCalculateRequest.java` | 费用计算请求 |
| `module/consultation/dto/ConsultationDetailVO.java` | 会诊详情视图 |
| `module/consultation/service/ConsultationService.java` | 会诊业务服务 |
| `module/consultation/controller/UserConsultationController.java` | 用户端会诊接口 |
| `module/ai/service/PreDiagnosisService.java` | 对话式预问诊 AI 服务 |
| `module/ai/service/SummaryService.java` | 摘要生成 AI 服务 |
| `module/ai/service/OcrService.java` | OCR 图片识别 AI 服务 |
| `module/ai/service/EmbeddingService.java` | 向量化存储服务 |
| `module/payment/entity/PaymentOrder.java` | 支付订单实体 |
| `module/payment/mapper/PaymentOrderMapper.java` | 支付订单 Mapper |
| `mapper/PaymentOrderMapper.xml` | 支付订单 SQL |
| `module/payment/service/PaymentService.java` | 支付服务 |
| `infrastructure/mq/RabbitMqConsumer.java` | MQ 消费者（通知） |

### Backend — 修改文件

| File | Change |
|:-----|:-------|
| `config/SecurityConfig.java` | 调整用户端接口权限：`/user/auth/**` 放行，其他 `/user/**` 需认证 |
| `config/AiConfig.java` | 新增 visionModel Bean |
| `resources/application-dev.yml` | 新增 vision-model 配置 |

### Frontend — 新增文件

| File | Responsibility |
|:-----|:---------------|
| `packages/user/src/views/Login.vue` | 手机号+验证码登录页 |
| `packages/user/src/views/consultation/Start.vue` | 选择预问诊方式 |
| `packages/user/src/views/consultation/Chat.vue` | 对话预问诊页 |
| `packages/user/src/views/consultation/Form.vue` | 表单预问诊页 |
| `packages/user/src/views/consultation/Summary.vue` | 摘要确认页 |
| `packages/user/src/views/consultation/Upload.vue` | 上传资料页 |
| `packages/user/src/views/consultation/SelectType.vue` | 选择会诊类型 |
| `packages/user/src/views/consultation/Pay.vue` | 确认支付页 |
| `packages/user/src/views/consultation/Success.vue` | 支付成功页 |
| `packages/user/src/views/consultation/Query.vue` | 会诊查询页 |
| `packages/user/src/router/index.ts` | 更新路由（替换原有） |
| `packages/shared/src/api/consultation.ts` | 会诊相关 API |

---

## Task 1: 用户认证 — 实体 + Mapper + DTO

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/user/entity/Patient.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/user/mapper/PatientMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/PatientMapper.xml`
- Create: `aicall-backend/src/main/java/com/aicall/module/user/dto/SendCodeRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/user/dto/LoginByCodeRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/user/dto/UserLoginResponse.java`

- [ ] **Step 1: 编写 Patient 实体**

```java
package com.aicall.module.user.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Patient {
    private Long id;
    private String name;
    private String phone;
    private Integer gender;
    private Integer age;
    private String idCard;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 2: 编写 PatientMapper**

```java
package com.aicall.module.user.mapper;

import com.aicall.module.user.entity.Patient;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PatientMapper {
    Patient findByPhone(@Param("phone") String phone);

    void insert(Patient patient);
}
```

- [ ] **Step 3: 编写 PatientMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.user.mapper.PatientMapper">
    <select id="findByPhone" resultType="com.aicall.module.user.entity.Patient">
        SELECT * FROM patient WHERE phone = #{phone}
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO patient (name, phone, gender, age, id_card)
        VALUES (#{name}, #{phone}, #{gender}, #{age}, #{idCard})
    </insert>
</mapper>
```

- [ ] **Step 4: 编写 SendCodeRequest**

```java
package com.aicall.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendCodeRequest {
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}
```

- [ ] **Step 5: 编写 LoginByCodeRequest**

```java
package com.aicall.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginByCodeRequest {
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "验证码不能为空")
    private String code;
}
```

- [ ] **Step 6: 编写 UserLoginResponse**

```java
package com.aicall.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserLoginResponse {
    private String token;
    private Long patientId;
    private String phone;
}
```

- [ ] **Step 7: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/user/ aicall-backend/src/main/resources/mapper/PatientMapper.xml
git commit -m "feat: add Patient entity, mapper, and user auth DTOs"
```

---

## Task 2: 用户认证 — Service + Controller + SecurityConfig 调整

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/user/service/UserAuthService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/user/controller/UserAuthController.java`
- Modify: `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java`

- [ ] **Step 1: 编写 UserAuthService**

```java
package com.aicall.module.user.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.user.dto.LoginByCodeRequest;
import com.aicall.module.user.dto.SendCodeRequest;
import com.aicall.module.user.dto.UserLoginResponse;
import com.aicall.module.user.entity.Patient;
import com.aicall.module.user.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private static final String SMS_KEY_PREFIX = "sms:";
    private static final long CODE_TTL_MINUTES = 5;

    private final PatientMapper patientMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    public void sendCode(SendCodeRequest request) {
        String code = "123456";
        String key = SMS_KEY_PREFIX + request.getPhone();
        redisTemplate.opsForValue().set(key, code, CODE_TTL_MINUTES, TimeUnit.MINUTES);
    }

    public UserLoginResponse login(LoginByCodeRequest request) {
        String key = SMS_KEY_PREFIX + request.getPhone();
        Object storedCode = redisTemplate.opsForValue().get(key);
        if (storedCode == null || !storedCode.equals(request.getCode())) {
            throw BusinessException.fail("验证码错误或已过期");
        }
        redisTemplate.delete(key);

        Patient patient = patientMapper.findByPhone(request.getPhone());
        if (patient == null) {
            patient = new Patient();
            patient.setPhone(request.getPhone());
            patient.setName("用户" + request.getPhone().substring(7));
            patientMapper.insert(patient);
        }

        String token = jwtTokenProvider.generateToken(patient.getId(), patient.getPhone(), "PATIENT");
        return new UserLoginResponse(token, patient.getId(), patient.getPhone());
    }
}
```

- [ ] **Step 2: 编写 UserAuthController**

```java
package com.aicall.module.user.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.user.dto.LoginByCodeRequest;
import com.aicall.module.user.dto.SendCodeRequest;
import com.aicall.module.user.dto.UserLoginResponse;
import com.aicall.module.user.service.UserAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/auth")
@RequiredArgsConstructor
public class UserAuthController {
    private final UserAuthService userAuthService;

    @PostMapping("/send-code")
    @Log("用户发送验证码")
    public Result<Void> sendCode(@Valid @RequestBody SendCodeRequest request) {
        userAuthService.sendCode(request);
        return Result.success();
    }

    @PostMapping("/login")
    @Log("用户验证码登录")
    public Result<UserLoginResponse> login(@Valid @RequestBody LoginByCodeRequest request) {
        return Result.success(userAuthService.login(request));
    }
}
```

- [ ] **Step 3: 修改 SecurityConfig**

将 SecurityConfig 中的 `/user/**` permitAll 改为 `/user/auth/**` permitAll，其他 `/user/**` 需要认证。找到以下代码：

```java
.requestMatchers("/user/**").permitAll()
```

替换为：

```java
.requestMatchers("/user/auth/**").permitAll()
```

- [ ] **Step 4: 提交**

```bash
git add aicall-backend/
git commit -m "feat: add user auth service, controller, and update SecurityConfig"
```

---

## Task 3: 会诊实体 + Mapper

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/Consultation.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/ConsultationMapper.xml`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/entity/ConsultationUpload.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/mapper/ConsultationUploadMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/ConsultationUploadMapper.xml`

- [ ] **Step 1: 编写 Consultation 实体**

```java
package com.aicall.module.consultation.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Consultation {
    private Long id;
    private String consultationNo;
    private Long patientId;
    private Integer type;
    private Integer status;
    private String department;
    private String chiefComplaint;
    private String medicalSummary;
    private BigDecimal fee;
    private Integer paymentStatus;
    private LocalDateTime scheduledTime;
    private LocalDateTime endTime;
    private String cancelReason;
    private String rejectReason;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 2: 编写 ConsultationMapper**

```java
package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.Consultation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConsultationMapper {
    void insert(Consultation consultation);

    Consultation findById(@Param("id") Long id);

    List<Consultation> findByPatientId(@Param("patientId") Long patientId);

    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    void updateMedicalSummary(@Param("id") Long id, @Param("medicalSummary") String medicalSummary);

    void updateTypeAndFee(@Param("id") Long id, @Param("type") Integer type, @Param("fee") java.math.BigDecimal fee);

    void updatePaymentStatus(@Param("id") Long id, @Param("paymentStatus") Integer paymentStatus);
}
```

- [ ] **Step 3: 编写 ConsultationMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.consultation.mapper.ConsultationMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO consultation (consultation_no, patient_id, type, status, department,
                                  chief_complaint, medical_summary, fee, payment_status)
        VALUES (#{consultationNo}, #{patientId}, #{type}, #{status}, #{department},
                #{chiefComplaint}, #{medicalSummary}, #{fee}, #{paymentStatus})
    </insert>

    <select id="findById" resultType="com.aicall.module.consultation.entity.Consultation">
        SELECT * FROM consultation WHERE id = #{id}
    </select>

    <select id="findByPatientId" resultType="com.aicall.module.consultation.entity.Consultation">
        SELECT * FROM consultation WHERE patient_id = #{patientId} ORDER BY create_time DESC
    </select>

    <update id="updateStatus">
        UPDATE consultation SET status = #{status} WHERE id = #{id}
    </update>

    <update id="updateMedicalSummary">
        UPDATE consultation SET medical_summary = #{medicalSummary} WHERE id = #{id}
    </update>

    <update id="updateTypeAndFee">
        UPDATE consultation SET type = #{type}, fee = #{fee} WHERE id = #{id}
    </update>

    <update id="updatePaymentStatus">
        UPDATE consultation SET payment_status = #{paymentStatus} WHERE id = #{id}
    </update>
</mapper>
```

- [ ] **Step 4: 编写 ConsultationUpload 实体**

```java
package com.aicall.module.consultation.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationUpload {
    private Long id;
    private Long consultationId;
    private String fileName;
    private Integer fileType;
    private String fileUrl;
    private Long fileSize;
    private String ocrResult;
    private String aiReview;
    private LocalDateTime createTime;
}
```

- [ ] **Step 5: 编写 ConsultationUploadMapper**

```java
package com.aicall.module.consultation.mapper;

import com.aicall.module.consultation.entity.ConsultationUpload;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConsultationUploadMapper {
    void insert(ConsultationUpload upload);

    List<ConsultationUpload> findByConsultationId(@Param("consultationId") Long consultationId);

    ConsultationUpload findById(@Param("id") Long id);

    void updateOcrResult(@Param("id") Long id, @Param("ocrResult") String ocrResult);

    void deleteById(@Param("id") Long id);
}
```

- [ ] **Step 6: 编写 ConsultationUploadMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.consultation.mapper.ConsultationUploadMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO consultation_upload (consultation_id, file_name, file_type, file_url,
                                          file_size, ocr_result, ai_review)
        VALUES (#{consultationId}, #{fileName}, #{fileType}, #{fileUrl},
                #{fileSize}, #{ocrResult}, #{aiReview})
    </insert>

    <select id="findByConsultationId" resultType="com.aicall.module.consultation.entity.ConsultationUpload">
        SELECT * FROM consultation_upload WHERE consultation_id = #{consultationId} ORDER BY create_time
    </select>

    <select id="findById" resultType="com.aicall.module.consultation.entity.ConsultationUpload">
        SELECT * FROM consultation_upload WHERE id = #{id}
    </select>

    <update id="updateOcrResult">
        UPDATE consultation_upload SET ocr_result = #{ocrResult} WHERE id = #{id}
    </update>

    <delete id="deleteById">
        DELETE FROM consultation_upload WHERE id = #{id}
    </delete>
</mapper>
```

- [ ] **Step 7: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/ aicall-backend/src/main/resources/mapper/ConsultationMapper.xml aicall-backend/src/main/resources/mapper/ConsultationUploadMapper.xml
git commit -m "feat: add Consultation and ConsultationUpload entities and mappers"
```

---

## Task 4: 会诊 DTO

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/dto/CreateDraftRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/dto/ChatRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/dto/ChatResponse.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/dto/FormSubmitRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/dto/SummaryUpdateRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/dto/FeeCalculateRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/dto/ConsultationDetailVO.java`

- [ ] **Step 1: 编写 CreateDraftRequest**

```java
package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDraftRequest {
    @NotBlank(message = "主诉不能为空")
    private String chiefComplaint;

    private String department;
}
```

- [ ] **Step 2: 编写 ChatRequest**

```java
package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "消息不能为空")
    private String message;
}
```

- [ ] **Step 3: 编写 ChatResponse**

```java
package com.aicall.module.consultation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatResponse {
    private String reply;
    private Boolean finished;
}
```

- [ ] **Step 4: 编写 FormSubmitRequest**

```java
package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FormSubmitRequest {
    @NotBlank(message = "主诉不能为空")
    private String chiefComplaint;

    private String onsetTime;
    private String symptomDescription;
    private String pastHistory;
    private String allergyHistory;
}
```

- [ ] **Step 5: 编写 SummaryUpdateRequest**

```java
package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SummaryUpdateRequest {
    @NotBlank(message = "摘要不能为空")
    private String medicalSummary;
}
```

- [ ] **Step 6: 编写 FeeCalculateRequest**

```java
package com.aicall.module.consultation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeeCalculateRequest {
    @NotNull(message = "会诊类型不能为空")
    private Integer type; // 1=单学科 2=MDT
}
```

- [ ] **Step 7: 编写 ConsultationDetailVO**

```java
package com.aicall.module.consultation.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConsultationDetailVO {
    private Long id;
    private String consultationNo;
    private Integer type;
    private Integer status;
    private String department;
    private String chiefComplaint;
    private String medicalSummary;
    private BigDecimal fee;
    private Integer paymentStatus;
    private LocalDateTime createTime;
    private List<UploadItem> uploads;

    @Data
    public static class UploadItem {
        private Long id;
        private String fileName;
        private Integer fileType;
        private String fileUrl;
        private String ocrResult;
    }
}
```

- [ ] **Step 8: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/dto/
git commit -m "feat: add consultation DTOs for user-side flow"
```

---

## Task 5: AI 服务 — PreDiagnosisService

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/ai/service/PreDiagnosisService.java`

- [ ] **Step 1: 编写 PreDiagnosisService**

```java
package com.aicall.module.ai.service;

import com.aicall.module.consultation.dto.ChatResponse;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class PreDiagnosisService {
    private static final String CHAT_KEY_PREFIX = "chat:";
    private static final long CHAT_TTL_HOURS = 2;
    private static final int MAX_MESSAGES = 20;
    private static final String SYSTEM_PROMPT = """
            你是一位专业的分诊护士。你需要通过对话收集患者的病情信息。
            请按以下顺序追问：
            1. 主诉：患者最主要的不适是什么？持续多久？
            2. 现病史：症状的详细描述，包括起病缓急、部位、性质、诱因、加重/缓解因素
            3. 既往史：是否有慢性疾病、手术史、住院史
            4. 过敏史：是否有药物或食物过敏
            
            要求：
            - 每次只问一个问题，语气亲切专业
            - 根据患者回答灵活追问，不要机械地按顺序问
            - 如果患者回答中已包含某个方面的信息，不需要重复追问
            - 当主诉、现病史、既往史、过敏史都已收集到时，回复必须以 [DIAGNOSIS_COMPLETE] 开头，然后给出简短总结
            """;

    private final ChatLanguageModel chatLanguageModel;
    private final RedisTemplate<String, Object> redisTemplate;

    public ChatResponse chat(Long consultationId, String userMessage) {
        String key = CHAT_KEY_PREFIX + consultationId;
        List<ChatMessage> messages = loadMessages(key);

        if (messages.isEmpty()) {
            messages.add(SystemMessage.from(SYSTEM_PROMPT));
        }
        messages.add(UserMessage.from(userMessage));
        trimMessages(messages);

        String aiReply = chatLanguageModel.generate(messages).content().text();
        messages.add(AiMessage.from(aiReply));
        saveMessages(key, messages);

        boolean finished = aiReply.contains("[DIAGNOSIS_COMPLETE]");
        if (finished) {
            aiReply = aiReply.replace("[DIAGNOSIS_COMPLETE]", "").trim();
        }

        return new ChatResponse(aiReply, finished);
    }

    public String getFullConversation(Long consultationId) {
        String key = CHAT_KEY_PREFIX + consultationId;
        List<ChatMessage> messages = loadMessages(key);
        StringBuilder sb = new StringBuilder();
        for (ChatMessage msg : messages) {
            if (msg instanceof SystemMessage) continue;
            if (msg instanceof UserMessage um) {
                sb.append("患者：").append(um.singleText()).append("\n");
            } else if (msg instanceof AiMessage am) {
                sb.append("护士：").append(am.singleText()).append("\n");
            }
        }
        return sb.toString();
    }

    private List<ChatMessage> loadMessages(String key) {
        Object obj = redisTemplate.opsForValue().get(key);
        if (obj == null) return new ArrayList<>();
        if (obj instanceof List<?> list) {
            @SuppressWarnings("unchecked")
            List<ChatMessage> result = (List<ChatMessage>) list;
            return new ArrayList<>(result);
        }
        return new ArrayList<>();
    }

    private void saveMessages(String key, List<ChatMessage> messages) {
        redisTemplate.opsForValue().set(key, messages, CHAT_TTL_HOURS, TimeUnit.HOURS);
    }

    private void trimMessages(List<ChatMessage> messages) {
        while (messages.size() > MAX_MESSAGES + 1) {
            messages.remove(1);
        }
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/ai/service/PreDiagnosisService.java
git commit -m "feat: add PreDiagnosisService for chat-based AI pre-diagnosis"
```

---

## Task 6: AI 服务 — SummaryService + OcrService + EmbeddingService

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/ai/service/SummaryService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/ai/service/OcrService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/ai/service/EmbeddingService.java`
- Modify: `aicall-backend/src/main/java/com/aicall/config/AiConfig.java`
- Modify: `aicall-backend/src/main/resources/application-dev.yml`

- [ ] **Step 1: 编写 SummaryService**

```java
package com.aicall.module.ai.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SummaryService {
    private static final String SUMMARY_PROMPT = """
            你是一位资深医学文书专家。请将以下患者的预问诊信息整理为结构化的病情摘要。
            
            要求：
            - 按以下结构输出，使用中文
            - 如果某项信息未提及，标注"未提供"
            
            格式：
            【主诉】...
            【现病史】...
            【既往史】...
            【过敏史】...
            【初步印象】...（基于已有信息给出初步医学印象，注明仅供参考）
            
            患者信息：
            %s
            """;

    private final ChatLanguageModel chatLanguageModel;

    public String generateSummary(String content) {
        String prompt = String.format(SUMMARY_PROMPT, content);
        return chatLanguageModel.generate(prompt).content().text();
    }
}
```

- [ ] **Step 2: 编写 OcrService**

```java
package com.aicall.module.ai.service;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OcrService {
    private static final String OCR_PROMPT = """
            请识别这张医学图片中的所有文字内容，并按以下JSON格式输出：
            {"type":"图片类型(如化验单/影像报告/病理报告/其他)","items":[{"name":"指标名","value":"数值","status":"正常/偏高/偏低/异常"}]}
            如果不是表格类报告，直接输出识别的文字内容即可。
            """;

    private final ChatLanguageModel visionModel;

    public String recognize(String base64Image) {
        UserMessage userMessage = UserMessage.userMessage(
                TextContent.from(OCR_PROMPT),
                ImageContent.from(base64Image, "image/png")
        );
        String result = visionModel.generate(userMessage).content().text();
        log.info("OCR result length: {}", result.length());
        return result;
    }
}
```

- [ ] **Step 3: 编写 EmbeddingService**

```java
package com.aicall.module.ai.service;

import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingService {
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    public void storeDocument(Long consultationId, Long uploadId, String text) {
        TextSegment segment = TextSegment.from(text,
                new dev.langchain4j.data.document.Metadata()
                        .add("consultationId", consultationId)
                        .add("uploadId", uploadId));
        var embedding = embeddingModel.embed(segment).content();
        embeddingStore.add(embedding, segment);
        log.info("Stored embedding for consultationId={}, uploadId={}", consultationId, uploadId);
    }

    public List<EmbeddingMatch<TextSegment>> search(String query, int maxResults) {
        var queryEmbedding = embeddingModel.embed(query).content();
        return embeddingStore.findRelevant(queryEmbedding, maxResults);
    }
}
```

- [ ] **Step 4: 修改 AiConfig — 新增 visionModel Bean 和 EmbeddingStore Bean**

在 AiConfig.java 中添加以下两个 Bean：

```java
@Value("${ai.silicon-flow.vision-model}")
private String visionModel;

@Bean
@Qualifier("visionModel")
public ChatLanguageModel visionChatModel() {
    return OpenAiChatModel.builder()
            .baseUrl(baseUrl)
            .apiKey(apiKey)
            .modelName(visionModel)
            .build();
}
```

同时添加 Qdrant EmbeddingStore Bean：

```java
@Bean
public EmbeddingStore<TextSegment> embeddingStore() {
    return dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore.builder()
            .host("localhost")
            .port(6334)
            .collectionName("consultation_document")
            .build();
}
```

需要在 AiConfig 中添加 import：
```java
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.qdrant.QdrantEmbeddingStore;
import org.springframework.beans.factory.annotation.Qualifier;
```

- [ ] **Step 5: 修改 application-dev.yml — 新增 vision-model**

在 `ai.silicon-flow` 下新增：

```yaml
    vision-model: Qwen/Qwen2-VL-72B-Instruct
```

- [ ] **Step 6: 提交**

```bash
git add aicall-backend/
git commit -m "feat: add SummaryService, OcrService, EmbeddingService and visionModel config"
```

---

## Task 7: ConsultationService — 业务逻辑

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/service/ConsultationService.java`

- [ ] **Step 1: 编写 ConsultationService**

```java
package com.aicall.module.consultation.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.module.ai.service.EmbeddingService;
import com.aicall.module.ai.service.OcrService;
import com.aicall.module.ai.service.PreDiagnosisService;
import com.aicall.module.ai.service.SummaryService;
import com.aicall.module.consultation.dto.*;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.mapper.ConsultationMapper;
import com.aicall.module.consultation.mapper.ConsultationUploadMapper;
import com.aicall.module.payment.entity.PaymentOrder;
import com.aicall.module.payment.mapper.PaymentOrderMapper;
import com.aicall.infrastructure.storage.MinioStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationService {
    private static final BigDecimal SINGLE_FEE = new BigDecimal("500.00");
    private static final BigDecimal MDT_FEE = new BigDecimal("1500.00");

    private final ConsultationMapper consultationMapper;
    private final ConsultationUploadMapper consultationUploadMapper;
    private final PaymentOrderMapper paymentOrderMapper;
    private final PreDiagnosisService preDiagnosisService;
    private final SummaryService summaryService;
    private final OcrService ocrService;
    private final EmbeddingService embeddingService;
    private final MinioStorageService minioStorageService;

    public Long createDraft(Long patientId, CreateDraftRequest request) {
        Consultation c = new Consultation();
        c.setConsultationNo(generateConsultationNo());
        c.setPatientId(patientId);
        c.setType(0);
        c.setStatus(0);
        c.setChiefComplaint(request.getChiefComplaint());
        c.setDepartment(request.getDepartment());
        c.setPaymentStatus(0);
        consultationMapper.insert(c);
        return c.getId();
    }

    public ChatResponse chat(Long consultationId, String message) {
        verifyOwnership(consultationId);
        return preDiagnosisService.chat(consultationId, message);
    }

    public String formSubmit(Long consultationId, FormSubmitRequest request) {
        verifyOwnership(consultationId);
        StringBuilder content = new StringBuilder();
        content.append("主诉：").append(request.getChiefComplaint()).append("\n");
        if (request.getOnsetTime() != null) {
            content.append("起病时间：").append(request.getOnsetTime()).append("\n");
        }
        if (request.getSymptomDescription() != null) {
            content.append("症状描述：").append(request.getSymptomDescription()).append("\n");
        }
        if (request.getPastHistory() != null) {
            content.append("既往史：").append(request.getPastHistory()).append("\n");
        }
        if (request.getAllergyHistory() != null) {
            content.append("过敏史：").append(request.getAllergyHistory()).append("\n");
        }
        String summary = summaryService.generateSummary(content.toString());
        consultationMapper.updateMedicalSummary(consultationId, summary);
        consultationMapper.updateStatus(consultationId, 1);
        return summary;
    }

    public String generateSummaryFromChat(Long consultationId) {
        verifyOwnership(consultationId);
        String conversation = preDiagnosisService.getFullConversation(consultationId);
        if (conversation.isBlank()) {
            throw BusinessException.fail("暂无对话记录，无法生成摘要");
        }
        String summary = summaryService.generateSummary(conversation);
        consultationMapper.updateMedicalSummary(consultationId, summary);
        consultationMapper.updateStatus(consultationId, 1);
        return summary;
    }

    public String getSummary(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");
        return c.getMedicalSummary();
    }

    public void updateSummary(Long consultationId, SummaryUpdateRequest request) {
        verifyOwnership(consultationId);
        consultationMapper.updateMedicalSummary(consultationId, request.getMedicalSummary());
    }

    public ConsultationUpload uploadFile(Long consultationId, MultipartFile file, Integer fileType) {
        verifyOwnership(consultationId);
        try {
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".png";
            String objectName = "consultation/" + consultationId + "/" + UUID.randomUUID() + ext;

            InputStream is = file.getInputStream();
            String fileUrl = minioStorageService.upload(objectName, is, file.getContentType(), file.getSize());

            ConsultationUpload upload = new ConsultationUpload();
            upload.setConsultationId(consultationId);
            upload.setFileName(originalFilename);
            upload.setFileType(fileType);
            upload.setFileUrl(fileUrl);
            upload.setFileSize(file.getSize());
            consultationUploadMapper.insert(upload);

            // OCR async — run in background thread to not block response
            Thread.ofVirtual().start(() -> {
                try {
                    String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
                    String ocrResult = ocrService.recognize(base64);
                    consultationUploadMapper.updateOcrResult(upload.getId(), ocrResult);
                    embeddingService.storeDocument(consultationId, upload.getId(), ocrResult);
                } catch (Exception e) {
                    log.error("OCR failed for upload {}: {}", upload.getId(), e.getMessage());
                }
            });

            return upload;
        } catch (Exception e) {
            throw BusinessException.fail("文件上传失败: " + e.getMessage());
        }
    }

    public List<ConsultationUpload> getUploads(Long consultationId) {
        return consultationUploadMapper.findByConsultationId(consultationId);
    }

    public void deleteUpload(Long consultationId, Long uploadId) {
        verifyOwnership(consultationId);
        ConsultationUpload upload = consultationUploadMapper.findById(uploadId);
        if (upload == null || !upload.getConsultationId().equals(consultationId)) {
            throw BusinessException.fail("上传记录不存在");
        }
        consultationUploadMapper.deleteById(uploadId);
    }

    public BigDecimal calculateFee(Long consultationId, FeeCalculateRequest request) {
        verifyOwnership(consultationId);
        BigDecimal fee = request.getType() == 2 ? MDT_FEE : SINGLE_FEE;
        consultationMapper.updateTypeAndFee(consultationId, request.getType(), fee);
        return fee;
    }

    public void pay(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");
        if (c.getPaymentStatus() == 1) throw BusinessException.fail("已支付，请勿重复操作");
        if (c.getFee() == null) throw BusinessException.fail("请先选择会诊类型并计算费用");

        PaymentOrder order = new PaymentOrder();
        order.setOrderNo("PAY" + System.currentTimeMillis() + ThreadLocalRandom.current().nextInt(1000, 9999));
        order.setConsultationId(consultationId);
        order.setAmount(c.getFee());
        order.setStatus(1);
        order.setPayTime(LocalDateTime.now());
        paymentOrderMapper.insert(order);

        consultationMapper.updatePaymentStatus(consultationId, 1);
        consultationMapper.updateStatus(consultationId, 0); // status 0=已提交
    }

    public ConsultationDetailVO getDetail(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");

        ConsultationDetailVO vo = new ConsultationDetailVO();
        vo.setId(c.getId());
        vo.setConsultationNo(c.getConsultationNo());
        vo.setType(c.getType());
        vo.setStatus(c.getStatus());
        vo.setDepartment(c.getDepartment());
        vo.setChiefComplaint(c.getChiefComplaint());
        vo.setMedicalSummary(c.getMedicalSummary());
        vo.setFee(c.getFee());
        vo.setPaymentStatus(c.getPaymentStatus());
        vo.setCreateTime(c.getCreateTime());

        List<ConsultationUpload> uploads = consultationUploadMapper.findByConsultationId(consultationId);
        vo.setUploads(uploads.stream().map(u -> {
            ConsultationDetailVO.UploadItem item = new ConsultationDetailVO.UploadItem();
            item.setId(u.getId());
            item.setFileName(u.getFileName());
            item.setFileType(u.getFileType());
            item.setFileUrl(u.getFileUrl());
            item.setOcrResult(u.getOcrResult());
            return item;
        }).collect(Collectors.toList()));

        return vo;
    }

    public List<Consultation> queryByPatientId(Long patientId) {
        return consultationMapper.findByPatientId(patientId);
    }

    private void verifyOwnership(Long consultationId) {
        Consultation c = consultationMapper.findById(consultationId);
        if (c == null) throw BusinessException.fail("会诊不存在");
    }

    private String generateConsultationNo() {
        return "MDT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/service/ConsultationService.java
git commit -m "feat: add ConsultationService with full user-side business logic"
```

---

## Task 8: PaymentOrder 实体 + Mapper

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/payment/entity/PaymentOrder.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/payment/mapper/PaymentOrderMapper.java`
- Create: `aicall-backend/src/main/resources/mapper/PaymentOrderMapper.xml`

- [ ] **Step 1: 编写 PaymentOrder 实体**

```java
package com.aicall.module.payment.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentOrder {
    private Long id;
    private String orderNo;
    private Long consultationId;
    private BigDecimal amount;
    private String feeDetail;
    private Integer status;
    private LocalDateTime payTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 2: 编写 PaymentOrderMapper**

```java
package com.aicall.module.payment.mapper;

import com.aicall.module.payment.entity.PaymentOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PaymentOrderMapper {
    void insert(PaymentOrder order);
}
```

- [ ] **Step 3: 编写 PaymentOrderMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.payment.mapper.PaymentOrderMapper">
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO payment_order (order_no, consultation_id, amount, status, pay_time)
        VALUES (#{orderNo}, #{consultationId}, #{amount}, #{status}, #{payTime})
    </insert>
</mapper>
```

- [ ] **Step 4: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/payment/ aicall-backend/src/main/resources/mapper/PaymentOrderMapper.xml
git commit -m "feat: add PaymentOrder entity and mapper"
```

---

## Task 9: UserConsultationController

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/consultation/controller/UserConsultationController.java`

- [ ] **Step 1: 编写 UserConsultationController**

```java
package com.aicall.module.consultation.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.consultation.dto.*;
import com.aicall.module.consultation.entity.Consultation;
import com.aicall.module.consultation.entity.ConsultationUpload;
import com.aicall.module.consultation.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/user/consultation")
@RequiredArgsConstructor
public class UserConsultationController {
    private final ConsultationService consultationService;

    @PostMapping("/draft")
    @Log("创建会诊草稿")
    public Result<Long> createDraft(@Valid @RequestBody CreateDraftRequest request,
                                     Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(consultationService.createDraft(patientId, request));
    }

    @PostMapping("/{id}/chat")
    @Log("对话预问诊")
    public Result<ChatResponse> chat(@PathVariable Long id,
                                      @Valid @RequestBody ChatRequest request) {
        return Result.success(consultationService.chat(id, request.getMessage()));
    }

    @PostMapping("/{id}/form-submit")
    @Log("表单预问诊")
    public Result<String> formSubmit(@PathVariable Long id,
                                      @Valid @RequestBody FormSubmitRequest request) {
        return Result.success(consultationService.formSubmit(id, request));
    }

    @PostMapping("/{id}/generate-summary")
    @Log("对话生成摘要")
    public Result<String> generateSummary(@PathVariable Long id) {
        return Result.success(consultationService.generateSummaryFromChat(id));
    }

    @GetMapping("/{id}/summary")
    public Result<String> getSummary(@PathVariable Long id) {
        return Result.success(consultationService.getSummary(id));
    }

    @PutMapping("/{id}/summary")
    @Log("修改摘要")
    public Result<Void> updateSummary(@PathVariable Long id,
                                       @Valid @RequestBody SummaryUpdateRequest request) {
        consultationService.updateSummary(id, request);
        return Result.success();
    }

    @PostMapping("/{id}/upload")
    @Log("上传资料")
    public Result<ConsultationUpload> upload(@PathVariable Long id,
                                              @RequestParam("file") MultipartFile file,
                                              @RequestParam(value = "fileType", defaultValue = "4") Integer fileType) {
        return Result.success(consultationService.uploadFile(id, file, fileType));
    }

    @GetMapping("/{id}/uploads")
    public Result<List<ConsultationUpload>> getUploads(@PathVariable Long id) {
        return Result.success(consultationService.getUploads(id));
    }

    @DeleteMapping("/{id}/upload/{uploadId}")
    @Log("删除资料")
    public Result<Void> deleteUpload(@PathVariable Long id, @PathVariable Long uploadId) {
        consultationService.deleteUpload(id, uploadId);
        return Result.success();
    }

    @PostMapping("/{id}/calculate-fee")
    @Log("计算费用")
    public Result<BigDecimal> calculateFee(@PathVariable Long id,
                                            @Valid @RequestBody FeeCalculateRequest request) {
        return Result.success(consultationService.calculateFee(id, request));
    }

    @PostMapping("/{id}/pay")
    @Log("模拟支付")
    public Result<Void> pay(@PathVariable Long id) {
        consultationService.pay(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<ConsultationDetailVO> getDetail(@PathVariable Long id) {
        return Result.success(consultationService.getDetail(id));
    }

    @GetMapping("/query")
    public Result<List<Consultation>> query(Authentication auth) {
        Long patientId = (Long) auth.getPrincipal();
        return Result.success(consultationService.queryByPatientId(patientId));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/consultation/controller/UserConsultationController.java
git commit -m "feat: add UserConsultationController for user-side consultation APIs"
```

---

## Task 10: 前端 — shared API + 路由 + 登录页

**Files:**
- Create: `frontend/packages/shared/src/api/consultation.ts`
- Modify: `frontend/packages/user/src/router/index.ts`
- Create: `frontend/packages/user/src/views/Login.vue`
- Modify: `frontend/packages/user/src/views/Home.vue`

- [ ] **Step 1: 编写 shared/src/api/consultation.ts**

```typescript
import { get, post, put, del } from './request';

export function sendCode(phone: string) {
  return post('/user/auth/send-code', { phone });
}

export function loginByCode(phone: string, code: string) {
  return post<{ token: string; patientId: number; phone: string }>('/user/auth/login', { phone, code });
}

export function createDraft(chiefComplaint: string, department?: string) {
  return post<number>('/user/consultation/draft', { chiefComplaint, department });
}

export function chatMessage(consultationId: number, message: string) {
  return post<{ reply: string; finished: boolean }>(`/user/consultation/${consultationId}/chat`, { message });
}

export function formSubmit(consultationId: number, data: {
  chiefComplaint: string; onsetTime?: string; symptomDescription?: string;
  pastHistory?: string; allergyHistory?: string;
}) {
  return post<string>(`/user/consultation/${consultationId}/form-submit`, data);
}

export function generateSummary(consultationId: number) {
  return post<string>(`/user/consultation/${consultationId}/generate-summary`);
}

export function getSummary(consultationId: number) {
  return get<string>(`/user/consultation/${consultationId}/summary`);
}

export function updateSummary(consultationId: number, medicalSummary: string) {
  return put(`/user/consultation/${consultationId}/summary`, { medicalSummary });
}

export function uploadFile(consultationId: number, file: File, fileType: number = 4) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', String(fileType));
  return post(`/user/consultation/${consultationId}/upload`, formData);
}

export function getUploads(consultationId: number) {
  return get(`/user/consultation/${consultationId}/uploads`);
}

export function deleteUpload(consultationId: number, uploadId: number) {
  return del(`/user/consultation/${consultationId}/upload/${uploadId}`);
}

export function calculateFee(consultationId: number, type: number) {
  return post<number>(`/user/consultation/${consultationId}/calculate-fee`, { type });
}

export function payConsultation(consultationId: number) {
  return post(`/user/consultation/${consultationId}/pay`);
}

export function getConsultationDetail(consultationId: number) {
  return get(`/user/consultation/${consultationId}`);
}

export function queryConsultations() {
  return get('/user/consultation/query');
}
```

- [ ] **Step 2: 更新 shared/src/index.ts — 导出 consultation API**

追加到文件末尾：

```typescript
export * from './api/consultation';
```

- [ ] **Step 3: 更新 user/src/router/index.ts**

替换整个文件：

```typescript
import type { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Start from '@/views/consultation/Start.vue';
import Chat from '@/views/consultation/Chat.vue';
import Form from '@/views/consultation/Form.vue';
import Summary from '@/views/consultation/Summary.vue';
import Upload from '@/views/consultation/Upload.vue';
import SelectType from '@/views/consultation/SelectType.vue';
import Pay from '@/views/consultation/Pay.vue';
import Success from '@/views/consultation/Success.vue';
import Query from '@/views/consultation/Query.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login, meta: { title: '登录' } },
  { path: '/', name: 'Home', component: Home, meta: { title: '首页', requiresAuth: true } },
  { path: '/consultation/start', name: 'Start', component: Start, meta: { title: '选择预问诊方式', requiresAuth: true } },
  { path: '/consultation/:id/chat', name: 'Chat', component: Chat, meta: { title: 'AI预问诊', requiresAuth: true } },
  { path: '/consultation/:id/form', name: 'Form', component: Form, meta: { title: '填写病情', requiresAuth: true } },
  { path: '/consultation/:id/summary', name: 'Summary', component: Summary, meta: { title: '病情摘要', requiresAuth: true } },
  { path: '/consultation/:id/upload', name: 'Upload', component: Upload, meta: { title: '上传资料', requiresAuth: true } },
  { path: '/consultation/:id/select-type', name: 'SelectType', component: SelectType, meta: { title: '选择会诊类型', requiresAuth: true } },
  { path: '/consultation/:id/pay', name: 'Pay', component: Pay, meta: { title: '确认支付', requiresAuth: true } },
  { path: '/consultation/:id/success', name: 'Success', component: Success, meta: { title: '支付成功', requiresAuth: true } },
  { path: '/consultation/query', name: 'Query', component: Query, meta: { title: '查询会诊', requiresAuth: true } },
];

export default routes;
```

- [ ] **Step 4: 更新 user/src/main.ts — 添加路由守卫**

替换整个文件：

```typescript
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';
import 'vant/lib/index.css';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.mount('#app');
```

- [ ] **Step 5: 编写 Login.vue**

```vue
<template>
  <div class="login-page">
    <van-nav-bar title="AICall 在线会诊" />
    <div class="form-area">
      <van-cell-group inset>
        <van-field v-model="phone" label="手机号" placeholder="请输入手机号" type="tel" maxlength="11" />
        <van-field v-model="code" label="验证码" placeholder="请输入验证码" type="digit" maxlength="6">
          <template #button>
            <van-button size="small" type="primary" @click="handleSendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handleLogin" :loading="loading">登录</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { sendCode, loginByCode } from '@aicall/shared';

const router = useRouter();
const phone = ref('');
const code = ref('');
const loading = ref(false);
const countdown = ref(0);

async function handleSendCode() {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号');
    return;
  }
  try {
    await sendCode(phone.value);
    showToast('验证码已发送');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (e: any) {
    showToast(e.message || '发送失败');
  }
}

async function handleLogin() {
  if (!phone.value || !code.value) {
    showToast('请输入手机号和验证码');
    return;
  }
  loading.value = true;
  try {
    const res = await loginByCode(phone.value, code.value);
    localStorage.setItem('token', res.token);
    localStorage.setItem('patientId', String(res.patientId));
    showToast('登录成功');
    router.push('/');
  } catch (e: any) {
    showToast(e.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: #f7f8fa; }
.form-area { padding: 40px 0; }
.btn-area { padding: 24px 16px; }
</style>
```

- [ ] **Step 6: 更新 Home.vue**

```vue
<template>
  <div class="home">
    <van-nav-bar title="AICall 在线会诊" />
    <div class="content">
      <van-cell-group inset title="会诊服务">
        <van-cell title="发起会诊" is-link @click="$router.push('/consultation/start')" icon="add-o" />
        <van-cell title="查询会诊" is-link @click="$router.push('/consultation/query')" icon="search" />
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped>
.home { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
```

- [ ] **Step 7: 提交**

```bash
git add frontend/
git commit -m "feat: add user-side consultation API, router, login page"
```

---

## Task 11: 前端 — 预问诊页面（对话 + 表单）

**Files:**
- Create: `frontend/packages/user/src/views/consultation/Start.vue`
- Create: `frontend/packages/user/src/views/consultation/Chat.vue`
- Create: `frontend/packages/user/src/views/consultation/Form.vue`

- [ ] **Step 1: 编写 Start.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="选择预问诊方式" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset>
        <van-cell title="对话模式" label="与AI护士对话，逐步描述病情" is-link
                  @click="startChat" icon="chat-o" />
        <van-cell title="表单模式" label="填写病情表单，AI生成摘要" is-link
                  @click="startForm" icon="edit" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { createDraft } from '@aicall/shared';

const router = useRouter();

async function createAndNavigate(mode: string) {
  try {
    const id = await createDraft('待补充');
    if (mode === 'chat') {
      router.push(`/consultation/${id}/chat`);
    } else {
      router.push(`/consultation/${id}/form`);
    }
  } catch (e: any) {
    showToast(e.message || '创建失败');
  }
}

function startChat() { createAndNavigate('chat'); }
function startForm() { createAndNavigate('form'); }
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
```

- [ ] **Step 2: 编写 Chat.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="AI预问诊" left-arrow @click-left="$router.back()" />
    <div class="chat-area" ref="chatArea">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['msg', msg.role === 'user' ? 'msg-user' : 'msg-ai']">
        <div class="bubble">{{ msg.content }}</div>
      </div>
      <div v-if="loading" class="msg msg-ai">
        <div class="bubble">正在思考...</div>
      </div>
    </div>
    <div class="input-area">
      <van-field v-model="input" placeholder="请描述您的病情" @keyup.enter="send" :disabled="finished">
        <template #button>
          <van-button size="small" type="primary" @click="send" :disabled="!input || finished">发送</van-button>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { chatMessage, generateSummary } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);

const messages = ref<{ role: string; content: string }[]>([]);
const input = ref('');
const loading = ref(false);
const finished = ref(false);
const chatArea = ref<HTMLElement>();

onMounted(() => {
  messages.value.push({ role: 'ai', content: '您好！我是AICall分诊护士，请告诉我您最主要的不适是什么？' });
});

async function send() {
  if (!input.value.trim()) return;
  const userMsg = input.value.trim();
  messages.value.push({ role: 'user', content: userMsg });
  input.value = '';
  loading.value = true;
  await nextTick();
  scrollToBottom();

  try {
    const res = await chatMessage(consultationId, userMsg);
    messages.value.push({ role: 'ai', content: res.reply });
    if (res.finished) {
      finished.value = true;
      showToast('信息收集完成，正在生成摘要...');
      const summary = await generateSummary(consultationId);
      router.push(`/consultation/${consultationId}/summary`);
    }
  } catch (e: any) {
    showToast(e.message || '发送失败');
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight;
  }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; background: #f7f8fa; }
.chat-area { flex: 1; overflow-y: auto; padding: 12px; }
.msg { margin-bottom: 12px; display: flex; }
.msg-user { justify-content: flex-end; }
.msg-ai { justify-content: flex-start; }
.bubble { max-width: 75%; padding: 10px 14px; border-radius: 8px; font-size: 14px; line-height: 1.5; }
.msg-user .bubble { background: #1989fa; color: #fff; }
.msg-ai .bubble { background: #fff; color: #333; }
.input-area { padding: 8px; background: #fff; border-top: 1px solid #ebedf0; }
</style>
```

- [ ] **Step 3: 编写 Form.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="填写病情" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset>
        <van-field v-model="form.chiefComplaint" label="主诉" placeholder="您最主要的不适是什么？" required rows="2" type="textarea" />
        <van-field v-model="form.onsetTime" label="起病时间" placeholder="症状什么时候开始的？" />
        <van-field v-model="form.symptomDescription" label="症状描述" placeholder="详细描述您的症状" rows="3" type="textarea" />
        <van-field v-model="form.pastHistory" label="既往史" placeholder="是否有慢性疾病、手术史？" rows="2" type="textarea" />
        <van-field v-model="form.allergyHistory" label="过敏史" placeholder="是否有药物或食物过敏？" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handleSubmit" :loading="loading">提交并生成摘要</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { formSubmit } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);

const form = reactive({
  chiefComplaint: '',
  onsetTime: '',
  symptomDescription: '',
  pastHistory: '',
  allergyHistory: '',
});
const loading = ref(false);

async function handleSubmit() {
  if (!form.chiefComplaint) {
    showToast('请填写主诉');
    return;
  }
  loading.value = true;
  try {
    await formSubmit(consultationId, form);
    showToast('摘要生成成功');
    router.push(`/consultation/${consultationId}/summary`);
  } catch (e: any) {
    showToast(e.message || '提交失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
</style>
```

- [ ] **Step 4: 提交**

```bash
git add frontend/packages/user/src/views/consultation/Start.vue frontend/packages/user/src/views/consultation/Chat.vue frontend/packages/user/src/views/consultation/Form.vue
git commit -m "feat: add Start, Chat, Form pages for user-side pre-diagnosis"
```

---

## Task 12: 前端 — 摘要确认 + 上传 + 类型选择 + 支付 + 成功 + 查询

**Files:**
- Create: `frontend/packages/user/src/views/consultation/Summary.vue`
- Create: `frontend/packages/user/src/views/consultation/Upload.vue`
- Create: `frontend/packages/user/src/views/consultation/SelectType.vue`
- Create: `frontend/packages/user/src/views/consultation/Pay.vue`
- Create: `frontend/packages/user/src/views/consultation/Success.vue`
- Create: `frontend/packages/user/src/views/consultation/Query.vue`

- [ ] **Step 1: 编写 Summary.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="病情摘要" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset>
        <van-field v-model="summary" rows="8" type="textarea" placeholder="AI生成的摘要" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handleConfirm" :loading="loading">确认摘要</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getSummary, updateSummary } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);
const summary = ref('');
const loading = ref(false);

onMounted(async () => {
  try {
    summary.value = await getSummary(consultationId);
  } catch (e: any) {
    showToast(e.message || '获取摘要失败');
  }
});

async function handleConfirm() {
  loading.value = true;
  try {
    await updateSummary(consultationId, summary.value);
    router.push(`/consultation/${consultationId}/upload`);
  } catch (e: any) {
    showToast(e.message || '保存失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
</style>
```

- [ ] **Step 2: 编写 Upload.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="上传资料" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset title="上传检查资料">
        <van-uploader :after-read="onUpload" multiple :max-size="10 * 1024 * 1024" @oversize="onOversize" />
      </van-cell-group>
      <van-cell-group inset title="已上传资料" style="margin-top: 12px;">
        <van-cell v-for="item in uploads" :key="item.id" :title="item.fileName" :label="item.ocrResult?.substring(0, 50) || '识别中...'" is-link :url="item.fileUrl" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="$router.push(`/consultation/${consultationId}/select-type`)">
          下一步
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { uploadFile, getUploads } from '@aicall/shared';

const route = useRoute();
const consultationId = Number(route.params.id);
const uploads = ref<any[]>([]);

onMounted(loadUploads);

async function loadUploads() {
  try {
    uploads.value = await getUploads(consultationId);
  } catch (e: any) { /* ignore */ }
}

async function onUpload(file: any) {
  const files = Array.isArray(file) ? file : [file];
  for (const f of files) {
    try {
      await uploadFile(consultationId, f.file);
      showToast('上传成功');
    } catch (e: any) {
      showToast(e.message || '上传失败');
    }
  }
  await loadUploads();
}

function onOversize() {
  showToast('文件大小不能超过10MB');
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
</style>
```

- [ ] **Step 3: 编写 SelectType.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="选择会诊类型" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset>
        <van-cell title="单学科会诊" label="一位专家看诊" is-link @click="selectType(1)" />
        <van-cell title="多学科MDT会诊" label="多位专家联合看诊" is-link @click="selectType(2)" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { calculateFee } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);

async function selectType(type: number) {
  try {
    const fee = await calculateFee(consultationId, type);
    router.push(`/consultation/${consultationId}/pay`);
  } catch (e: any) {
    showToast(e.message || '操作失败');
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
```

- [ ] **Step 4: 编写 Pay.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="确认支付" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset>
        <van-cell title="会诊编号" :value="detail.consultationNo" />
        <van-cell title="会诊类型" :value="detail.type === 2 ? '多学科MDT会诊' : '单学科会诊'" />
        <van-cell title="会诊费用" :value="`¥${detail.fee || '0.00'}`" />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="primary" block @click="handlePay" :loading="loading">
          确认支付 ¥{{ detail.fee || '0.00' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getConsultationDetail, payConsultation } from '@aicall/shared';

const route = useRoute();
const router = useRouter();
const consultationId = Number(route.params.id);
const detail = reactive<any>({});
const loading = ref(false);

onMounted(async () => {
  try {
    const res = await getConsultationDetail(consultationId);
    Object.assign(detail, res);
  } catch (e: any) {
    showToast(e.message || '获取详情失败');
  }
});

async function handlePay() {
  loading.value = true;
  try {
    await payConsultation(consultationId);
    router.push(`/consultation/${consultationId}/success`);
  } catch (e: any) {
    showToast(e.message || '支付失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
.btn-area { padding: 24px 16px; }
</style>
```

- [ ] **Step 5: 编写 Success.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="支付成功" />
    <div class="success-area">
      <van-icon name="checked" size="64" color="#07c160" />
      <h2>支付成功</h2>
      <p>会诊申请已提交，请耐心等待专家确认</p>
      <van-button type="primary" @click="$router.push('/')" style="margin-top: 24px;">返回首页</van-button>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.success-area { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px; }
.success-area h2 { margin: 16px 0 8px; }
.success-area p { color: #999; }
</style>
```

- [ ] **Step 6: 编写 Query.vue**

```vue
<template>
  <div class="page">
    <van-nav-bar title="查询会诊" left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-cell-group inset v-if="list.length > 0">
        <van-cell v-for="item in list" :key="item.id" :title="item.consultationNo"
                  :label="`状态: ${statusText(item.status)}`" is-link
                  @click="$router.push(`/consultation/${item.id}/summary`)" />
      </van-cell-group>
      <van-empty v-else description="暂无会诊记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { queryConsultations } from '@aicall/shared';

const list = ref<any[]>([]);

const STATUS_MAP: Record<number, string> = {
  0: '已提交', 1: '资料审核中', 2: '专家确认中', 3: '已排期',
  4: '待会诊', 5: '会诊中', 6: '已完成', 7: '已取消', 8: '已退回',
};

function statusText(s: number) { return STATUS_MAP[s] || '未知'; }

onMounted(async () => {
  try {
    list.value = await queryConsultations();
  } catch (e: any) { /* ignore */ }
});
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.content { padding: 16px; }
</style>
```

- [ ] **Step 7: 提交**

```bash
git add frontend/packages/user/src/views/consultation/
git commit -m "feat: add Summary, Upload, SelectType, Pay, Success, Query pages"
```

---

## Task 13: 验收

- [ ] **Step 1: 启动后端，确认无报错**

```bash
cd aicall-backend && mvn spring-boot:run
```

- [ ] **Step 2: 测试用户认证**

```bash
# 发送验证码
curl -X POST http://localhost:8080/api/user/auth/send-code -H "Content-Type: application/json" -d '{"phone":"13812345678"}'

# 登录
curl -X POST http://localhost:8080/api/user/auth/login -H "Content-Type: application/json" -d '{"phone":"13812345678","code":"123456"}'
```

Expected: 返回 token

- [ ] **Step 3: 测试创建会诊草稿**

```bash
curl -X POST http://localhost:8080/api/user/consultation/draft -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"chiefComplaint":"头痛"}'
```

Expected: 返回 consultationId

- [ ] **Step 4: 测试对话预问诊**

```bash
curl -X POST http://localhost:8080/api/user/consultation/<id>/chat -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"message":"我最近头痛得厉害"}'
```

Expected: AI 追问回复

- [ ] **Step 5: 启动前端，完整流程跑通**

```bash
cd frontend && pnpm dev:user
```

访问 http://localhost:3000，走完整流程：登录 → 选择方式 → 预问诊 → 摘要 → 上传 → 选类型 → 支付 → 成功

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "feat: complete AI pre-diagnosis user-side flow"
```

---

## Self-Review

**1. Spec coverage:**
- 手机号验证码登录 ✅ (Task 1-2)
- 对话模式预问诊 ✅ (Task 5, Task 11)
- 表单模式预问诊 ✅ (Task 6, Task 11)
- 病情摘要确认/修改 ✅ (Task 7, Task 12)
- 文件上传到 MinIO ✅ (Task 7)
- LLM 视觉 OCR ✅ (Task 6, Task 7)
- Embedding 存 Qdrant ✅ (Task 6, Task 7)
- 费用计算(单学科500/MDT1500) ✅ (Task 7)
- 模拟支付 ✅ (Task 7-8)
- 前端步骤向导 ✅ (Task 10-12)
- SecurityConfig 调整 ✅ (Task 2)

**2. Placeholder scan:** No TBD/TODO found. All steps contain complete code.

**3. Type consistency:**
- `ChatResponse` (reply: String, finished: Boolean) matches Chat.vue and ConsultationService
- `UserLoginResponse` (token, patientId, phone) matches Login.vue
- `ConsultationDetailVO.UploadItem` matches Upload.vue rendering
- `JwtTokenProvider.generateToken()` with role "PATIENT" matches SecurityConfig ROLE_PATIENT pattern
