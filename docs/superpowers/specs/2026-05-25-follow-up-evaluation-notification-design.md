# 子项目 6：随访、评价与通知系统

## 目标

实现会诊后随访系统（自动排程 + AI 问卷 + 患者填写 + AI 分析 + 异常告警）、会诊评价（星级评分）、通知中心（站内信 + WebSocket 推送）。

## 架构

会诊完成后，后端自动创建随访排程（3/7/30 天）和评价记录。每日定时任务扫描到期随访，通过 NotificationService 推送通知。患者通过用户端 H5 填写问卷和评价，AI 分析回答后标记异常并通知医生。三个独立服务（FollowUpService、EvaluationService、NotificationService）各自对应自己的表，通知复用现有 WebSocketHandler。

## 技术栈

- 后端：Spring Boot 3、MyBatis、Spring @Scheduled、ChatLanguageModel（DeepSeek-V3.2）
- 前端：Vue 3 + TypeScript、Vant 4（用户端）、Element Plus（医生端）
- 复用：WebSocketHandler（新增 notification 消息类型）、RabbitMQ 通知队列

---

## 1. 数据层

三个表已在 `init.sql` 中定义，需创建实体、Mapper、XML。

### FollowUp Entity（现有表 `follow_up`）

字段：id、consultationId、patientId、planDay、questionnaire（JSON）、answer（JSON）、aiAnalysis、status（0=待发送, 1=已发送, 2=已回复, 3=异常告警）、sendTime、answerTime、createTime

### Evaluation Entity（现有表 `evaluation`）

字段：id、consultationId、patientId、doctorScore（1-5）、serviceScore（1-5）、comment、createTime

### Notification Entity（现有表 `notification`）

字段：id、userType（1=患者, 2=医生, 3=管理员）、userId、phone、type（1=短信, 2=站内信, 3=WebSocket）、title、content、status（0=待发送, 1=已发送, 2=发送失败）、sendTime、createTime

### 新增 Mapper 方法

**FollowUpMapper**
- insert(FollowUp)
- findByConsultationId(consultationId)
- findByPatientId(patientId)
- findPendingByPatientId(patientId)
- findDueByDate(date) — 定时任务查询到期随访
- findAbnormalByDoctorId(doctorId) — 医生异常列表
- updateStatus(id, status, sendTime / answerTime)
- updateAnswer(id, answer)
- updateAiAnalysis(id, aiAnalysis)

**EvaluationMapper**
- insert(Evaluation)
- findByConsultationId(consultationId)
- findPendingByPatientId(patientId)
- updateScore(id, doctorScore, serviceScore, comment)

**NotificationMapper**
- insert(Notification)
- findByUserId(userType, userId) — 分页
- countUnread(userType, userId)
- updateStatus(id, status)

### Entity JOIN 字段

Consultation 实体新增 `evaluation` 字段（通过 LEFT JOIN evaluation 获取，用于会诊详情展示评价信息）。

---

## 2. 后端 — 服务层

### FollowUpService

- `createFollowUps(consultationId)` — 读取 sys_config 的 follow_up_days（"3,7,30"），为每个天数创建随访记录。对每条随访调用 AI 生成个性化问卷
- `generateQuestionnaire(consultationId, planDay)` — ChatLanguageModel 根据会诊摘要 + 患者信息 + 随访天数生成 JSON 格式问卷（包含问题和选项）
- `submitAnswer(followUpId, patientId, answer)` — 保存回答 JSON，异步触发 analyzeAnswer
- `analyzeAnswer(followUpId)` — AI 分析回答内容，如发现异常（症状加重、新发症状等）则 status → 3 并通知医生
- `getPendingFollowUps(patientId)` — 患者待填写列表
- `getAbnormalFollowUps(doctorId)` — 医生异常提醒列表

### EvaluationService

- `createEvaluation(consultationId)` — 会诊完成时自动创建空白评价记录
- `submitEvaluation(consultationId, patientId, doctorScore, serviceScore, comment)` — 保存评价
- `getPendingEvaluations(patientId)` — 患者待评价列表

### NotificationService

- `send(userType, userId, title, content, types)` — types 为 int 数组，如 [2,3] 同时发站内信和 WebSocket。站内信持久化到 DB，WebSocket 通过 WebSocketHandler 推送
- `getUserNotifications(userType, userId, page, size)` — 分页查询
- `getUnreadCount(userType, userId)` — 未读数量
- `markRead(id)` — 标记已读

### FollowUpScheduler

- `@Scheduled(cron = "0 0 9 * * ?")` 每天 9 点执行
- 查询到期未发送的随访（planDay 天数已到且 status=0），发送通知，更新 status=1
- 查询创建超 1 天未填写的评价，发送提醒

### 服务调用关系

```
会诊完成 / endRoom
  → FollowUpService.createFollowUps()
  → EvaluationService.createEvaluation()

FollowUpService.submitAnswer()
  → FollowUpService.analyzeAnswer()
    → NotificationService.send(异常告警) [if abnormal]

FollowUpScheduler.checkAndSend()
  → NotificationService.send(随访提醒)
  → NotificationService.send(评价提醒)
```

### AI 问卷生成 Prompt

```
你是一位资深临床随访专家。根据以下患者会诊信息，生成第{N}天随访问卷。

要求：
- 使用 JSON 格式输出
- 包含 5-8 个问题
- 问题类型包括：单选（选项数组）、多选、文本输入
- 关注：症状变化、用药情况、不良反应、生活质量

患者信息：
【主诉】{chiefComplaint}
【诊断摘要】{medicalSummary}
【随访天数】第{planDay}天

输出格式：
[{"question": "...", "type": "radio", "options": ["A", "B", "C"]}, ...]
```

### AI 答案分析 Prompt

```
你是一位资深临床随访专家。分析患者第{planDay}天的随访回答，判断是否存在异常。

异常判断标准：
- 症状明显加重或出现新发症状
- 药物严重不良反应
- 患者主观感受显著恶化

随访问卷及回答：
{questionnaire_and_answer}

请用 JSON 输出分析结果：
{"abnormal": true/false, "level": "正常/轻度异常/明显异常/严重异常", "summary": "分析总结", "suggestion": "建议"}
```

---

## 3. 后端 — API 层

### FollowUpController — 患者端 (`/user/followup`)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /user/followup/{consultationId} | 某会诊的所有随访 |
| GET | /user/followup/{id}/detail | 随访详情（问卷） |
| PUT | /user/followup/{id}/answer | 提交回答 |
| GET | /user/followup/pending | 待填写列表 |

### FollowUpController — 医生端 (`/doctor/followup`)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /doctor/followup/{consultationId} | 会诊的所有随访 |
| GET | /doctor/followup/{id}/detail | 随访详情（含回答+AI分析） |
| GET | /doctor/followup/abnormal | 异常提醒列表 |

### EvaluationController — 患者端 (`/user/evaluation`)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /user/evaluation/pending | 待评价列表 |
| PUT | /user/evaluation/{consultationId} | 提交评价 |

### NotificationController (`/user/notification` 和 `/doctor/notification`)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /user/notification | 通知列表（分页） |
| GET | /user/notification/unread-count | 未读数量 |
| PUT | /user/notification/{id}/read | 标记已读 |
| GET | /doctor/notification | 通知列表（分页） |
| GET | /doctor/notification/unread-count | 未读数量 |
| PUT | /doctor/notification/{id}/read | 标记已读 |

### 修改现有

- `LiveRoomController` / `MinutesService` endRoom 流程 → 触发 FollowUpService.createFollowUps() + EvaluationService.createEvaluation()
- `SecurityConfig` → 新增 `/user/followup/**`、`/user/evaluation/**`、`/user/notification/**`、`/doctor/followup/**`、`/doctor/notification/**` 需认证
- `WebSocketHandler` → 新增 `notification` 消息类型（发送给指定 userId）

---

## 4. 前端 — 用户端（user 包，Vant 4 H5，端口 3000）

### 页面和路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/followup` | FollowUpList.vue | 我的随访列表（全部 + 待填写标签） |
| `/followup/:id` | FollowUpDetail.vue | 填写问卷（含表单提交） |
| `/evaluation` | EvaluationList.vue | 我的评价列表（可提交 + 已完成） |
| `/notifications` | NotificationCenter.vue | 通知中心（已读/未读筛选） |

### FollowUpList.vue — 我的随访

- 顶层标签栏：全部 / 待填写 / 已完成
- 卡片列表：每张卡片包含会诊编号、天数说明（第 3 天/第 7 天/第 30 天随访）、截止时间、状态标签（"待填写"黄色 / "已发送"蓝色，即需要操作 / "已回复"绿色 / "异常提醒"红色）
- 点击可进入填写页面

### FollowUpDetail.vue — 填写/查看随访问卷

- 按格式展示 AI 问卷：问题 + 类型对应的表单控件
  - 单选题 → `van-radio-group`
  - 多选题 → `van-checkbox-group`
  - 文本题 → `van-field` textarea
- 提交按钮："提交问卷"（`van-button` + loading），提交后跳回列表，Toast 提示"提交成功"
- 已完成（已回复的 STATUS=2）状态：停止编辑，转为只读，在底部显示 AI 分析卡片

### EvaluationList.vue — 会诊评价

- 卡片列表：会诊编号、会诊时间、评分状态（"待评价"黄色 tag / "已评价"灰色 tag）
- 点击可进入评价页，提交后变灰色不可点击

### EvaluationForm.vue — 填写/查看评价

- 内容区域：医生评分（1-5 星，使用 `van-rate`），服务评分（1-5 星，使用 `van-rate`），文字评价（使用 `van-field` textarea）
- 提交按钮：`van-button`，Toast 提示"感谢反馈"

### NotificationCenter.vue — 通知中心

- 按已读/未读筛选的标签栏
- 通知列表：每条显示标题、内容预览、时间、已读/未读状态
- 点击跳转：根据通知类型跳转到对应页面（随访待作答 / 评价链接）

---

## 5. 前端 — 医生端（doctor 包，Element Plus，端口 3001）

### ConsultationDetail.vue 增强

在会诊详情页增加"随访记录"标签页：
- 表格展示所有随访：天数、状态 tag、发送/回复时间
- 点击可展开查看详细问卷、回答和 AI 分析
- 异常告警以红色高亮显示

### 新增页面

| 路径 | 页面 | 说明 |
|------|------|------|
| `/notifications` | DoctorNotification.vue | 医生通知中心 |

加载通知列表，点击跳转到相关的异常随访。

---

## 6. 文件中哪些需要增删改（文件清单）

| 操作 | 文件 |
|------|------|
| 创建 | `module/followup/entity/FollowUp.java` |
| 创建 | `module/evaluation/entity/Evaluation.java` |
| 创建 | `module/notification/entity/Notification.java` |
| 创建 | `module/followup/mapper/FollowUpMapper.java` |
| 创建 | `module/evaluation/mapper/EvaluationMapper.java` |
| 创建 | `module/notification/mapper/NotificationMapper.java` |
| 创建 | `resources/mapper/FollowUpMapper.xml` |
| 创建 | `resources/mapper/EvaluationMapper.xml` |
| 创建 | `resources/mapper/NotificationMapper.xml` |
| 创建 | `module/followup/dto/FollowUpVO.java` |
| 创建 | `module/followup/dto/AnswerRequest.java` |
| 创建 | `module/evaluation/dto/EvaluationVO.java` |
| 创建 | `module/evaluation/dto/SubmitEvaluationRequest.java` |
| 创建 | `module/notification/dto/NotificationVO.java` |
| 创建 | `module/followup/service/FollowUpService.java` |
| 创建 | `module/evaluation/service/EvaluationService.java` |
| 创建 | `module/notification/service/NotificationService.java` |
| 创建 | `module/followup/scheduler/FollowUpScheduler.java` |
| 创建 | `module/followup/controller/FollowUpController.java`（患者端 + 医生端） |
| 创建 | `module/evaluation/controller/EvaluationController.java` |
| 创建 | `module/notification/controller/NotificationController.java` |
| 修改 | `module/consultation/entity/Consultation.java` — 增加 evaluation JOIN 字段 |
| 修改 | `resources/mapper/ConsultationMapper.xml` — findById 增加 evaluation JOIN |
| 修改 | `module/live/service/MinutesService.java` — end flow 增加触发随访/评价创建 |
| 修改 | `config/SecurityConfig.java` — 新增路径放行 |
| 修改 | `infrastructure/websocket/WebSocketHandler.java` — 新增 notification 消息类型 |
| 创建 | `shared/src/api/followup.ts` |
| 创建 | `shared/src/api/evaluation.ts` |
| 创建 | `shared/src/api/notification.ts` |
| 修改 | `shared/src/index.ts` — 导出新增 API |
| 创建 | `user/src/views/FollowUpList.vue` |
| 创建 | `user/src/views/FollowUpDetail.vue` |
| 创建 | `user/src/views/EvaluationForm.vue` |
| 创建 | `user/src/views/NotificationCenter.vue` |
| 修改 | `user/src/router/index.ts` — 新增路由 |
| 修改 | `doctor/src/views/ConsultationDetail.vue` — 随访记录标签 |
| 创建 | `doctor/src/views/DoctorNotification.vue` |
| 修改 | `doctor/src/router/index.ts` — 新增路由 |
