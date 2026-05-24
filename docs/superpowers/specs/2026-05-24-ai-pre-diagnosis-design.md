# Sub-project 2: AI 预问诊核心流程 设计文档

## 概述

用户端完整链路：手机号登录 → AI 预问诊 → 病情摘要 → 资料上传+OCR → 选择会诊类型 → 模拟支付。采用顺序步骤向导流程，每步完成后进入下一步。

## 整体流程

```
Step 1: 手机号+验证码登录（模拟验证码 123456）
Step 2: 选择预问诊方式（对话模式 / 表单模式）
Step 3: AI 预问诊
  ├─ 对话模式：多轮聊天，AI 追问关键信息，判断足够后自动结束
  └─ 表单模式：填写主诉、症状、病史等，提交后 AI 生成摘要
Step 4: 病情摘要确认
  └─ AI 将预问诊内容整理为结构化摘要，用户确认/修改
Step 5: 上传资料 + OCR
  └─ 上传影像/化验单/病理报告等，LLM 视觉识别内容
Step 6: 选择会诊类型 + 支付
  └─ 选择单学科(500元)/MDT(1500元) → 确认支付 → 提交会诊申请
```

## 数据流

每个步骤的结果逐步存入 consultation 记录：
- 步骤 1：创建 patient 记录（首次）或查找已有记录
- 步骤 2-3：对话记录存 Redis（对话模式），medical_summary 填充
- 步骤 4：用户确认/修改后的摘要存入 consultation.medical_summary
- 步骤 5：文件存 MinIO，记录存 consultation_upload，OCR 结果存 ocr_result 字段，向量存 Qdrant
- 步骤 6：填充 consultation.type、fee、payment_status，创建 payment_order

## 用户认证

用户通过手机号+验证码登录，无需密码。开发阶段验证码固定为 `123456`。

| API | Method | 说明 | 认证 |
|:----|:-------|:-----|:-----|
| `/user/auth/send-code` | POST | 发送验证码（模拟，存 Redis） | 无 |
| `/user/auth/login` | POST | 手机号+验证码登录，返回 JWT | 无 |

验证码逻辑：
- `send-code`：生成 6 位验证码，存入 Redis（key: `sms:{phone}`，TTL 5 分钟），开发阶段固定返回 `123456`
- `login`：校验 Redis 中的验证码，通过后查找或创建 patient 记录，生成 JWT 返回

登录后用户端接口也需要 JWT 认证，SecurityConfig 需要调整 `/user/auth/**` 放行，其他 `/user/**` 需要认证。

## 后端 API 设计

### 预问诊

| API | Method | 说明 |
|:----|:-------|:-----|
| `/user/consultation/draft` | POST | 创建会诊草稿，返回 consultationId |
| `/user/consultation/{id}/chat` | POST | 发送消息（对话模式），AI 追问并回复 |
| `/user/consultation/{id}/form-submit` | POST | 提交表单（表单模式），AI 生成摘要 |
| `/user/consultation/{id}/summary` | GET | 获取 AI 生成的病情摘要 |
| `/user/consultation/{id}/summary` | PUT | 用户修改确认摘要 |

### 资料上传

| API | Method | 说明 |
|:----|:-------|:-----|
| `/user/consultation/{id}/upload` | POST | 上传资料文件（multipart），OCR 识别 |
| `/user/consultation/{id}/uploads` | GET | 获取已上传资料列表 |
| `/user/consultation/{id}/upload/{uploadId}` | DELETE | 删除已上传资料 |

### 支付与提交

| API | Method | 说明 |
|:----|:-------|:-----|
| `/user/consultation/{id}/calculate-fee` | POST | 计算费用（根据会诊类型） |
| `/user/consultation/{id}/pay` | POST | 模拟支付，确认扣款 |
| `/user/consultation/{id}` | GET | 查询会诊详情 |
| `/user/consultation/query` | GET | 按手机号查询会诊列表 |

## 文件存储

- **文件**：存到 MinIO，路径格式 `consultation/{consultationId}/{uuid}.{ext}`
- **OCR 结果**：存到 `consultation_upload.ocr_result` 字段（TEXT，JSON 格式）
- **向量**：OCR 结果做 Embedding 存入 Qdrant，collection 名 `consultation_document`，metadata 包含 consultationId 和 uploadId

## AI 服务设计

### PreDiagnosisService（对话式预问诊）

- 实现：LangChain4j ChatLanguageModel + ChatMemory
- System Prompt：你是一位专业的分诊护士，需要通过对话收集患者的病情信息。按医学规范追问：主诉 → 现病史 → 既往史 → 过敏史。当信息收集充分时，回复 `[DIAGNOSIS_COMPLETE]` 标记结束
- 对话记忆：使用 Redis 存储（key: `chat:{consultationId}`），最多保留最近 20 条消息
- AI 判断信息足够时返回 `finished: true`，前端引导进入摘要确认

### SummaryService（摘要生成）

- 实现：LangChain4j ChatLanguageModel
- 输入：对话模式传入完整对话记录，表单模式传入表单内容
- 输出：结构化摘要 JSON，包含：主诉、现病史、既往史、过敏史、初步印象
- Prompt 模板：将原始内容整理为规范的医学摘要

### OcrService（图片识别）

- 实现：LangChain4j ChatLanguageModel，使用硅基流动视觉模型 `Qwen/Qwen2-VL-72B-Instruct`
- 输入：上传的图片（Base64 编码）
- 输出：结构化识别结果（如化验单提取指标名+数值+异常标记）
- 支持 JPG/PNG 格式，单文件最大 10MB

### EmbeddingService（向量化）

- 实现：LangChain4j EmbeddingModel + Qdrant
- 将 OCR 结果文本向量化存入 Qdrant
- 供后续子项目中 RAG 检索使用

## 新增配置

application-dev.yml 新增：
```yaml
ai:
  silicon-flow:
    vision-model: Qwen/Qwen2-VL-72B-Instruct
```

## 前端页面设计

用户端（Vant 4 移动端 H5），新增页面：

| 页面 | 路由 | 说明 |
|:-----|:-----|:-----|
| 登录页 | `/login` | 手机号+验证码登录 |
| 首页 | `/` | 发起会诊、查询会诊入口 |
| 选择预问诊方式 | `/consultation/start` | 选择「对话模式」或「表单模式」 |
| 对话预问诊 | `/consultation/:id/chat` | 聊天界面，AI 对话追问 |
| 表单预问诊 | `/consultation/:id/form` | 表单填写页 |
| 病情摘要确认 | `/consultation/:id/summary` | 查看/编辑 AI 生成的摘要 |
| 上传资料 | `/consultation/:id/upload` | 上传图片/文件，显示 OCR 结果 |
| 选择会诊类型 | `/consultation/:id/select-type` | 选择单学科/MDT |
| 确认支付 | `/consultation/:id/pay` | 费用明细+确认支付按钮 |
| 支付成功 | `/consultation/:id/success` | 支付成功提示 |
| 会诊查询 | `/consultation/query` | 输入手机号查询会诊列表 |

路由守卫：未登录用户访问需认证页面时跳转登录页。

步骤导航：页面顶部显示步骤条（1-6步），让用户知道当前进度。

## SecurityConfig 调整

原设计用户端全部放行，现调整为：
- `/user/auth/**` 放行（登录/发送验证码）
- `/user/**` 其他接口需要 JWT 认证
- JWT 中携带 patientId 和 phone

## 验收标准

- [ ] 手机号+验证码登录流程正常（验证码 123456）
- [ ] 对话模式：AI 能多轮追问，信息足够后返回 finished
- [ ] 表单模式：填写后 AI 能生成摘要
- [ ] 摘要确认：用户能查看和修改 AI 生成的摘要
- [ ] 文件上传：图片能上传到 MinIO
- [ ] OCR：上传图片后 LLM 视觉识别返回结构化结果
- [ ] 费用计算：单学科 500 元，MDT 1500 元
- [ ] 模拟支付：点击确认后支付成功，会诊状态变为已提交
- [ ] 向量存储：OCR 结果向量化存入 Qdrant
- [ ] 前端步骤向导流程完整跑通
