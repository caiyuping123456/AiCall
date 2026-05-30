<p align="center">
  <h1 align="center">AICall — AI+MDT 多学科在线会诊系统</h1>
  <p align="center">AI 驱动的多角色在线医疗会诊平台 · Spring Boot 3 + Vue 3 + LangChain4j</p>
</p>

---

## 项目简介

AICall 是一个面向在线医疗会诊场景的 **AI + MDT（多学科会诊）系统**。系统围绕"患者提交病情 → AI 预问诊 → 资料上传与 OCR → 医生在线会诊 → AI 报告生成与质控 → 签发报告 → 随访评价"完整链路展开，覆盖**患者端、医生端、管理端**三个角色。

本项目不是单纯的挂号或聊天应用，而是把在线问诊、医学资料处理、AI 文书生成、知识库问答、音视频会诊、报告质控、随访评价和后台运营管理串联成完整的医疗协同流程。

---

## 系统架构

```
┌──────────────────────────────────────────────────────┐
│                    前端 (pnpm monorepo)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ 用户端    │  │ 医生端    │  │ 管理端    │           │
│  │ Vant UI  │  │ Element+  │  │ Element+  │           │
│  │ 移动端    │  │ 工作台    │  │ 后台管理   │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       └──────────────┼──────────────┘                │
│               shared (Axios)                          │
└───────────────────────┼──────────────────────────────┘
                        │ REST / WebSocket
┌───────────────────────┼──────────────────────────────┐
│                  后端 (Spring Boot 3)                  │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │
│  │ Auth    │ │Consultation│ │  Live  │ │ Knowledge │  │
│  │ JWT     │ │ AI预问诊   │ │ TRTC   │ │ RAG 问答  │  │
│  └─────────┘ └──────────┘ └────────┘ └───────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │
│  │ Report  │ │ FollowUp  │ │ Eval   │ │ Notification│ │
│  │AI报告质控│ │ 随访管理   │ │ 评价    │ │ 通知推送   │  │
│  └─────────┘ └──────────┘ └────────┘ └───────────┘  │
└───────────────────────┼──────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│                    基础设施                             │
│  MySQL · Redis · RabbitMQ · MinIO · Qdrant           │
└──────────────────────────────────────────────────────┘
```

---

## 核心功能

### 患者端（移动端）
- 注册登录、完善个人资料
- 科室浏览 → 医生选择 → 挂号预约
- AI 预问诊对话 / 表单填写病情
- AI 病情摘要生成
- 检查资料上传（OCR 识别 + 向量化）
- 会诊类型选择与支付
- 在线会诊室（TRTC 视频 + 实时字幕）
- 查看会诊报告、随访、评价
- 通知中心

### 医生端（工作台）
- 工作台面板（待审核、报告编辑中、待质控统计）
- 会诊列表与状态筛选
- 查看患者资料、AI 预问诊记录、上传材料
- 确认/拒绝接诊
- 进入会诊室（语音识别 + 实时字幕）
- AI 自动生成会诊报告 → 编辑 → 提交
- AI 报告质控（完整性/规范性/一致性评分）
- 签发报告

### 管理端（后台）
- 数据看板（ECharts 可视化：会诊统计、科室分布、收入趋势）
- 科室管理（CRUD）
- 医生管理（信息、排班、状态）
- 患者管理
- 知识库管理（文档上传 + RAG）
- 会诊管理（筛选、详情、指派医生、取消）
- 会诊流程追踪（时间轴）
- 查看会诊报告、纪要、录像

### AI 能力矩阵

| 能力 | 说明 |
|---|---|
| AI 预问诊 | 多轮对话收集病史，扮演分诊护士 |
| 病情摘要生成 | 自然语言 → 结构化医学摘要 |
| OCR 识别 | 视觉模型识别医学图片/报告 |
| RAG 知识库问答 | Qdrant 向量检索 + LLM 回答 |
| AI 报告生成 | 综合患者资料生成 8 字段报告 JSON |
| AI 报告质控 | 完整性·规范性·一致性三维评分 |
| 会诊纪要生成 | 字幕转结构化 MDT 纪要 |

---

## 技术栈

### 后端
| 技术 | 版本/说明 |
|---|---|
| Java | 17 |
| Spring Boot | 3.3.6 |
| Spring Security | JWT 无状态认证 |
| MyBatis | XML Mapper |
| MySQL | 关系数据库 |
| Redis | AI 会话上下文 & 缓存 |
| RabbitMQ | 消息队列 |
| MinIO | 对象存储 |
| Qdrant | 向量数据库 |
| LangChain4j | 1.0.0-beta1 |
| JJWT | 0.12.6 |
| Lombok / MapStruct / Hutool | 代码辅助 |

### 前端
| 技术 | 说明 |
|---|---|
| Vue 3 | Composition API |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Pinia | 状态管理 |
| Vue Router | 路由 |
| Vant | 用户端移动 UI |
| Element Plus | 医生/管理端 UI |
| ECharts | 数据可视化 |
| TRTC JS SDK | 音视频通话 |
| pnpm workspace | 多包管理 |

### AI & 基础设施
- **大模型 API**：SiliconFlow (DeepSeek-V3 / Qwen Vision / BGE-M3)
- **向量检索**：Qdrant + Embedding
- **RAG 流程**：文档上传 → 分块 → 向量化 → 检索 → LLM 回答
- **实时通信**：WebSocket（字幕/通知推送）
- **视频会诊**：TRTC SDK

---

## 项目结构

```
AiCall/
├── aicall-backend/                  # Spring Boot 后端
│   └── src/main/java/com/aicall/
│       ├── config/                  # 配置 (AI/Redis/MinIO/WebSocket/RabbitMQ)
│       ├── common/                  # 通用 (Result/AOP/工具类)
│       ├── infrastructure/          # 基础设施 (JWT/WebSocket/存储)
│       └── module/
│           ├── admin/               # 管理端模块
│           ├── ai/                  # AI 服务 (预问诊/摘要/OCR/质控/报告)
│           ├── consultation/        # 会诊核心
│           ├── doctor/              # 医生模块
│           ├── evaluation/          # 评价模块
│           ├── followup/            # 随访模块
│           ├── knowledge/           # 知识库/RAG
│           ├── live/                # 会诊室/TRTC
│           ├── notification/        # 通知
│           ├── payment/            # 支付
│           └── user/                # 用户模块
│
└── frontend/                        # Vue 3 前端
    └── packages/
        ├── shared/                  # 共享 API 层 (Axios + 类型定义)
        ├── user/                    # 患者端 (Vant UI)
        ├── doctor/                  # 医生端 (Element Plus)
        └── admin/                   # 管理端 (Element Plus)
```

---

## 快速开始

### 环境要求
- JDK 17+
- Node.js 18+
- pnpm
- MySQL 8.0+
- Redis
- RabbitMQ (可选)
- MinIO (可选)
- Qdrant (可选)

### 1. 后端

```bash
cd aicall-backend

# 创建数据库
mysql -u root -p -e "CREATE DATABASE aicall DEFAULT CHARACTER SET utf8mb4;"

# 修改 application-dev.yml 中的数据库/Redis/API Key 配置
# 然后启动
./mvnw spring-boot:run
```

### 2. 前端

```bash
cd frontend
pnpm install

# 启动各端开发服务器
pnpm dev:user      # 患者端 → http://localhost:5173
pnpm dev:doctor    # 医生端 → http://localhost:5174
pnpm dev:admin     # 管理端 → http://localhost:5175

# 构建生产版本
pnpm build:user
pnpm build:doctor
pnpm build:admin
```

### 3. 配置 AI API

编辑 `aicall-backend/src/main/resources/application-dev.yml`：

```yaml
ai:
  silicon-flow:
    base-url: https://api.siliconflow.cn/v1
    api-key: your-api-key-here
    chat-model: deepseek-ai/DeepSeek-V3.2
    embedding-model: BAAI/bge-m3
    vision-model: Qwen/Qwen3.6-35B-A3B
```

---

## 核心业务流程

### 挂号流程（指定医生）
```
选择科室 → 选择医生 → 填写主诉 → AI 生成摘要 → 上传资料 → 支付 → 医生确认 → 会诊
```

### 发起会诊流程（AI 预问诊 + 平台分配）
```
填写主诉 → AI 对话/表单问诊 → AI 摘要 → 上传资料 → 选择类型 → 支付 → 管理分配医生 → 会诊
```

### 会诊报告流程
```
会诊结束 → AI 自动生成纪要 + 报告草稿 → 医生编辑 → 提交质控 → AI 评分 → 签发 → 患者查看
```

---

## 会诊状态流转

```
0  已提交     ─→  患者提交会诊申请
1  资料审核中 ─→  AI 生成摘要完成
2  已提交     ─→  管理端指派医生
3  已排期     ─→  医生确认接诊，可进入会诊室
4  待会诊     ─→  AI 报告已生成，等待会诊/编辑
5  报告已签发 ─→  医生签发报告，患者可查看
6  已完成     ─→  会诊结束
7  已取消     ─→  管理端取消
8  已退回     ─→  医生拒绝接诊
```

---

## 数据库表

核心表：`patient`, `doctor`, `admin`, `consultation`, `consultation_doctor`, `consultation_upload`, `report`, `qc_result`, `live_room`, `live_subtitle`, `live_recording`, `follow_up`, `evaluation`, `notification`, `payment_order`, `department`, `knowledge_document`

---

## 后续扩展方向

- [ ] 智能分诊与医生推荐
- [ ] GraphRAG 医学知识图谱
- [ ] 实时语音转写增强
- [ ] 电子签名与报告防篡改
- [ ] HL7 FHIR 标准医疗数据交换
- [ ] Docker Compose 一键部署
- [ ] 流式 AI 输出展示
- [ ] 异步任务中心 (RabbitMQ)

---

## License

MIT

---

<p align="center">🤖 AI 辅助 · 医生决策 · 平台运营</p>
