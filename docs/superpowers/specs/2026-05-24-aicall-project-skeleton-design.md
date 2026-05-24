# AICall 项目整体分解与子项目 1 设计

## 项目定位

- **类型**：学习/展示项目，核心流程跑通即可
- **重点**：后端 + AI 中台
- **简化方向**：前端 UI 不做过度打磨，DICOM 降级为普通图片查看，ES 用 MySQL LIKE 替代，XXL-JOB 用 Spring Task 替代

## 整体分解（6 个子项目）

| 序号 | 子项目 | 核心产出 | AI 能力 |
|:-----|:-------|:---------|:--------|
| 1 | 项目骨架 + 基础设施 | 空项目启动、三端前端脚手架、基础设施就绪 | LangChain4j + Chat API 配通 |
| 2 | 用户端核心流程 | AI 预问诊 → 资料上传 → OCR → 费用 → 模拟支付 | LLM 对话、OCR、Embedding、RAG |
| 3 | 医生端核心流程 | 登录 → 工作台 → 审核会诊 → AI 报告 → 签名签发 | 病历预分析、报告生成、质控 |
| 4 | 音视频会诊室 | TRTC 集成、会诊室、实时字幕、纪要生成 | ASR、要点速记 |
| 5 | 管理端 + 数据大屏 | 管理员登录、分诊调度、质控、财务、驾驶舱 | 趋势预测、满意度分析 |
| 6 | AI 智能随访 + 通知 | 定时随访、AI 异常判断、短信/站内信 | 随访分析、通知 |

构建顺序：1 → 2 → 3 → 4 → 5 → 6，每个子项目独立 spec → plan → 实现。

---

## 子项目 1：项目骨架 + 基础设施

### 1. 后端项目结构

Spring Boot 3 + Java 17 单体项目：

```
aicall-backend/
├── pom.xml
├── src/main/java/com/aicall/
│   ├── AicallApplication.java
│   ├── config/
│   │   ├── WebConfig.java           # CORS、拦截器
│   │   ├── SecurityConfig.java      # Spring Security + JWT Filter
│   │   ├── WebSocketConfig.java     # WebSocket 配置
│   │   ├── RedisConfig.java         # Redis 序列化配置
│   │   ├── MinioConfig.java         # MinIO 客户端配置
│   │   ├── RabbitMqConfig.java      # RabbitMQ 交换机/队列声明
│   │   └── AiConfig.java            # LangChain4j 模型 Bean 配置
│   ├── common/
│   │   ├── result/
│   │   │   ├── Result.java          # 统一返回 Result<T>
│   │   │   └── ResultCode.java      # 状态码枚举
│   │   ├── exception/
│   │   │   ├── BusinessException.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── annotation/
│   │   │   └── Log.java             # 操作日志注解
│   │   ├── aspect/
│   │   │   └── LogAspect.java       # 日志切面
│   │   └── util/
│   │       ├── JwtUtil.java
│   │       └── DesensitizeUtil.java
│   ├── infrastructure/
│   │   ├── security/
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtTokenProvider.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── websocket/
│   │   │   └── WebSocketHandler.java
│   │   ├── mq/
│   │   │   └── RabbitMqProducer.java
│   │   ├── schedule/
│   │   │   └── ScheduleConfig.java
│   │   └── storage/
│   │       └── MinioStorageService.java
│   └── module/
│       ├── user/                     # 空，后续填充
│       ├── doctor/
│       ├── consultation/
│       ├── report/
│       ├── payment/
│       ├── notification/
│       ├── imaging/
│       ├── live/
│       ├── ai/
│       └── admin/
├── src/main/resources/
│   ├── application.yml
│   └── application-dev.yml
```

### 2. 公共组件

**Result<T>**：
- 字段：code(int)、message(String)、data(T)
- 静态方法：success(data)、success()、fail(code, message)、fail(message)

**ResultCode 枚举**：
- SUCCESS(200)、PARAM_ERROR(400)、UNAUTHORIZED(401)、FORBIDDEN(403)、NOT_FOUND(404)、INTERNAL_ERROR(500)
- 业务码段：1xxxx（用户端）、2xxxx（医生端）、3xxxx（会诊）、4xxxx（支付）、5xxxx（AI）

**BusinessException**：
- 继承 RuntimeException，携带 code + message
- 静态工厂：throw BusinessException.fail("xxx")

**GlobalExceptionHandler**：
- BusinessException → Result.fail(code, message)
- MethodArgumentNotValidException → Result.fail(参数校验信息)
- Exception → Result.fail(500, "系统异常")

**DesensitizeUtil**：
- 姓名：张三 → 张*
- 手机号：13812345678 → 138****5678
- 身份证号：保留前3后4

### 3. Security 配置

- 用户端接口 `/api/user/**` 全部放行
- 医生端接口 `/api/doctor/**` 需要 JWT 认证
- 管理端接口 `/api/admin/**` 需要 JWT 认证 + 角色校验
- 登录接口 `/api/doctor/login`、`/api/admin/login` 放行
- WebSocket 端点放行（通过查询参数验证）
- JwtAuthenticationFilter：从 Header 提取 token，验证后设置 SecurityContext

### 4. 数据库

手动建表，不使用 Flyway。提供 SQL 脚本文件 `sql/init.sql`，包含所有核心表的 CREATE TABLE 语句和初始数据插入。

核心表清单：
- patient、doctor、admin、doctor_schedule
- consultation、consultation_status_log、consultation_upload
- report、report_template
- payment_order、payment_refund
- notification
- imaging_file、live_room、live_recording
- qc_result、operation_log、sys_config、sys_role、sys_permission

初始数据：
- 超级管理员账号（admin/admin123）
- 基础角色和权限
- 系统配置项
- 示例医生数据（3-5个）

### 5. Docker Compose

只编排本地没有的服务：

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
```

MySQL、Redis、MinIO、ES 使用本地已有实例，在 application-dev.yml 中配置连接信息。

### 6. 前端 Monorepo

```
frontend/
├── pnpm-workspace.yaml
├── package.json
├── .eslintrc.js
├── .prettierrc
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── api/          # Axios 封装、接口定义
│   │   │   ├── utils/        # 工具函数
│   │   │   └── types/        # 公共类型定义
│   │   └── tsconfig.json
│   ├── user/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       ├── router/
│   │       ├── views/
│   │       └── components/
│   ├── doctor/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       ├── router/
│   │       ├── views/
│   │       └── components/
│   └── admin/
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           ├── router/
│           ├── views/
│           └── components/
```

- user 端：Vant 4 + Vue 3 + TypeScript
- doctor 端：Element Plus + Vue 3 + TypeScript
- admin 端：Element Plus + Vue 3 + TypeScript
- shared：Axios 封装（统一拦截、token 管理）、公共类型、工具函数

### 7. AI 配置

使用 LangChain4j 内置模型接入，不自定义 HTTP 客户端：

**AiConfig.java**：
- `@Bean ChatLanguageModel`：通过 LangChain4j 的 OpenAI 兼容模式接入硅基流动 Chat API
  - baseUrl: 硅基流动 API 端点
  - apiKey: 从配置文件读取
  - modelName: deepseek-ai/DeepSeek-V3
- `@Bean EmbeddingModel`：同样通过 LangChain4j 接入硅基流动 Embedding API
  - modelName: BAAI/bge-m3

**application-dev.yml AI 配置项**：
```yaml
ai:
  silicon-flow:
    base-url: https://api.siliconflow.cn/v1
    api-key: ${SILICON_FLOW_API_KEY}
    chat-model: deepseek-ai/DeepSeek-V3
    embedding-model: BAAI/bge-m3
```

子项目 1 只配通 ChatLanguageModel 和 EmbeddingModel，其他 AI 能力（OCR、ASR、影像）在后续子项目中按需接入。

### 8. Maven 依赖

核心依赖清单：
- spring-boot-starter-web
- spring-boot-starter-security
- spring-boot-starter-data-redis
- spring-boot-starter-amqp
- spring-boot-starter-websocket
- spring-boot-starter-validation
- mybatis-spring-boot-starter
- mysql-connector-j
- minio
- langchain4j-spring-boot-starter
- langchain4j-open-ai（硅基流动兼容 OpenAI）
- langchain4j-qdrant
- jjwt（io.jsonwebtoken）
- lombok
- mapstruct（对象映射）
- hutool（工具类库）

### 9. 验收标准

- [ ] 后端项目能正常启动，无报错
- [ ] 访问 Swagger/健康检查接口返回正常
- [ ] JWT 认证流程：未登录访问医生端接口返回 401，登录后带 token 访问正常
- [ ] 用户端接口无需认证即可访问
- [ ] MinIO 文件上传/下载测试通过
- [ ] Redis 读写测试通过
- [ ] RabbitMQ 消息收发测试通过
- [ ] LangChain4j ChatLanguageModel 调用硅基流动 API 成功返回
- [ ] 数据库所有表创建成功，初始数据写入正常
- [ ] Docker Compose 启动 RabbitMQ + Qdrant 正常
- [ ] 前端三端 dev server 均能启动，页面可访问
- [ ] shared 包的 Axios 封装能正常调用后端接口
