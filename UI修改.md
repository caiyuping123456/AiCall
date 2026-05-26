# AICall 三端 UI 修改说明

## 一、修改目标

本次修改主要针对 AICall 项目的用户端、医生端、管理端进行 UI 现代化优化。修改原则是：只优化界面视觉和页面布局，不修改后端接口、不修改业务流程、不修改核心状态逻辑。

整体风格从原来的基础组件默认样式，升级为更现代的“AI 医疗会诊平台”视觉风格：

- 医疗系统常用的蓝色 + 青绿色主色体系。
- 浅色背景、白色卡片、柔和阴影。
- 更清晰的信息层级。
- 更现代的侧边栏、顶部栏、数据卡片、表格、移动端卡片样式。
- 保留用户端移动端体验，医生端和管理端保持工作台/后台系统风格。

## 二、用户端修改内容

### 1. 新增用户端全局样式

新增文件：

```text
frontend/packages/user/src/styles.css
```

主要内容：

- 定义用户端全局 CSS 变量。
- 统一主色、辅助色、背景色、文字色、边框色、阴影。
- 覆盖 Vant 主题变量。
- 优化移动端背景。
- 优化 `van-nav-bar` 顶部导航栏样式。
- 优化 `van-tabbar` 底部导航栏样式。
- 新增通用移动端卡片类 `.mobile-card`。
- 新增通用居中加载类 `.center-loading`。

### 2. 修改用户端入口文件

修改文件：

```text
frontend/packages/user/src/main.ts
```

修改内容：引入新增的全局样式文件：

```ts
import './styles.css';
```

### 3. 修改用户端根组件

修改文件：

```text
frontend/packages/user/src/App.vue
```

修改内容：

- 移除了原来写在 `App.vue` 中的简单全局变量和 body 样式。
- 将全局样式迁移到 `styles.css`。
- 保留原来的 `router-view`、`van-tabbar`、`showTabbar` 判断逻辑。
- 给带有底部导航的页面增加底部安全间距，防止内容被 Tabbar 遮挡。

没有修改：路由跳转、Tabbar 的 `to` 地址、Tabbar 显示/隐藏逻辑。

### 4. 修改用户端首页

修改文件：

```text
frontend/packages/user/src/views/Home.vue
```

修改内容：

- 重做首页顶部欢迎区域。
- 增加现代化 Hero 卡片。
- 增加“AI 医疗会诊”标签。
- 优化“发起会诊”“预约医生”主按钮。
- 优化通知按钮样式。
- 优化快捷入口区域：挂号、发起会诊、我的会诊、随访。
- 优化最近会诊区域。
- 增加空状态卡片。
- 调整最近会诊卡片的视觉层级和状态标签展示。
- 引入 `TagType` 类型，修复 Vant Tag 类型检查问题。

没有修改：`queryConsultations` 接口调用、最近会诊点击跳转逻辑、状态映射含义、`ChatWidget` 组件使用。

### 5. 修改科室列表页

修改文件：

```text
frontend/packages/user/src/views/DepartmentList.vue
```

修改内容：

- 增加页面介绍卡片。
- 优化科室卡片样式。
- 优化科室图标样式。
- 科室卡片改为更现代的圆角卡片。
- 优化科室描述的多行省略显示。

没有修改：`getDepartments` 接口调用、点击科室跳转医生列表的逻辑。

### 6. 修改医生列表页

修改文件：

```text
frontend/packages/user/src/views/DoctorList.vue
```

修改内容：

- 增加页面介绍卡片。
- 优化医生列表卡片样式。
- 优化医生头像占位样式。
- 优化医生姓名、科室、简介的排版。
- 调整医生简介显示长度。
- 优化右侧箭头颜色。

没有修改：`getDoctorsByDepartment` 接口调用、获取科室名称逻辑、点击医生跳转详情逻辑。

### 7. 修改医生详情页

修改文件：

```text
frontend/packages/user/src/views/DoctorDetail.vue
```

修改内容：

- 优化医生详情卡片视觉。
- 增加顶部柔和渐变背景。
- 优化头像占位样式。
- 优化医生姓名、职称、科室标签。
- 优化医生介绍区域。
- 保留挂号预约按钮和弹窗。

没有修改：`getDoctorDetail` 接口调用、`registerConsultation` 挂号接口调用、主诉校验逻辑、挂号成功后的跳转逻辑、`beforeClose` 弹窗关闭逻辑。

### 8. 修复用户端部分 Vant 类型问题

修改文件：

```text
frontend/packages/user/src/views/MyMeetings.vue
frontend/packages/user/src/views/consultation/Status.vue
frontend/packages/user/src/views/consultation/Room.vue
```

修改内容：

- 给 Vant `van-tag` 的 `type` 增加 `TagType` 类型约束。
- 将原本可能传入空字符串的 tag type 调整为 `default`。
- 移除 `van-field` 上不符合当前 Vant 类型定义的 `size="small"`。
- 给会诊室详情返回值增加类型断言，解决 TypeScript unknown 类型错误。

这些修改只为保证构建通过，不改变页面业务逻辑。

## 三、医生端修改内容

### 1. 新增医生端全局样式

新增文件：

```text
frontend/packages/doctor/src/styles.css
```

主要内容：

- 定义医生端全局 CSS 变量。
- 覆盖 Element Plus 主题变量。
- 统一卡片、表格、按钮、标签的视觉风格。
- 新增通用页面类：`.page-shell`、`.page-header`、`.page-title`、`.page-subtitle`、`.surface-panel`、`.toolbar`、`.filter-row`、`.table-panel`、`.stat-card`。

### 2. 修改医生端入口文件

修改文件：

```text
frontend/packages/doctor/src/main.ts
```

修改内容：引入新增全局样式：

```ts
import './styles.css';
```

### 3. 重做医生端主布局

修改文件：

```text
frontend/packages/doctor/src/layout/MainLayout.vue
```

修改内容：

- 将原来的基础深色侧边栏升级为现代深色工作台侧栏。
- 增加 AICall 品牌区。
- 优化菜单项圆角、激活态、hover 状态。
- 增加“在线接诊中”底部状态提示。
- 优化顶部栏：增加标题“医生协作中心”、说明文字、医生头像占位、姓名、科室信息和退出按钮。
- 优化主体内容区域间距和背景。

没有修改：菜单路由 index、未读消息轮询逻辑、`getDoctorUnreadCount` 调用、`doctorName`/`department` 获取方式、退出登录清理的 localStorage key。

### 4. 修改医生工作台

修改文件：

```text
frontend/packages/doctor/src/views/Dashboard.vue
```

修改内容：

- 增加页面标题和说明。
- 增加刷新工作台按钮。
- 将原来的 `el-statistic` 卡片改为更现代的数据卡片。
- 优化待审核、报告编辑中、待质控三个统计卡片。
- 优化最近会诊表格卡片。
- 增加卡片标题、副标题和查看全部入口。

没有修改：`store.loadWorkbench()` 调用、`useDoctorStore` 状态使用、最近会诊点击跳转逻辑、状态标签映射。

### 5. 修改医生会诊列表页

修改文件：

```text
frontend/packages/doctor/src/views/ConsultationList.vue
```

修改内容：

- 增加页面标题和说明。
- 将列表包裹在现代表格面板中。
- 优化 tabs 与表格间距。
- 调整表格主诉列宽为更灵活的 `min-width`。
- 保留状态筛选 tabs。

没有修改：URL status 参数读取逻辑、`getDoctorConsultations` 接口调用、状态筛选逻辑、点击查看跳转详情逻辑。

## 四、管理端修改内容

### 1. 新增管理端全局样式

新增文件：

```text
frontend/packages/admin/src/styles.css
```

主要内容：

- 定义管理端全局 CSS 变量。
- 覆盖 Element Plus 主题变量。
- 统一后台卡片、表格、按钮、标签样式。
- 新增后台通用布局类：`.page-shell`、`.page-header`、`.page-title`、`.page-subtitle`、`.surface-panel`、`.toolbar`、`.filter-row`、`.table-panel`、`.stat-card`。

### 2. 修改管理端入口文件

修改文件：

```text
frontend/packages/admin/src/main.ts
```

修改内容：引入新增全局样式：

```ts
import './styles.css';
```

### 3. 重做管理端主布局

修改文件：

```text
frontend/packages/admin/src/layout/MainLayout.vue
```

修改内容：

- 将原来的基础深色侧边栏升级为现代管理控制台侧栏。
- 增加 AICall 品牌区。
- 优化菜单项样式、激活状态、hover 状态。
- 增加侧栏底部“平台状态”信息卡片。
- 优化顶部栏：增加标题“管理控制台”、说明文字、管理员头像占位、姓名、角色信息和退出登录按钮。
- 优化内容区背景和内边距。

没有修改：菜单 index、路由跳转、`adminStore.logout()` 退出逻辑、管理员状态读取逻辑。

### 4. 修改管理端数据看板

修改文件：

```text
frontend/packages/admin/src/views/Dashboard.vue
```

修改内容：

- 增加页面标题和说明。
- 优化刷新数据按钮。
- 将统计数据改为现代数据卡片：会诊总数、本月新增、本周新增、已收金额。
- 优化图表卡片样式。
- 将图表容器高度改为 class 控制。
- 优化医生工作量排名卡片。
- 优化导出按钮位置和标题说明。

没有修改：`getAdminDashboard` 接口调用、`exportAdminDashboard` 导出接口调用、ECharts 数据映射逻辑、图表类型、resize 监听、导出文件名。

### 5. 修改管理端会诊列表页

修改文件：

```text
frontend/packages/admin/src/views/ConsultationList.vue
```

修改内容：

- 增加页面标题和说明。
- 增加现代化筛选工具栏。
- 增加查询按钮。
- 将表格包裹在 `.table-panel` 中。
- 优化分页样式。
- 调整筛选控件宽度和间距。

没有修改：`getAdminConsultations` 接口调用、状态筛选参数、关键词搜索逻辑、分页逻辑、点击详情跳转逻辑、状态标签映射。

## 五、构建验证

本次修改后已经运行三端构建验证。

```bash
pnpm -C frontend build:user
pnpm -C frontend build:doctor
pnpm -C frontend build:admin
```

结果：三端均构建通过。

构建过程中出现 Vite chunk 体积提示，这是打包体积警告，不影响构建成功和项目运行。

## 六、TRTC 会诊室检查

本次 UI 修改没有移除或改名视频会诊室依赖的关键 DOM id。

仍然保留：

```text
remote-video
local-video
screen-video
```

涉及文件：

```text
frontend/packages/user/src/views/consultation/Room.vue
frontend/packages/doctor/src/views/ConsultationRoom.vue
```

因此不会影响 TRTC 视频流挂载。

## 七、本次没有修改的内容

本次只做 UI 现代化和少量 TypeScript 构建修复，没有修改以下内容：

- 后端代码。
- 数据库结构。
- API 地址。
- 接口参数。
- 接口返回处理。
- 路由 path/name/meta。
- 登录流程。
- localStorage key。
- 会诊状态判断逻辑。
- 报告状态判断逻辑。
- 质控状态判断逻辑。
- 支付流程。
- 文件上传流程。
- TRTC 视频会诊逻辑。
- WebSocket 逻辑。

## 八、主要修改文件清单

### 用户端

```text
frontend/packages/user/src/styles.css
frontend/packages/user/src/main.ts
frontend/packages/user/src/App.vue
frontend/packages/user/src/views/Home.vue
frontend/packages/user/src/views/DepartmentList.vue
frontend/packages/user/src/views/DoctorList.vue
frontend/packages/user/src/views/DoctorDetail.vue
frontend/packages/user/src/views/MyMeetings.vue
frontend/packages/user/src/views/consultation/Status.vue
frontend/packages/user/src/views/consultation/Room.vue
```

### 医生端

```text
frontend/packages/doctor/src/styles.css
frontend/packages/doctor/src/main.ts
frontend/packages/doctor/src/layout/MainLayout.vue
frontend/packages/doctor/src/views/Dashboard.vue
frontend/packages/doctor/src/views/ConsultationList.vue
```

### 管理端

```text
frontend/packages/admin/src/styles.css
frontend/packages/admin/src/main.ts
frontend/packages/admin/src/layout/MainLayout.vue
frontend/packages/admin/src/views/Dashboard.vue
frontend/packages/admin/src/views/ConsultationList.vue
```
