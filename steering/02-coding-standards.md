# 编码规范与开发实践

---

## 技术栈

| 层 | 选型 |
|----|------|
| 前端 | React Native + Expo SDK 55 |
| 官网 | Next.js + React + Tailwind CSS（目录：`website/`） |
| 后端 | CloudBase（云函数 + NoSQL + 存储 + CDN） |
| AI 预生成 | OpenAI（按环节分模型，见 pipeline/src/config.ts） |
| AI 实时 | DeepSeek |
| 视频生成 | Google Veo |
| 视频合成 | 客户端 Expo Module + 平台原生媒体栈 |
| 支付 | iOS IAP + 微信支付 + 支付宝（Android） |
| Push | TPNS |
| i18n | react-i18next |
| 状态管理 | Zustand + React Query |
| 测试 | Vitest（Pipeline）、Jest + RNTL（App） |

## TypeScript 编码规范

### 严格度要求

- 所有项目必须启用 `strict: true`（包含 `strictNullChecks`、`noImplicitAny` 等）
- 必须启用 `noUncheckedIndexedAccess`：数组/对象索引访问返回 `T | undefined`，强制处理空值
- 必须启用 `noImplicitReturns`、`noFallthroughCasesInSwitch`
- 必须启用 `forceConsistentCasingInFileNames`：防止 macOS/Linux 大小写不一致问题
- 必须启用 `isolatedModules`：确保与 vitest/esbuild/tsx 转译兼容

### 类型使用规范

- **禁止 `any`**：使用 `unknown` + 类型守卫，或定义具体类型
- **导入类型**：使用 `import type { Foo }` 导入纯类型，与值导入分开
- **返回类型**：公共函数必须显式声明返回类型，内部辅助函数可省略
- **优先 `undefined`**：表示"无值"时用 `undefined`，不用 `null`（除非外部 API 强制）

### 命名规范

| 类别 | 风格 | 示例 |
|------|------|------|
| React 组件文件 | PascalCase | `VideoPlayer.tsx`、`ElianBubble.tsx` |
| 非组件文件 | camelCase | `sceneService.ts`、`useRecording.ts` |
| 类型/接口 | PascalCase | `SceneLine`、`LearningStep` |
| 函数/变量 | camelCase | `fetchScenes`、`selectedRole` |
| 常量 | UPPER_SNAKE_CASE | `MAX_REVISIONS`、`SYSTEM_PROMPT` |
| 测试文件 | `<模块名>.test.ts(x)` | `sceneGenerator.test.ts` |
| i18n key | 点分英文 | `scene.pickRole`、`elian.feedback` |

### 错误处理

**Pipeline 模块**：
- 直接 `throw Error`，由 CLI 编排层统一 catch 并记录日志
- 外部 API 调用不自动重试，失败即抛出，编排层决定是否跳过或终止
- JSON 解析：对 AI 返回的 JSON 做 `JSON.parse` 后，用类型断言

**App 端**：
- 网络请求错误由 React Query 的 `error` 状态处理，组件层展示错误 UI
- CloudBase 调用失败：在 service 层 catch 并返回 `undefined`，不让异常穿透到组件
- 录音/STT 权限拒绝：在 hook 层 catch，通过状态通知组件展示权限引导
- 不使用全局 ErrorBoundary 兜底（Expo Router 自带）

**错误信息语言**：
- 代码中的错误信息用中文（`"OpenAI 返回空内容"`）
- 用户可见的错误提示通过 i18n 管理（默认中文）

### 日志规范

- **Pipeline CLI**：`console.log` 输出进度，`console.error` 输出错误，不引入日志库
- **App 端**：开发环境用 `console.log`，生产环境通过 Expo 的 `__DEV__` 守卫

### 原生状态模块排障规范

- 对 `expo-audio`、`expo-video`、`expo-speech-recognition` 这类**带原生状态机**的模块，排障时禁止只凭 UI 现象猜测，必须补证据日志
- 日志要按阶段打点，而不是只打异常：
  - 开始前
  - 初始化后 / ready 后
  - 运行中轮询
  - 停止后 / 清理后
- 录音排障优先记录：
  - `recorder.getStatus()`
  - `metering`
  - `durationMillis`
  - `audioUri`
  - 文件大小与是否存在
  - 当前输入源（built-in mic / 其它 route）
- 播放排障优先记录：
  - `player.currentStatus`
  - `isLoaded`
  - `isBuffering`
  - `playing`
  - `paused`
  - `timeControlStatus`
  - `reasonForWaitingToPlay`
  - `didJustFinish`
- 对原生媒体问题，优先用“状态快照 + 时间序列日志”定位根因；不要先加 UI 补丁，也不要一次改多个媒体对象的生命周期
- 只要问题与音频会话、录音、回放、STT 相关，默认先在**真机**验证，再参考模拟器结果

## 开发实践

### 文件组织原则

- 按功能模块组织，不按技术层组织
- 一起变化的文件放在一起
- 每个文件一个明确职责
- 优先小而聚焦的文件

### React Native 编码规范

- **路由**: 使用 expo-router 的文件系统路由，新页面放 `app/` 目录
- **主题一致性**: 始终使用 `ThemedText` 和 `ThemedView`，禁止直接用 `Text`/`View`
- **设计系统**: 所有 UI 决策参考 `docs/03_Development/DesignSystem.md`
- **开发重心**: 主要在 `MofunGenAI/` 目录开发

### 官网编码规范（website/）

- **项目定位**: `website/` 是 `mofunshow.com` 官网，对应品牌展示、下载入口、SEO、备案与发布/合规页面
- **技术边界**: 官网是 Next.js Web 项目，不适用 `MofunGenAI/` 的 Expo Router、React Native 组件、`StyleSheet.create()`、`ThemedText` / `ThemedView` 规则
- **路由与页面**: 使用 Next.js App Router；页面、metadata、布局优先放在 `website/app/`
- **组件组织**: 官网通用组件放在 `website/components/`，静态配置与常量放在 `website/lib/`
- **静态资源**: 官网图片、二维码、favicon、宣传图等放在 `website/public/`；避免从 App 目录跨项目引用资源
- **样式体系**: 官网使用 Tailwind CSS 与 `website/app/globals.css`；新增样式应复用现有色彩、间距和组件模式
- **品牌与文案**: 官网用户可见文案默认中文；品牌名、slogan、产品定位必须对齐 `.kiro/steering/03-product-context.md`
- **部署与安全**: 不提交 `.env*`、部署 token、平台密钥、`.next/`、`node_modules/`、`out/`、`build/` 等本地或构建产物
- **验证**: 涉及官网 UI、SEO、下载入口或响应式布局改动时，至少运行 `npm --prefix website run build`；视觉改动应在本地浏览器检查桌面与移动宽度

### React Native 组件规范

- **组件文件**: PascalCase 命名（`VideoPlayer.tsx`），一个文件一个导出组件
- **Props 类型**: 在组件文件内用 `type Props = { ... }` 定义，不单独导出（除非被多处引用）
- **样式**: 使用 `StyleSheet.create()` 定义在文件底部，不用内联样式
- **hooks**: 自定义 hook 放 `src/hooks/`，以 `use` 前缀命名（`useRecording.ts`）
- **服务层**: 放 `src/services/`，纯函数，不依赖 React（方便测试）
- **状态管理**: Zustand store 放 `src/stores/`，React Query hook 放 `src/hooks/`

### 前端界面语言

第一版面向中国市场，界面默认语言为**中文**，通过 i18n 管理：
- 导航、按钮、标签、placeholder、提示语、错误信息等 UI 文本使用中文
- 英语学习内容（场景标题、台词、练习指令、评分反馈等）保留英文，这是产品核心体验
- i18n key 用英文命名（`scene.pickRole`、`elian.feedback`）
- 默认语言文件为 zh.json，同时提供 en.json 以备后续国际化

### TDD 策略（务实 TDD）

| 代码类型 | TDD 严格度 | 说明 |
|---------|-----------|------|
| 业务逻辑（services, hooks, stores） | **严格** | 先写测试，再实现 |
| Pipeline 各模块 | **严格** | 先写测试，再实现 |
| UI 组件 | **宽松** | 功能优先，后补测试 |
| Bug 修复 | **严格** | 先写失败测试，再修复 |

补充要求：
- 对无法完全自动化复现的原生媒体问题，至少要把**纯规则部分**抽到 service / helper 并补单测，例如：时长计算、状态归一化、回放时序决策

### Code Review 工作流

- 当前默认采用 **轻量高频** code review 工作流
- 完整工作流正文见 `docs/03_Development/Code_Review_Workflow.md`
- 普通功能改动默认做当前变更范围的 targeted review，不默认每次都做全仓完整 review
- 以下改动必须进入高风险 review：`auth`、`payment`、`quota`、`cloud functions`、`database mutation`、`file upload/delete`、`media processing`、`external callback/webhook`、`env/secrets`、`migration`、`admin 权限`
- 在 Codex 中，`requesting-code-review` 用于发起 review，`receiving-code-review` 用于处理 review 结果
- `auto-review` 可作为可选补充检查；当前阶段**不使用** `coderabbit review`
- 高风险改动在 merge 前必须满足：review 完成、关键问题关闭、相关验证通过

### 架构决策原则

- **Serverless First**: 使用 CloudBase 云函数，避免传统服务器部署
- **渐进增强**: W1-2 硬编码模板 → W3+ AI 集成（成本优化）
- **平台原生 STT**: 使用 expo-speech-recognition（封装 iOS Speech Framework / Android SpeechRecognizer），不使用第三方 STT 服务
- **客户端原生合成**: 配音合成的正式目标架构是客户端 Expo Module，使用平台原生媒体 API（iOS `AVFoundation` / Android `MediaCodec`）执行最终音视频混音与导出
- **媒体合成迁移基线**: `MP4/H.264 + AAC` 成片已收敛到客户端原生媒体栈导出；旧云端合成函数已下线，后续不得恢复云端最终合成或编码兜底，除非先更新 spec 与 steering
- **规范依据**: 媒体合成相关实现与后续扩展必须遵循 `docs/superpowers/specs/client-media-composer/`
- **生命周期管理**: 用户录音 7 天自动删除，分享视频 30 天自动删除

### 多环境开发规则

- **禁止硬编码环境身份**：不得在业务代码、测试夹具、文档示例外的实现代码中硬编码 CloudBase `envId`、bucket、函数域名、旧环境 ID
- **环境元数据单一来源**：远程环境元数据统一来自 `config/environments/`，不要在多个模块各自维护一份
- **App 与 Pipeline 分层消费**：
  - App 运行时通过 `EXPO_PUBLIC_APP_ENV` / `EXPO_PUBLIC_CLOUDBASE_ENV_ID` 消费环境
  - Pipeline 与 scripts 通过 `getEnvConfig()` 消费环境
  - App 业务代码不要直接 import `config/environments/`
- **local/dev/prod 语义固定**：
  - `local` = mock，不连 CloudBase
  - `dev` / `prod` = 真实远程环境
  - `dev` / `prod` 缺配置时必须快速失败，不允许静默降级
- **脚本入口标准化**：
  - 环境模板统一通过 `scripts/sync-env.ts`
  - 云函数部署统一通过 `scripts/deploy.ts`
  - 环境初始化统一通过 `scripts/init-env.ts`
  - 远程 ingest 统一通过 `pipeline` 的 `--env`
- **新增 CloudBase CLI 能力时，先做 TypeScript 脚本封装**，不要把一次性手工命令沉淀成长期操作规范

### 区域化开发规则

- 地区差异统一收敛在 `MofunGenAI/src/region/`
- App 业务层应优先依赖 `providers.*` / `regionConfig`，不要直接绕过 region adapter 调中国区实现
- 新增地区差异时，优先扩展 region adapter/interface，不在业务组件内写 `if (region === ...)` 散点逻辑

### CloudBase 权限与密钥基线

- **云函数权限默认禁止匿名调用**，只对确有必要的公共函数做白名单放行
- 云函数安全规则基线见 `MofunGenAI/cloudbase/function-security-rules.json`；通配非匿名规则必须使用 CloudBase 支持的固定表达式：`auth.loginType != 'ANONYMOUS' && auth != null`
- 对已有服务端鉴权 helper 的函数，可在平台规则使用 `auth != null`，再由函数内部拒绝匿名态；当前 `elianDiscussion` / `elianMemoryUpdate` 按此方式处理，以兼容 CloudBase JS SDK 自定义登录态缺失 `loginType` 的情况
- 登录前可匿名调用的函数应保持最小集合，当前基线通常只包括：
  - `getPublishedScenes`
  - `wechatLogin`
  - `appleLogin`
- `phoneLoginUpsert` 必须要求非匿名 auth，并在函数内通过 `auth.getUserInfo().uid` + `auth.getEndUserInfo(uid).userInfo.phone` 验证服务端手机号；不得匿名信任客户端身份字段
- **登录后能力默认要求非匿名身份**，尤其是：
  - 配音合成
  - 支付
  - 账号绑定
  - 学习记录写入
  - 文件删除 / 清理
- **云存储权限按目录分层**：
  - `scenes/` 资源默认面向客户端读取
  - `templates/` 资源默认面向客户端读取，用于本地合成模板分发
  - 配音录音与最终成片默认保存在客户端本地，不再写入 `dubbing-inputs/` 或 `merged-videos/` 作为正式链路
- **自定义登录私钥变量统一使用新命名**：
  - `CLOUDBASE_CUSTOM_LOGIN_PRIVATE_KEY_ID`
  - `CLOUDBASE_CUSTOM_LOGIN_PRIVATE_KEY`
- 除兼容旧逻辑的过渡代码外，后续实现不要继续引入 `CLOUDBASE_PRIVATE_KEY_ID` / `CLOUDBASE_PRIVATE_KEY`

### 安全与合规

- API Keys 存储在 CloudBase 环境变量中，禁止提交到代码仓库
- 本地 `.env` 文件已在 `.gitignore` 中
- 用户数据遵循 GDPR/PIPL 合规要求
- 用户生成的配音内容需要内容审核
- 微信支付遵循官方集成指南

### 媒体处理合规基线

- **本节是工程执行基线，不构成法律意见**。在缺少外部法务确认时，默认采用最保守实现。
- **背景音提取允许，但仅限 copy-only**：从原视频中提取背景音轨时，优先使用 demux / stream copy，不把“提取背景音”实现成重新编码任务。
- **背景音混音默认在客户端原生执行**：当前正式方案要求由 iOS / Android 客户端完成背景音混音、音量控制与时序处理，不把云函数作为默认混音执行端。
- **服务端禁止新增视频编码**：禁止在云函数中使用 `libx264`、`libx265` 或任何其它视频重新编码器生成新视频段；需要片尾、讨论段、黑屏段、字幕卡时，优先使用上游预生成模板资产，只做拼接 / 复用。
- **服务端禁止把 AAC 重新编码作为默认方案**：`-c:a aac`、`libfdk_aac` 等会生成新 AAC 音轨的路径，不得作为正式基线进入默认链路。
- **AAC copy 可以作为过渡方案**：如果输入录音或上游素材本来就是系统产出的 `m4a/AAC`，且服务端仅做封装复用、不生成新的 AAC 比特流，可作为过渡实现保留。
- **Opus 不是无条件替代品**：Opus 在专利与许可证层面更干净，但在当前项目里不能直接替代生产链路；只有在 iPhone 真机、`expo-video`、相册导出、主流分享链路验证通过后，才可进入默认方案。
- **最终成片默认不做云端编码兜底**：当前版本不提供服务端最终导出、服务端混音兜底或服务端转码兜底。只有拿到真实失败数据并确认“最终导出失败是主要问题”后，才重新评估是否增加云端末端封装兜底。
- **混音需求优先前移或留在端上**：如果产品必须保留背景 bed、讨论段或尾卡音频，优先在客户端原生媒体栈或上游生成阶段完成；不要把实时云函数扩展成通用转码器。
- **素材来源约束必须明确**：只有“Google 生成输出或团队自有素材”可进入默认媒体处理链路。任何用户上传的第三方视频、音乐、配乐、影视片段、明星音色或未确认授权素材，默认禁止进入自动提取、混音、拼接流程。
- **Google 生成输出的工程假设**：当前默认假设上游使用 Google 生成视频服务，生成输出可由项目方在协议允许范围内继续加工与分发；但 Google 生成内容条款不能替代项目自身的合规义务，因此仍需避免在下游新增编码与外部素材混入。
- **出现以下任一情况必须先更新 spec / steering 再开发**：引入新的音频编码格式、恢复服务端混音、恢复服务端视频编码、恢复云端最终导出兜底、引入外部音乐库、支持用户上传外部视频 / 音乐、改变分享分发模式。

### 性能优化

- 视频预加载：当前场景练习时缓存下一个场景视频
- 双轨分离：视频轨和音频轨独立控制，跟读时只静音音频轨
- 状态管理：Zustand 管理轻量状态，React Query 管理服务端缓存
- 词典缓存：客户端内存缓存已查询的词条，减少网络请求
- 包体积：监控 JS bundle 大小，大功能实施代码分割
