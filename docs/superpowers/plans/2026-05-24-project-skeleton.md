# AICall 项目骨架 + 基础设施 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 AICall 后端 Spring Boot 项目骨架、前端 Monorepo 脚手架、基础设施配置，使项目能启动并通过全部验收标准。

**Architecture:** Spring Boot 3 单体后端 + Vue 3 三端前端 Monorepo。后端按 module 划分业务模块，infrastructure 层封装安全/存储/MQ 等横切关注点，common 层提供统一返回/异常/工具。AI 能力通过 LangChain4j OpenAI 兼容模式接入硅基流动。前端 pnpm workspace 管理三端 + shared 公共包。

**Tech Stack:** Java 17, Spring Boot 3, MyBatis, MySQL 8, Redis 7, MinIO, RabbitMQ, Qdrant, LangChain4j, Vue 3, TypeScript, Vite 5, Vant 4, Element Plus, pnpm

---

## File Structure

### Backend

| File | Responsibility |
|:-----|:---------------|
| `aicall-backend/pom.xml` | Maven 依赖管理 |
| `aicall-backend/src/main/java/com/aicall/AicallApplication.java` | 启动类 |
| `aicall-backend/src/main/java/com/aicall/config/WebConfig.java` | CORS 配置 |
| `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java` | Security 鉴权链 |
| `aicall-backend/src/main/java/com/aicall/config/WebSocketConfig.java` | WebSocket 端点注册 |
| `aicall-backend/src/main/java/com/aicall/config/RedisConfig.java` | Redis 序列化 |
| `aicall-backend/src/main/java/com/aicall/config/MinioConfig.java` | MinIO 客户端 Bean |
| `aicall-backend/src/main/java/com/aicall/config/RabbitMqConfig.java` | 交换机/队列声明 |
| `aicall-backend/src/main/java/com/aicall/config/AiConfig.java` | LangChain4j 模型 Bean |
| `aicall-backend/src/main/java/com/aicall/common/result/ResultCode.java` | 状态码枚举 |
| `aicall-backend/src/main/java/com/aicall/common/result/Result.java` | 统一返回体 |
| `aicall-backend/src/main/java/com/aicall/common/exception/BusinessException.java` | 业务异常 |
| `aicall-backend/src/main/java/com/aicall/common/exception/GlobalExceptionHandler.java` | 全局异常处理 |
| `aicall-backend/src/main/java/com/aicall/common/annotation/Log.java` | 操作日志注解 |
| `aicall-backend/src/main/java/com/aicall/common/aspect/LogAspect.java` | 日志切面 |
| `aicall-backend/src/main/java/com/aicall/common/util/JwtUtil.java` | JWT 生成/验证 |
| `aicall-backend/src/main/java/com/aicall/common/util/DesensitizeUtil.java` | 脱敏工具 |
| `aicall-backend/src/main/java/com/aicall/infrastructure/security/JwtTokenProvider.java` | Token 管理 |
| `aicall-backend/src/main/java/com/aicall/infrastructure/security/JwtAuthenticationFilter.java` | JWT 过滤器 |
| `aicall-backend/src/main/java/com/aicall/infrastructure/security/UserDetailsServiceImpl.java` | 用户加载 |
| `aicall-backend/src/main/java/com/aicall/infrastructure/websocket/WebSocketHandler.java` | WS 处理器 |
| `aicall-backend/src/main/java/com/aicall/infrastructure/mq/RabbitMqProducer.java` | MQ 生产者 |
| `aicall-backend/src/main/java/com/aicall/infrastructure/schedule/ScheduleConfig.java` | 定时任务配置 |
| `aicall-backend/src/main/java/com/aicall/infrastructure/storage/MinioStorageService.java` | 文件存储 |
| `aicall-backend/src/main/java/com/aicall/module/ai/controller/AiTestController.java` | AI 接口测试 |
| `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminController.java` | 管理员登录 |
| `aicall-backend/src/main/java/com/aicall/module/doctor/controller/DoctorController.java` | 医生登录 |
| `aicall-backend/src/main/resources/application.yml` | 主配置 |
| `aicall-backend/src/main/resources/application-dev.yml` | 开发环境配置 |

### SQL

| File | Responsibility |
|:-----|:---------------|
| `sql/init.sql` | 建表 + 初始数据 |

### Docker

| File | Responsibility |
|:-----|:---------------|
| `docker-compose.yml` | RabbitMQ + Qdrant |

### Frontend

| File | Responsibility |
|:-----|:---------------|
| `frontend/pnpm-workspace.yaml` | workspace 声明 |
| `frontend/package.json` | 根 package |
| `frontend/.eslintrc.js` | ESLint 配置 |
| `frontend/.prettierrc` | Prettier 配置 |
| `frontend/packages/shared/package.json` | shared 包 |
| `frontend/packages/shared/src/api/request.ts` | Axios 封装 |
| `frontend/packages/shared/src/api/index.ts` | 导出 |
| `frontend/packages/shared/src/types/index.ts` | 公共类型 |
| `frontend/packages/shared/src/utils/index.ts` | 工具函数 |
| `frontend/packages/shared/tsconfig.json` | TS 配置 |
| `frontend/packages/user/` | 用户端 H5 项目 |
| `frontend/packages/doctor/` | 医生端 PC 项目 |
| `frontend/packages/admin/` | 管理端 PC 项目 |

---

## Task 1: 后端项目初始化 + Maven 依赖

**Files:**
- Create: `aicall-backend/pom.xml`
- Create: `aicall-backend/src/main/java/com/aicall/AicallApplication.java`
- Create: `aicall-backend/src/main/resources/application.yml`
- Create: `aicall-backend/src/main/resources/application-dev.yml`

- [ ] **Step 1: 创建后端目录结构**

```bash
mkdir -p aicall-backend/src/main/java/com/aicall
mkdir -p aicall-backend/src/main/resources
```

- [ ] **Step 2: 编写 pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.6</version>
        <relativePath/>
    </parent>

    <groupId>com.aicall</groupId>
    <artifactId>aicall-backend</artifactId>
    <version>1.0.0</version>
    <name>aicall-backend</name>
    <description>AICall AI+Online MDT Consultation System</description>

    <properties>
        <java.version>17</java.version>
        <langchain4j.version>1.0.0-beta1</langchain4j.version>
        <jjwt.version>0.12.6</jjwt.version>
        <minio.version>8.5.14</minio.version>
        <mapstruct.version>1.6.3</mapstruct.version>
        <hutool.version>5.8.34</hutool.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- MyBatis -->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>3.0.4</version>
        </dependency>

        <!-- MySQL -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- MinIO -->
        <dependency>
            <groupId>io.minio</groupId>
            <artifactId>minio</artifactId>
            <version>${minio.version}</version>
        </dependency>

        <!-- LangChain4j -->
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-spring-boot-starter</artifactId>
            <version>${langchain4j.version}</version>
        </dependency>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-open-ai</artifactId>
            <version>${langchain4j.version}</version>
        </dependency>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-qdrant</artifactId>
            <version>${langchain4j.version}</version>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- MapStruct -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${mapstruct.version}</version>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>${mapstruct.version}</version>
            <scope>provided</scope>
        </dependency>

        <!-- Hutool -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>${hutool.version}</version>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: 编写启动类**

```java
package com.aicall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AicallApplication {
    public static void main(String[] args) {
        SpringApplication.run(AicallApplication.class, args);
    }
}
```

- [ ] **Step 4: 编写 application.yml**

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  profiles:
    active: dev
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB
```

- [ ] **Step 5: 编写 application-dev.yml**

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/aicall?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
  data:
    redis:
      host: localhost
      port: 6379
      database: 0
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.aicall.module.*.entity
  configuration:
    map-underscore-to-camel-case: true

minio:
  endpoint: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin
  bucket-name: aicall

ai:
  silicon-flow:
    base-url: https://api.siliconflow.cn/v1
    api-key: ${SILICON_FLOW_API_KEY:your-api-key-here}
    chat-model: deepseek-ai/DeepSeek-V3
    embedding-model: BAAI/bge-m3

jwt:
  secret: aicall-jwt-secret-key-for-development-only-must-be-at-least-256-bits-long
  expiration: 86400000
```

- [ ] **Step 6: 创建业务模块空包结构**

```bash
mkdir -p aicall-backend/src/main/java/com/aicall/config
mkdir -p aicall-backend/src/main/java/com/aicall/common/result
mkdir -p aicall-backend/src/main/java/com/aicall/common/exception
mkdir -p aicall-backend/src/main/java/com/aicall/common/annotation
mkdir -p aicall-backend/src/main/java/com/aicall/common/aspect
mkdir -p aicall-backend/src/main/java/com/aicall/common/util
mkdir -p aicall-backend/src/main/java/com/aicall/infrastructure/security
mkdir -p aicall-backend/src/main/java/com/aicall/infrastructure/websocket
mkdir -p aicall-backend/src/main/java/com/aicall/infrastructure/mq
mkdir -p aicall-backend/src/main/java/com/aicall/infrastructure/schedule
mkdir -p aicall-backend/src/main/java/com/aicall/infrastructure/storage
for mod in user doctor consultation report payment notification imaging live ai admin; do
  mkdir -p aicall-backend/src/main/java/com/aicall/module/$mod/controller
  mkdir -p aicall-backend/src/main/java/com/aicall/module/$mod/service
  mkdir -p aicall-backend/src/main/java/com/aicall/module/$mod/mapper
  mkdir -p aicall-backend/src/main/java/com/aicall/module/$mod/entity
  mkdir -p aicall-backend/src/main/java/com/aicall/module/$mod/dto
done
mkdir -p aicall-backend/src/main/resources/mapper
```

- [ ] **Step 7: 提交**

```bash
git add aicall-backend/
git commit -m "feat: init Spring Boot project with Maven dependencies and package structure"
```

---

## Task 2: 公共组件 — Result + ResultCode + BusinessException + GlobalExceptionHandler

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/common/result/ResultCode.java`
- Create: `aicall-backend/src/main/java/com/aicall/common/result/Result.java`
- Create: `aicall-backend/src/main/java/com/aicall/common/exception/BusinessException.java`
- Create: `aicall-backend/src/main/java/com/aicall/common/exception/GlobalExceptionHandler.java`

- [ ] **Step 1: 编写 ResultCode 枚举**

```java
package com.aicall.common.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {
    SUCCESS(200, "操作成功"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未认证"),
    FORBIDDEN(403, "无权限"),
    NOT_FOUND(404, "资源不存在"),
    INTERNAL_ERROR(500, "系统异常"),

    // 用户端 1xxxx
    USER_PHONE_NOT_FOUND(10001, "手机号未找到会诊记录"),
    USER_CONSULTATION_CANCELLED(10002, "会诊已取消"),

    // 医生端 2xxxx
    DOCTOR_LOGIN_FAILED(20001, "账号或密码错误"),
    DOCTOR_ACCOUNT_DISABLED(20002, "账号已禁用"),

    // 会诊 3xxxx
    CONSULTATION_NOT_FOUND(30001, "会诊不存在"),
    CONSULTATION_STATUS_ERROR(30002, "会诊状态异常"),

    // 支付 4xxxx
    PAYMENT_ORDER_NOT_FOUND(40001, "订单不存在"),
    PAYMENT_ALREADY_PAID(40002, "订单已支付"),

    // AI 5xxxx
    AI_CALL_FAILED(50001, "AI服务调用失败"),
    AI_TIMEOUT(50002, "AI服务超时");

    private final int code;
    private final String message;
}
```

- [ ] **Step 2: 编写 Result 统一返回体**

```java
package com.aicall.common.result;

import lombok.Data;

@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;

    private Result() {}

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.SUCCESS.getCode());
        result.setMessage(ResultCode.SUCCESS.getMessage());
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> fail(String message) {
        return fail(ResultCode.INTERNAL_ERROR.getCode(), message);
    }

    public static <T> Result<T> fail(ResultCode resultCode) {
        return fail(resultCode.getCode(), resultCode.getMessage());
    }
}
```

- [ ] **Step 3: 编写 BusinessException**

```java
package com.aicall.common.exception;

import com.aicall.common.result.ResultCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    public static BusinessException fail(String message) {
        return new BusinessException(ResultCode.INTERNAL_ERROR.getCode(), message);
    }

    public static BusinessException fail(ResultCode resultCode) {
        return new BusinessException(resultCode);
    }
}
```

- [ ] **Step 4: 编写 GlobalExceptionHandler**

```java
package com.aicall.common.exception;

import com.aicall.common.result.Result;
import com.aicall.common.result.ResultCode;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("Business exception: code={}, message={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("Validation error: {}", message);
        return Result.fail(ResultCode.PARAM_ERROR.getCode(), message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
        log.warn("Constraint violation: {}", message);
        return Result.fail(ResultCode.PARAM_ERROR.getCode(), message);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleBadCredentialsException(BadCredentialsException e) {
        return Result.fail(ResultCode.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleAccessDeniedException(AccessDeniedException e) {
        return Result.fail(ResultCode.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleException(Exception e) {
        log.error("Unexpected exception", e);
        return Result.fail(ResultCode.INTERNAL_ERROR);
    }
}
```

- [ ] **Step 5: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/common/
git commit -m "feat: add Result, ResultCode, BusinessException, GlobalExceptionHandler"
```

---

## Task 3: 工具类 — JwtUtil + DesensitizeUtil

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/common/util/JwtUtil.java`
- Create: `aicall-backend/src/main/java/com/aicall/common/util/DesensitizeUtil.java`

- [ ] **Step 1: 编写 JwtUtil**

```java
package com.aicall.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

public class JwtUtil {
    private JwtUtil() {}

    public static String generateToken(String secret, long expirationMs, String subject, Map<String, Object> claims) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public static Claims parseToken(String secret, String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static boolean isTokenValid(String secret, String token) {
        try {
            parseToken(secret, token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

- [ ] **Step 2: 编写 DesensitizeUtil**

```java
package com.aicall.common.util;

public class DesensitizeUtil {
    private DesensitizeUtil() {}

    public static String name(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        if (name.length() == 1) {
            return name;
        }
        return name.charAt(0) + "*".repeat(name.length() - 1);
    }

    public static String phone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    public static String idCard(String idCard) {
        if (idCard == null || idCard.length() < 7) {
            return idCard;
        }
        return idCard.substring(0, 3) + "***********" + idCard.substring(idCard.length() - 4);
    }
}
```

- [ ] **Step 3: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/common/util/
git commit -m "feat: add JwtUtil and DesensitizeUtil"
```

---

## Task 4: 操作日志注解 + 切面

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/common/annotation/Log.java`
- Create: `aicall-backend/src/main/java/com/aicall/common/aspect/LogAspect.java`

- [ ] **Step 1: 编写 Log 注解**

```java
package com.aicall.common.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {
    String value() default "";
}
```

- [ ] **Step 2: 编写 LogAspect 切面**

```java
package com.aicall.common.aspect;

import com.aicall.common.annotation.Log;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class LogAspect {
    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    @Around("@annotation(logAnnotation)")
    public Object around(ProceedingJoinPoint joinPoint, Log logAnnotation) throws Throwable {
        String operation = logAnnotation.value().isEmpty() ? joinPoint.getSignature().toShortString() : logAnnotation.value();
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        String ip = "";
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ip = request.getRemoteAddr();
        }
        log.info("[操作日志] {} - IP: {}", operation, ip);
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            log.info("[操作日志] {} - 耗时: {}ms - 结果: 成功", operation, System.currentTimeMillis() - start);
            return result;
        } catch (Throwable e) {
            log.warn("[操作日志] {} - 耗时: {}ms - 结果: 失败 - {}", operation, System.currentTimeMillis() - start, e.getMessage());
            throw e;
        }
    }
}
```

- [ ] **Step 3: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/common/annotation/ aicall-backend/src/main/java/com/aicall/common/aspect/
git commit -m "feat: add Log annotation and LogAspect"
```

---

## Task 5: Security — JwtTokenProvider + JwtAuthenticationFilter + UserDetailsServiceImpl + SecurityConfig

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/infrastructure/security/JwtTokenProvider.java`
- Create: `aicall-backend/src/main/java/com/aicall/infrastructure/security/JwtAuthenticationFilter.java`
- Create: `aicall-backend/src/main/java/com/aicall/infrastructure/security/UserDetailsServiceImpl.java`
- Create: `aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java`

- [ ] **Step 1: 编写 JwtTokenProvider**

```java
package com.aicall.infrastructure.security;

import com.aicall.common.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(Long userId, String username, String role) {
        return JwtUtil.generateToken(secret, expiration, String.valueOf(userId),
                Map.of("username", username, "role", role));
    }

    public Claims parseToken(String token) {
        return JwtUtil.parseToken(secret, token);
    }

    public boolean validateToken(String token) {
        return JwtUtil.isTokenValid(secret, token);
    }

    public Long getUserId(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getUsername(String token) {
        Claims claims = parseToken(token);
        return claims.get("username", String.class);
    }

    public String getRole(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }
}
```

- [ ] **Step 2: 编写 JwtAuthenticationFilter**

```java
package com.aicall.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);
        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            Long userId = jwtTokenProvider.getUserId(token);
            String username = jwtTokenProvider.getUsername(token);
            String role = jwtTokenProvider.getRole(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

- [ ] **Step 3: 编写 UserDetailsServiceImpl**

```java
package com.aicall.infrastructure.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        throw new UsernameNotFoundException("Use JWT token for authentication");
    }
}
```

- [ ] **Step 4: 编写 SecurityConfig**

```java
package com.aicall.config;

import com.aicall.infrastructure.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.aicall.common.result.Result;
import com.aicall.common.result.ResultCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/user/**").permitAll()
                .requestMatchers("/doctor/login").permitAll()
                .requestMatchers("/admin/login").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/doctor/**").authenticated()
                .requestMatchers("/admin/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(200);
                    response.getWriter().write(objectMapper.writeValueAsString(Result.fail(ResultCode.UNAUTHORIZED)));
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(200);
                    response.getWriter().write(objectMapper.writeValueAsString(Result.fail(ResultCode.FORBIDDEN)));
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 5: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/infrastructure/security/ aicall-backend/src/main/java/com/aicall/config/SecurityConfig.java
git commit -m "feat: add JWT authentication filter, token provider, and SecurityConfig"
```

---

## Task 6: 配置类 — WebConfig + RedisConfig + MinioConfig + WebSocketConfig + RabbitMqConfig + ScheduleConfig

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/config/WebConfig.java`
- Create: `aicall-backend/src/main/java/com/aicall/config/RedisConfig.java`
- Create: `aicall-backend/src/main/java/com/aicall/config/MinioConfig.java`
- Create: `aicall-backend/src/main/java/com/aicall/config/WebSocketConfig.java`
- Create: `aicall-backend/src/main/java/com/aicall/config/RabbitMqConfig.java`
- Create: `aicall-backend/src/main/java/com/aicall/config/ScheduleConfig.java`

- [ ] **Step 1: 编写 WebConfig**

```java
package com.aicall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

- [ ] **Step 2: 编写 RedisConfig**

```java
package com.aicall.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
```

- [ ] **Step 3: 编写 MinioConfig**

```java
package com.aicall.config;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioConfig {
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
```

- [ ] **Step 4: 编写 WebSocketConfig**

```java
package com.aicall.config;

import com.aicall.infrastructure.websocket.WebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    private final WebSocketHandler webSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/consultation")
                .setAllowedOriginPatterns("*");
    }
}
```

- [ ] **Step 5: 编写 RabbitMqConfig**

```java
package com.aicall.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    public static final String CONSULTATION_EXCHANGE = "consultation.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String NOTIFICATION_ROUTING_KEY = "notification";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public DirectExchange consultationExchange() {
        return new DirectExchange(CONSULTATION_EXCHANGE);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange consultationExchange) {
        return BindingBuilder.bind(notificationQueue).to(consultationExchange).with(NOTIFICATION_ROUTING_KEY);
    }
}
```

- [ ] **Step 6: 编写 ScheduleConfig**

```java
package com.aicall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class ScheduleConfig {
}
```

- [ ] **Step 7: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/config/
git commit -m "feat: add WebConfig, RedisConfig, MinioConfig, WebSocketConfig, RabbitMqConfig, ScheduleConfig"
```

---

## Task 7: Infrastructure 层 — WebSocketHandler + RabbitMqProducer + MinioStorageService

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/infrastructure/websocket/WebSocketHandler.java`
- Create: `aicall-backend/src/main/java/com/aicall/infrastructure/mq/RabbitMqProducer.java`
- Create: `aicall-backend/src/main/java/com/aicall/infrastructure/storage/MinioStorageService.java`

- [ ] **Step 1: 编写 WebSocketHandler**

```java
package com.aicall.infrastructure.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);
    private static final ConcurrentHashMap<String, WebSocketSession> SESSIONS = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        SESSIONS.put(session.getId(), session);
        log.info("WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        log.info("WebSocket message from {}: {}", session.getId(), message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        SESSIONS.remove(session.getId());
        log.info("WebSocket disconnected: {}, status: {}", session.getId(), status);
    }

    public void sendMessageToAll(String message) {
        SESSIONS.values().forEach(session -> {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                log.error("Failed to send WebSocket message to {}", session.getId(), e);
            }
        });
    }
}
```

- [ ] **Step 2: 编写 RabbitMqProducer**

```java
package com.aicall.infrastructure.mq;

import com.aicall.config.RabbitMqConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMqProducer {
    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(Object message) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.CONSULTATION_EXCHANGE,
                RabbitMqConfig.NOTIFICATION_ROUTING_KEY,
                message
        );
    }
}
```

- [ ] **Step 3: 编写 MinioStorageService**

```java
package com.aicall.infrastructure.storage;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.ResultCode;
import com.aicall.config.MinioConfig;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetObjectArgs;
import io.minio.RemoveObjectArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageService {
    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @PostConstruct
    public void init() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioConfig.getBucketName()).build());
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(minioConfig.getBucketName()).build());
                log.info("Created MinIO bucket: {}", minioConfig.getBucketName());
            }
        } catch (Exception e) {
            log.warn("MinIO bucket init failed: {}", e.getMessage());
        }
    }

    public String upload(String objectName, InputStream inputStream, String contentType, long size) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .stream(inputStream, size, -1)
                            .contentType(contentType)
                            .build());
            return String.format("%s/%s/%s", minioConfig.getEndpoint(), minioConfig.getBucketName(), objectName);
        } catch (Exception e) {
            throw BusinessException.fail(ResultCode.INTERNAL_ERROR.getCode(), "文件上传失败: " + e.getMessage());
        }
    }

    public InputStream download(String objectName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw BusinessException.fail(ResultCode.INTERNAL_ERROR.getCode(), "文件下载失败: " + e.getMessage());
        }
    }

    public void delete(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw BusinessException.fail(ResultCode.INTERNAL_ERROR.getCode(), "文件删除失败: " + e.getMessage());
        }
    }
}
```

- [ ] **Step 4: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/infrastructure/
git commit -m "feat: add WebSocketHandler, RabbitMqProducer, MinioStorageService"
```

---

## Task 8: AI 配置 — AiConfig

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/config/AiConfig.java`

- [ ] **Step 1: 编写 AiConfig**

```java
package com.aicall.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Value("${ai.silicon-flow.base-url}")
    private String baseUrl;

    @Value("${ai.silicon-flow.api-key}")
    private String apiKey;

    @Value("${ai.silicon-flow.chat-model}")
    private String chatModel;

    @Value("${ai.silicon-flow.embedding-model}")
    private String embeddingModel;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .modelName(chatModel)
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return OpenAiEmbeddingModel.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .modelName(embeddingModel)
                .build();
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/config/AiConfig.java
git commit -m "feat: add AiConfig with LangChain4j ChatLanguageModel and EmbeddingModel"
```

---

## Task 9: 登录接口 — Admin + Doctor

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/entity/Admin.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/mapper/AdminMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/LoginRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/dto/LoginResponse.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/service/AdminService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/admin/controller/AdminController.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/entity/Doctor.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/mapper/DoctorMapper.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/LoginRequest.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/dto/LoginResponse.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/service/DoctorService.java`
- Create: `aicall-backend/src/main/java/com/aicall/module/doctor/controller/DoctorController.java`
- Create: `aicall-backend/src/main/resources/mapper/AdminMapper.xml`
- Create: `aicall-backend/src/main/resources/mapper/DoctorMapper.xml`

- [ ] **Step 1: 编写 Admin 实体**

```java
package com.aicall.module.admin.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Admin {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String phone;
    private Integer status;
    private Long roleId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 2: 编写 Doctor 实体**

```java
package com.aicall.module.doctor.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Doctor {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String title;
    private String department;
    private String phone;
    private String avatar;
    private String introduction;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 3: 编写 AdminMapper**

```java
package com.aicall.module.admin.mapper;

import com.aicall.module.admin.entity.Admin;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminMapper {
    Admin findByUsername(String username);
}
```

- [ ] **Step 4: 编写 DoctorMapper**

```java
package com.aicall.module.doctor.mapper;

import com.aicall.module.doctor.entity.Doctor;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DoctorMapper {
    Doctor findByUsername(String username);
}
```

- [ ] **Step 5: 编写 AdminMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.admin.mapper.AdminMapper">
    <select id="findByUsername" resultType="com.aicall.module.admin.entity.Admin">
        SELECT * FROM admin WHERE username = #{username}
    </select>
</mapper>
```

- [ ] **Step 6: 编写 DoctorMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.aicall.module.doctor.mapper.DoctorMapper">
    <select id="findByUsername" resultType="com.aicall.module.doctor.entity.Doctor">
        SELECT * FROM doctor WHERE username = #{username}
    </select>
</mapper>
```

- [ ] **Step 7: 编写 Admin LoginRequest/Response**

```java
package com.aicall.module.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;
}
```

```java
package com.aicall.module.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String name;
}
```

- [ ] **Step 8: 编写 Doctor LoginRequest/Response**

```java
package com.aicall.module.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;
}
```

```java
package com.aicall.module.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String name;
}
```

- [ ] **Step 9: 编写 AdminService**

```java
package com.aicall.module.admin.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.ResultCode;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.admin.dto.LoginRequest;
import com.aicall.module.admin.dto.LoginResponse;
import com.aicall.module.admin.entity.Admin;
import com.aicall.module.admin.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Admin admin = adminMapper.findByUsername(request.getUsername());
        if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw BusinessException.fail(ResultCode.UNAUTHORIZED.getCode(), "账号或密码错误");
        }
        if (admin.getStatus() != 1) {
            throw BusinessException.fail("账号已禁用");
        }
        String token = jwtTokenProvider.generateToken(admin.getId(), admin.getUsername(), "ADMIN");
        return new LoginResponse(token, admin.getUsername(), admin.getName());
    }
}
```

- [ ] **Step 10: 编写 DoctorService**

```java
package com.aicall.module.doctor.service;

import com.aicall.common.exception.BusinessException;
import com.aicall.common.result.ResultCode;
import com.aicall.infrastructure.security.JwtTokenProvider;
import com.aicall.module.doctor.dto.LoginRequest;
import com.aicall.module.doctor.dto.LoginResponse;
import com.aicall.module.doctor.entity.Doctor;
import com.aicall.module.doctor.mapper.DoctorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorMapper doctorMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Doctor doctor = doctorMapper.findByUsername(request.getUsername());
        if (doctor == null || !passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw BusinessException.fail(ResultCode.DOCTOR_LOGIN_FAILED);
        }
        if (doctor.getStatus() != 1) {
            throw BusinessException.fail(ResultCode.DOCTOR_ACCOUNT_DISABLED);
        }
        String token = jwtTokenProvider.generateToken(doctor.getId(), doctor.getUsername(), "DOCTOR");
        return new LoginResponse(token, doctor.getUsername(), doctor.getName());
    }
}
```

- [ ] **Step 11: 编写 AdminController**

```java
package com.aicall.module.admin.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.admin.dto.LoginRequest;
import com.aicall.module.admin.dto.LoginResponse;
import com.aicall.module.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/login")
    @Log("管理员登录")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(adminService.login(request));
    }
}
```

- [ ] **Step 12: 编写 DoctorController**

```java
package com.aicall.module.doctor.controller;

import com.aicall.common.annotation.Log;
import com.aicall.common.result.Result;
import com.aicall.module.doctor.dto.LoginRequest;
import com.aicall.module.doctor.dto.LoginResponse;
import com.aicall.module.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;

    @PostMapping("/login")
    @Log("医生登录")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(doctorService.login(request));
    }
}
```

- [ ] **Step 13: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/admin/ aicall-backend/src/main/java/com/aicall/module/doctor/ aicall-backend/src/main/resources/mapper/
git commit -m "feat: add admin and doctor login with JWT authentication"
```

---

## Task 10: AI 测试接口

**Files:**
- Create: `aicall-backend/src/main/java/com/aicall/module/ai/controller/AiTestController.java`

- [ ] **Step 1: 编写 AiTestController**

```java
package com.aicall.module.ai.controller;

import com.aicall.common.result.Result;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiTestController {
    private final ChatLanguageModel chatLanguageModel;
    private final EmbeddingModel embeddingModel;

    @GetMapping("/chat")
    public Result<Map<String, String>> chat(@RequestParam String message) {
        String response = chatLanguageModel.generate(message);
        return Result.success(Map.of("response", response));
    }

    @GetMapping("/embedding")
    public Result<Map<String, Object>> embedding(@RequestParam String text) {
        var response = embeddingModel.embed(text);
        return Result.success(Map.of(
                "dimension", response.content().dimension(),
                "vectorSize", response.content().vector().length
        ));
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add aicall-backend/src/main/java/com/aicall/module/ai/
git commit -m "feat: add AI test controller for ChatLanguageModel and EmbeddingModel"
```

---

## Task 11: 数据库初始化 SQL

**Files:**
- Create: `sql/init.sql`

- [ ] **Step 1: 编写 init.sql**

```sql
-- AICall 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS aicall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aicall;

-- =============================================
-- 用户与医生
-- =============================================

CREATE TABLE IF NOT EXISTS `patient` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT '患者姓名',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `gender` TINYINT DEFAULT NULL COMMENT '性别 0女1男',
    `age` INT DEFAULT NULL COMMENT '年龄',
    `id_card` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='患者信息';

CREATE TABLE IF NOT EXISTS `doctor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL COMMENT '登录账号',
    `password` VARCHAR(200) NOT NULL COMMENT '密码(BCrypt)',
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `title` VARCHAR(50) DEFAULT NULL COMMENT '职称',
    `department` VARCHAR(50) DEFAULT NULL COMMENT '科室',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `introduction` TEXT DEFAULT NULL COMMENT '简介',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生';

CREATE TABLE IF NOT EXISTS `admin` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL COMMENT '登录账号',
    `password` VARCHAR(200) NOT NULL COMMENT '密码(BCrypt)',
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `role_id` BIGINT DEFAULT NULL COMMENT '角色ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员';

CREATE TABLE IF NOT EXISTS `doctor_schedule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `doctor_id` BIGINT NOT NULL COMMENT '医生ID',
    `schedule_date` DATE NOT NULL COMMENT '排班日期',
    `start_time` TIME NOT NULL COMMENT '开始时间',
    `end_time` TIME NOT NULL COMMENT '结束时间',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0已预约1可用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_doctor_date` (`doctor_id`, `schedule_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生排班';

-- =============================================
-- 会诊与报告
-- =============================================

CREATE TABLE IF NOT EXISTS `consultation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_no` VARCHAR(32) NOT NULL COMMENT '会诊编号',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型 1单学科2多学科MDT',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0已提交1资料审核中2专家确认中3已排期4待会诊5会诊中6已完成7已取消8已退回',
    `department` VARCHAR(50) DEFAULT NULL COMMENT '科室',
    `chief_complaint` TEXT DEFAULT NULL COMMENT '主诉',
    `medical_summary` TEXT DEFAULT NULL COMMENT 'AI病情摘要',
    `fee` DECIMAL(10,2) DEFAULT NULL COMMENT '会诊费用',
    `payment_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态 0未支付1已支付2已退款',
    `scheduled_time` DATETIME DEFAULT NULL COMMENT '排期时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
    `reject_reason` VARCHAR(500) DEFAULT NULL COMMENT '退回原因',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_consultation_no` (`consultation_no`),
    INDEX `idx_patient` (`patient_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊主表';

CREATE TABLE IF NOT EXISTS `consultation_doctor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `doctor_id` BIGINT NOT NULL COMMENT '医生ID',
    `role` TINYINT NOT NULL DEFAULT 0 COMMENT '角色 0普通专家1主持人',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待确认1已确认2已拒绝',
    `confirm_time` DATETIME DEFAULT NULL COMMENT '确认时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`),
    INDEX `idx_doctor` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊-医生关联';

CREATE TABLE IF NOT EXISTS `consultation_status_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `from_status` TINYINT DEFAULT NULL COMMENT '原状态',
    `to_status` TINYINT NOT NULL COMMENT '新状态',
    `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊状态变更日志';

CREATE TABLE IF NOT EXISTS `consultation_upload` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
    `file_type` TINYINT NOT NULL COMMENT '类型 1影像2化验单3病理报告4其他',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
    `ocr_result` TEXT DEFAULT NULL COMMENT 'OCR识别结果',
    `ai_review` TEXT DEFAULT NULL COMMENT 'AI审核结果',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='上传资料记录';

CREATE TABLE IF NOT EXISTS `report` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型 1专业版2患者版',
    `content` LONGTEXT DEFAULT NULL COMMENT '报告内容(JSON)',
    `pdf_url` VARCHAR(500) DEFAULT NULL COMMENT 'PDF文件URL',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0草稿1待审核2已签发',
    `signed_by` BIGINT DEFAULT NULL COMMENT '签发医生ID',
    `signed_time` DATETIME DEFAULT NULL COMMENT '签发时间',
    `template_id` BIGINT DEFAULT NULL COMMENT '报告模板ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊报告';

CREATE TABLE IF NOT EXISTS `report_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `department` VARCHAR(50) DEFAULT NULL COMMENT '科室',
    `content_template` LONGTEXT NOT NULL COMMENT '模板内容(JSON)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告模板';

-- =============================================
-- 支付与通知
-- =============================================

CREATE TABLE IF NOT EXISTS `payment_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
    `fee_detail` JSON DEFAULT NULL COMMENT '费用明细',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待支付1已支付2已退款',
    `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付订单';

CREATE TABLE IF NOT EXISTS `payment_refund` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `refund_no` VARCHAR(32) NOT NULL COMMENT '退款单号',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
    `reason` VARCHAR(500) DEFAULT NULL COMMENT '退款原因',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0处理中1已退款2退款失败',
    `refund_time` DATETIME DEFAULT NULL COMMENT '退款时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款记录';

CREATE TABLE IF NOT EXISTS `notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_type` TINYINT NOT NULL COMMENT '用户类型 1患者2医生3管理员',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号(患者)',
    `type` TINYINT NOT NULL COMMENT '通知类型 1短信2站内信3WebSocket推送',
    `title` VARCHAR(200) DEFAULT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '内容',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待发送1已发送2发送失败',
    `send_time` DATETIME DEFAULT NULL COMMENT '发送时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user` (`user_type`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知记录';

-- =============================================
-- 影像与音视频
-- =============================================

CREATE TABLE IF NOT EXISTS `imaging_file` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
    `file_type` VARCHAR(20) DEFAULT NULL COMMENT '文件类型(DICOM/JPG/PNG)',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小',
    `ai_analysis` TEXT DEFAULT NULL COMMENT 'AI影像分析结果',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='影像文件记录';

CREATE TABLE IF NOT EXISTS `live_room` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `room_id` VARCHAR(100) NOT NULL COMMENT 'TRTC房间号',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0未开始1进行中2已结束',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会诊室记录';

CREATE TABLE IF NOT EXISTS `live_recording` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `room_id` BIGINT NOT NULL COMMENT '会诊室ID',
    `file_url` VARCHAR(500) NOT NULL COMMENT '录制文件URL',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小',
    `duration` INT DEFAULT NULL COMMENT '时长(秒)',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='录制文件';

-- =============================================
-- 管理与系统
-- =============================================

CREATE TABLE IF NOT EXISTS `qc_result` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `report_id` BIGINT NOT NULL COMMENT '报告ID',
    `completeness_score` DECIMAL(5,2) DEFAULT NULL COMMENT '完整性得分',
    `standard_score` DECIMAL(5,2) DEFAULT NULL COMMENT '规范性得分',
    `consistency_score` DECIMAL(5,2) DEFAULT NULL COMMENT '一致性得分',
    `total_score` DECIMAL(5,2) DEFAULT NULL COMMENT '总分',
    `issues` TEXT DEFAULT NULL COMMENT '问题列表(JSON)',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待处理1已通过2退回修改',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_report` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告质控结果';

CREATE TABLE IF NOT EXISTS `operation_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_type` TINYINT NOT NULL COMMENT '用户类型 2医生3管理员',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `operation` VARCHAR(200) NOT NULL COMMENT '操作描述',
    `method` VARCHAR(200) DEFAULT NULL COMMENT '请求方法',
    `params` TEXT DEFAULT NULL COMMENT '请求参数',
    `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user` (`user_type`, `user_id`),
    INDEX `idx_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志';

CREATE TABLE IF NOT EXISTS `sys_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT NOT NULL COMMENT '配置值',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置';

CREATE TABLE IF NOT EXISTS `sys_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色';

CREATE TABLE IF NOT EXISTS `sys_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `permission_name` VARCHAR(100) NOT NULL COMMENT '权限名称',
    `permission_code` VARCHAR(100) NOT NULL COMMENT '权限编码',
    `type` TINYINT NOT NULL COMMENT '类型 1菜单2按钮',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父权限ID',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0禁用1启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permission_code` (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限';

CREATE TABLE IF NOT EXISTS `sys_role_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限ID',
    PRIMARY KEY (`id`),
    INDEX `idx_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联';

CREATE TABLE IF NOT EXISTS `follow_up` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `plan_day` INT NOT NULL COMMENT '随访天数(第N天)',
    `questionnaire` TEXT DEFAULT NULL COMMENT '问卷内容(JSON)',
    `answer` TEXT DEFAULT NULL COMMENT '回答内容(JSON)',
    `ai_analysis` TEXT DEFAULT NULL COMMENT 'AI分析结果',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0待发送1已发送2已回答3异常提醒',
    `send_time` DATETIME DEFAULT NULL COMMENT '发送时间',
    `answer_time` DATETIME DEFAULT NULL COMMENT '回答时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='随访记录';

CREATE TABLE IF NOT EXISTS `evaluation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consultation_id` BIGINT NOT NULL COMMENT '会诊ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者ID',
    `doctor_score` TINYINT DEFAULT NULL COMMENT '专家评分(1-5)',
    `service_score` TINYINT DEFAULT NULL COMMENT '服务评分(1-5)',
    `comment` VARCHAR(500) DEFAULT NULL COMMENT '文字评价',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_consultation` (`consultation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价';

-- =============================================
-- 初始数据
-- =============================================

-- 角色
INSERT INTO `sys_role` (`id`, `role_name`, `role_code`, `remark`) VALUES
(1, '超级管理员', 'SUPER_ADMIN', '拥有所有权限'),
(2, '运营管理员', 'OPERATOR', '日常运营管理'),
(3, '质控管理员', 'QC_ADMIN', '质量管理'),
(4, '财务管理员', 'FINANCE_ADMIN', '财务管理');

-- 权限
INSERT INTO `sys_permission` (`id`, `permission_name`, `permission_code`, `type`, `parent_id`, `sort_order`) VALUES
(1, '系统管理', 'system', 1, NULL, 1),
(2, '用户管理', 'system:user', 1, 1, 1),
(3, '角色管理', 'system:role', 1, 1, 2),
(4, '业务管理', 'business', 1, NULL, 2),
(5, '会诊管理', 'business:consultation', 1, 4, 1),
(6, '医生管理', 'business:doctor', 1, 4, 2),
(7, '质控管理', 'business:qc', 1, 4, 3),
(8, '财务管理', 'business:finance', 1, 4, 4),
(9, '数据大屏', 'business:dashboard', 1, 4, 5);

-- 角色权限(超级管理员拥有所有权限)
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9);

-- 管理员(密码: admin123, BCrypt加密)
INSERT INTO `admin` (`id`, `username`, `password`, `name`, `role_id`) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '超级管理员', 1);

-- 示例医生(密码: 123456, BCrypt加密)
INSERT INTO `doctor` (`id`, `username`, `password`, `name`, `title`, `department`, `status`) VALUES
(1, 'zhangsan', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '张三', '主任医师', '肿瘤内科', 1),
(2, 'lisi', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '李四', '副主任医师', '外科', 1),
(3, 'wangwu', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '王五', '主治医师', '放射科', 1),
(4, 'zhaoliu', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '赵六', '主任医师', '心血管内科', 1),
(5, 'sunqi', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz7aKdBdCkqy5uLbTLyqG', '孙七', '副主任医师', '病理科', 1);

-- 系统配置
INSERT INTO `sys_config` (`config_key`, `config_value`, `remark`) VALUES
('single_fee', '500.00', '单学科会诊费用'),
('mdt_fee', '1500.00', '多学科会诊费用'),
('platform_service_rate', '0.10', '平台服务费比例'),
('follow_up_days', '3,7,30', '随访天数'),
('consultation_timeout_hours', '48', '会诊超时时间(小时)');

-- 报告模板
INSERT INTO `report_template` (`id`, `name`, `department`, `content_template`) VALUES
(1, '通用会诊报告模板', NULL, '{"sections":[{"title":"会诊经过","key":"process"},{"title":"诊断分析讨论","key":"analysis"},{"title":"最终诊断","key":"diagnosis"},{"title":"治疗建议","key":"suggestion"}]}');
```

- [ ] **Step 2: 执行 SQL 创建数据库和表**

```bash
mysql -u root -proot < sql/init.sql
```

Expected: 所有表创建成功，无报错。

- [ ] **Step 3: 提交**

```bash
git add sql/
git commit -m "feat: add database init SQL with all tables and seed data"
```

---

## Task 12: Docker Compose

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: 编写 docker-compose.yml**

```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: aicall-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  qdrant:
    image: qdrant/qdrant:latest
    container_name: aicall-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  rabbitmq_data:
  qdrant_data:
```

- [ ] **Step 2: 启动 Docker Compose**

```bash
docker-compose up -d
```

Expected: RabbitMQ 和 Qdrant 容器正常启动。

- [ ] **Step 3: 提交**

```bash
git add docker-compose.yml
git commit -m "feat: add Docker Compose for RabbitMQ and Qdrant"
```

---

## Task 13: 前端 Monorepo — 根配置 + shared 包

**Files:**
- Create: `frontend/pnpm-workspace.yaml`
- Create: `frontend/package.json`
- Create: `frontend/.eslintrc.js`
- Create: `frontend/.prettierrc`
- Create: `frontend/packages/shared/package.json`
- Create: `frontend/packages/shared/tsconfig.json`
- Create: `frontend/packages/shared/src/api/request.ts`
- Create: `frontend/packages/shared/src/api/index.ts`
- Create: `frontend/packages/shared/src/types/index.ts`
- Create: `frontend/packages/shared/src/utils/index.ts`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p frontend/packages/shared/src/api
mkdir -p frontend/packages/shared/src/types
mkdir -p frontend/packages/shared/src/utils
```

- [ ] **Step 2: 编写 pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 3: 编写根 package.json**

```json
{
  "name": "aicall-frontend",
  "private": true,
  "scripts": {
    "dev:user": "pnpm -C packages/user dev",
    "dev:doctor": "pnpm -C packages/doctor dev",
    "dev:admin": "pnpm -C packages/admin dev",
    "build:user": "pnpm -C packages/user build",
    "build:doctor": "pnpm -C packages/doctor build",
    "build:admin": "pnpm -C packages/admin build",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"packages/**/*.{ts,vue,js,json,css}\""
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.28.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.3.0"
  }
}
```

- [ ] **Step 4: 编写 .eslintrc.js**

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 5: 编写 .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 6: 编写 shared/package.json**

```json
{
  "name": "@aicall/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 7: 编写 shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 8: 编写 shared/src/api/request.ts**

```typescript
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data;
    if (code !== 200) {
      return Promise.reject(new Error(message || '请求失败'));
    }
    return data as any;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络异常';
    return Promise.reject(new Error(message));
  },
);

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return instance.get(url, config);
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return instance.post(url, data, config);
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return instance.put(url, data, config);
}

export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return instance.delete(url, config);
}

export default instance;
```

- [ ] **Step 9: 编写 shared/src/api/index.ts**

```typescript
export { get, post, put, del, default as request } from './request';
export type { ApiResponse } from './request';
```

- [ ] **Step 10: 编写 shared/src/types/index.ts**

```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  name: string;
}

export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}
```

- [ ] **Step 11: 编写 shared/src/utils/index.ts**

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function desensitizePhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
}

export function desensitizeName(name: string): string {
  if (!name || name.length <= 1) return name;
  return name.charAt(0) + '*'.repeat(name.length - 1);
}
```

- [ ] **Step 12: 提交**

```bash
git add frontend/
git commit -m "feat: add frontend monorepo root config and shared package"
```

---

## Task 14: 前端 — 用户端 (Vant 4)

**Files:**
- Create: `frontend/packages/user/package.json`
- Create: `frontend/packages/user/tsconfig.json`
- Create: `frontend/packages/user/tsconfig.node.json`
- Create: `frontend/packages/user/vite.config.ts`
- Create: `frontend/packages/user/index.html`
- Create: `frontend/packages/user/src/main.ts`
- Create: `frontend/packages/user/src/App.vue`
- Create: `frontend/packages/user/src/router/index.ts`
- Create: `frontend/packages/user/src/views/Home.vue`
- Create: `frontend/packages/user/src/env.d.ts`

- [ ] **Step 1: 创建用户端目录**

```bash
mkdir -p frontend/packages/user/src/router
mkdir -p frontend/packages/user/src/views
```

- [ ] **Step 2: 编写 user/package.json**

```json
{
  "name": "@aicall/user",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.vue"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "vant": "^4.9.0",
    "@aicall/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vue-tsc": "^2.1.0",
    "@vant/auto-import-resolver": "^1.2.0",
    "unplugin-auto-import": "^0.18.0",
    "unplugin-vue-components": "^0.27.0"
  }
}
```

- [ ] **Step 3: 编写 user/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src", "env.d.ts"]
}
```

- [ ] **Step 4: 编写 user/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 编写 user/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 6: 编写 user/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>AICall - 在线会诊</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: 编写 user/src/env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 8: 编写 user/src/main.ts**

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

const app = createApp(App);
app.use(router);
app.mount('#app');
```

- [ ] **Step 9: 编写 user/src/App.vue**

```vue
<template>
  <router-view />
</template>
```

- [ ] **Step 10: 编写 user/src/router/index.ts**

```typescript
import type { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
];

export default routes;
```

- [ ] **Step 11: 编写 user/src/views/Home.vue**

```vue
<template>
  <div class="home">
    <van-nav-bar title="AICall 在线会诊" />
    <div class="content">
      <van-cell-group inset>
        <van-cell title="发起会诊" is-link to="/consultation/create" icon="add-o" />
        <van-cell title="查询会诊" is-link to="/consultation/query" icon="search" />
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: #f7f8fa;
}
.content {
  padding: 16px;
}
</style>
```

- [ ] **Step 12: 安装依赖并启动**

```bash
cd frontend && pnpm install
pnpm dev:user
```

Expected: 用户端在 http://localhost:3000 启动成功。

- [ ] **Step 13: 提交**

```bash
git add frontend/packages/user/
git commit -m "feat: add user frontend with Vant 4 and Vue Router"
```

---

## Task 15: 前端 — 医生端 (Element Plus)

**Files:**
- Create: `frontend/packages/doctor/package.json`
- Create: `frontend/packages/doctor/tsconfig.json`
- Create: `frontend/packages/doctor/tsconfig.node.json`
- Create: `frontend/packages/doctor/vite.config.ts`
- Create: `frontend/packages/doctor/index.html`
- Create: `frontend/packages/doctor/src/main.ts`
- Create: `frontend/packages/doctor/src/App.vue`
- Create: `frontend/packages/doctor/src/router/index.ts`
- Create: `frontend/packages/doctor/src/views/Login.vue`
- Create: `frontend/packages/doctor/src/env.d.ts`

- [ ] **Step 1: 创建医生端目录**

```bash
mkdir -p frontend/packages/doctor/src/router
mkdir -p frontend/packages/doctor/src/views
```

- [ ] **Step 2: 编写 doctor/package.json**

```json
{
  "name": "@aicall/doctor",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.vue"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "element-plus": "^2.9.0",
    "@aicall/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vue-tsc": "^2.1.0",
    "unplugin-auto-import": "^0.18.0",
    "unplugin-vue-components": "^0.27.0"
  }
}
```

- [ ] **Step 3: 编写 doctor/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src", "env.d.ts"]
}
```

- [ ] **Step 4: 编写 doctor/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 编写 doctor/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 6: 编写 doctor/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AICall - 医生工作台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: 编写 doctor/src/env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 8: 编写 doctor/src/main.ts**

```typescript
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import App from './App.vue';
import routes from './router';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(ElementPlus, { locale: zhCn });
app.mount('#app');
```

- [ ] **Step 9: 编写 doctor/src/App.vue**

```vue
<template>
  <router-view />
</template>
```

- [ ] **Step 10: 编写 doctor/src/router/index.ts**

```typescript
import type { RouteRecordRaw } from 'vue-router';
import Login from '@/views/Login.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

export default routes;
```

- [ ] **Step 11: 编写 doctor/src/views/Login.vue**

```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>AICall 医生工作台</h2>
      </template>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { post } from '@aicall/shared';
import type { LoginResponse } from '@aicall/shared';

const form = reactive({ username: '', password: '' });
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const res = await post<LoginResponse>('/doctor/login', form);
    localStorage.setItem('token', res.token);
    localStorage.setItem('userName', res.name);
  } catch (e: any) {
    console.error(e.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
}
.login-card h2 {
  text-align: center;
  margin: 0;
}
</style>
```

- [ ] **Step 12: 安装依赖并启动**

```bash
cd frontend && pnpm install
pnpm dev:doctor
```

Expected: 医生端在 http://localhost:3001 启动成功。

- [ ] **Step 13: 提交**

```bash
git add frontend/packages/doctor/
git commit -m "feat: add doctor frontend with Element Plus and login page"
```

---

## Task 16: 前端 — 管理端 (Element Plus)

**Files:**
- Create: `frontend/packages/admin/package.json`
- Create: `frontend/packages/admin/tsconfig.json`
- Create: `frontend/packages/admin/tsconfig.node.json`
- Create: `frontend/packages/admin/vite.config.ts`
- Create: `frontend/packages/admin/index.html`
- Create: `frontend/packages/admin/src/main.ts`
- Create: `frontend/packages/admin/src/App.vue`
- Create: `frontend/packages/admin/src/router/index.ts`
- Create: `frontend/packages/admin/src/views/Login.vue`
- Create: `frontend/packages/admin/src/env.d.ts`

- [ ] **Step 1: 创建管理端目录**

```bash
mkdir -p frontend/packages/admin/src/router
mkdir -p frontend/packages/admin/src/views
```

- [ ] **Step 2: 编写 admin/package.json**

```json
{
  "name": "@aicall/admin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.vue"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "element-plus": "^2.9.0",
    "echarts": "^5.5.0",
    "@aicall/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vue-tsc": "^2.1.0",
    "unplugin-auto-import": "^0.18.0",
    "unplugin-vue-components": "^0.27.0"
  }
}
```

- [ ] **Step 3: 编写 admin/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src", "env.d.ts"]
}
```

- [ ] **Step 4: 编写 admin/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 编写 admin/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 6: 编写 admin/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AICall - 管理后台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: 编写 admin/src/env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 8: 编写 admin/src/main.ts**

```typescript
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import App from './App.vue';
import routes from './router';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(ElementPlus, { locale: zhCn });
app.mount('#app');
```

- [ ] **Step 9: 编写 admin/src/App.vue**

```vue
<template>
  <router-view />
</template>
```

- [ ] **Step 10: 编写 admin/src/router/index.ts**

```typescript
import type { RouteRecordRaw } from 'vue-router';
import Login from '@/views/Login.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

export default routes;
```

- [ ] **Step 11: 编写 admin/src/views/Login.vue**

```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>AICall 管理后台</h2>
      </template>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { post } from '@aicall/shared';
import type { LoginResponse } from '@aicall/shared';

const form = reactive({ username: '', password: '' });
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const res = await post<LoginResponse>('/admin/login', form);
    localStorage.setItem('token', res.token);
    localStorage.setItem('userName', res.name);
  } catch (e: any) {
    console.error(e.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
}
.login-card h2 {
  text-align: center;
  margin: 0;
}
</style>
```

- [ ] **Step 12: 安装依赖并启动**

```bash
cd frontend && pnpm install
pnpm dev:admin
```

Expected: 管理端在 http://localhost:3002 启动成功。

- [ ] **Step 13: 提交**

```bash
git add frontend/packages/admin/
git commit -m "feat: add admin frontend with Element Plus and login page"
```

---

## Task 17: 验收测试

- [ ] **Step 1: 启动 Docker Compose（RabbitMQ + Qdrant）**

```bash
docker-compose up -d
```

Expected: 两个容器正常运行。

- [ ] **Step 2: 执行数据库初始化**

```bash
mysql -u root -proot < sql/init.sql
```

Expected: 数据库 aicall 和所有表创建成功。

- [ ] **Step 3: 启动后端**

```bash
cd aicall-backend && mvn spring-boot:run
```

Expected: 应用在 8080 端口启动成功，无报错。

- [ ] **Step 4: 测试用户端接口（无需认证）**

```bash
curl http://localhost:8080/api/ai/chat?message=你好
```

Expected: 返回 AI 聊天响应（需要有效的 SILICON_FLOW_API_KEY）。

- [ ] **Step 5: 测试医生端接口（需要认证）**

```bash
curl http://localhost:8080/api/doctor/login -X POST -H "Content-Type: application/json" -d '{"username":"zhangsan","password":"123456"}'
```

Expected: 返回 token。

```bash
curl http://localhost:8080/api/doctor/some-protected-endpoint -H "Authorization: Bearer <token>"
```

Expected: 返回 200（端点不存在则 404，但不是 401）。

- [ ] **Step 6: 测试管理员登录**

```bash
curl http://localhost:8080/api/admin/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
```

Expected: 返回 token。

- [ ] **Step 7: 测试未认证访问受保护接口**

```bash
curl http://localhost:8080/api/doctor/some-endpoint
```

Expected: 返回 `{"code":401,"message":"未认证","data":null}`。

- [ ] **Step 8: 启动三端前端**

```bash
cd frontend && pnpm install && pnpm dev:user & pnpm dev:doctor & pnpm dev:admin
```

Expected:
- 用户端 http://localhost:3000 可访问
- 医生端 http://localhost:3001 可访问，显示登录页
- 管理端 http://localhost:3002 可访问，显示登录页

- [ ] **Step 9: 最终提交**

```bash
git add -A
git commit -m "feat: complete project skeleton with backend, frontend, and infrastructure"
```

---

## Self-Review

**1. Spec coverage:**
- 后端项目结构 ✅ (Task 1)
- 公共组件 Result/ResultCode/BusinessException/GlobalExceptionHandler ✅ (Task 2)
- 工具类 JwtUtil/DesensitizeUtil ✅ (Task 3)
- 日志注解+切面 ✅ (Task 4)
- Security 配置 ✅ (Task 5)
- 配置类 WebConfig/RedisConfig/MinioConfig/WebSocketConfig/RabbitMqConfig/ScheduleConfig ✅ (Task 6)
- Infrastructure 层 WebSocketHandler/RabbitMqProducer/MinioStorageService ✅ (Task 7)
- AI 配置 AiConfig ✅ (Task 8)
- 登录接口 Admin/Doctor ✅ (Task 9)
- AI 测试接口 ✅ (Task 10)
- 数据库初始化 SQL ✅ (Task 11)
- Docker Compose ✅ (Task 12)
- 前端 Monorepo + shared ✅ (Task 13)
- 用户端 Vant ✅ (Task 14)
- 医生端 Element Plus ✅ (Task 15)
- 管理端 Element Plus ✅ (Task 16)
- 验收测试 ✅ (Task 17)

**2. Placeholder scan:** No TBD/TODO found. All steps contain complete code.

**3. Type consistency:**
- `Result.fail()` signatures consistent across BusinessException handler and SecurityConfig
- `LoginRequest`/`LoginResponse` types match between frontend shared and backend DTOs
- `JwtTokenProvider.generateToken()` params (userId, username, role) match `JwtAuthenticationFilter` extraction
- `RabbitMqProducer.sendNotification()` uses `RabbitMqConfig` constants correctly
