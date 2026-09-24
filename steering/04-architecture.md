---
inclusion: fileMatch
fileMatchPattern: "**/*.{ts,tsx,js,jsx}"
---

# 系统架构

当读取代码文件时自动加载，提供架构上下文。

---

## 三层 CloudBase 架构

```
┌─────────────────────────────────────────────────────┐
│ Content Pipeline（离线，开发端运行）                  │
│ Theme Seed → Scene Gen → Dialogue Gen →              │
│ Quality Scoring → Learning Breakdown →               │
│ Veo Video Gen → 音轨拆分 → Upload to CloudBase       │
│ AI: OpenAI（预生成，按环节分模型）                    │
└─────────────────────┬───────────────────────────────┘
                      │ 场景包（视频轨+音频轨+字幕+语言点）
┌─────────────────────▼───────────────────────────────┐
│ Client Layer: React Native + Expo SDK 55             │
│ - 4 步学习流（Intro → Watch → Shadow → Summary）     │
│ - 视频播放（expo-video，双轨分离控制）                │
│ - 录音（expo-audio）+ STT（expo-speech-recognition） │
│ - 配音合成目标基线（expo-media-composer，本地原生导出）│
│ - 可交互双语字幕（点击查词）                          │
│ - i18n（react-i18next）                              │
│ - State: Zustand + React Query                       │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS (CloudBase SDK)
┌─────────────────────▼───────────────────────────────┐
│ Service Layer: CloudBase Cloud Functions              │
│ - Elian 反馈生成（调用 DeepSeek）                     │
│ - Elian 记忆更新（调用 DeepSeek）                     │
│ - 配音合成不再作为长期职责继续扩展                    │
│ - 订阅管理 / 支付回调                                 │
│ AI: DeepSeek（实时生成）                              │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│ Data Layer: CloudBase                                 │
│ - Database: scenes, users, practices, dictionary,     │
│             config, subscriptions                     │
│ - Storage: 视频轨、音频轨、模板素材、用户作品文件      │
│ - CDN: 视频分发                                       │
└─────────────────────────────────────────────────────┘
```

## 仓库结构

- **pipeline/**: 内容生成 Pipeline（Node.js CLI，独立项目）
- **MofunGenAI/**: 主 React Native App（Expo 框架）— 开发重心
- **website/**: `mofunshow.com` 官网（Next.js Web 项目），承载品牌展示、下载入口、SEO、备案与发布/合规页面
- **cloudbase/**: CloudBase 云函数
- **docs/**: 6 层文档体系（45+ markdown 文件）

## 官网职责边界（website/）

`website/` 是面向用户与搜索引擎的官网子项目，不属于 App 客户端，也不属于内容生产或云函数层。

- **职责包括**：
  - 展示 MofunShow / 英语魔方秀品牌、核心价值与发布信息
  - 提供 App Store、Android 渠道、二维码等下载入口
  - 承载 SEO metadata、备案信息、隐私政策、服务条款、合规披露等发布页面
  - 在官网需要展示产品截图、宣传图、二维码、图标等静态资产时，优先放在 `website/public/`
- **职责不包括**：
  - 不承载 App 内学习流业务逻辑
  - 不直接实现 CloudBase 用户数据写入、支付、配音合成、学习记录等 App 服务能力
  - 不作为内容 Pipeline 的输入或输出目录
- **规范边界**：
  - 官网文案、品牌名、slogan 优先对齐 `.kiro/steering/03-product-context.md`
  - 官网 UI 是 Web/Next.js/Tailwind 体系，不适用 `MofunGenAI/` 的 Expo Router、React Native 组件和 `ThemedText` / `ThemedView` 规则
  - 官网部署配置可独立于 App，但不得提交环境密钥、平台 token 或本机构建产物

## 区域与环境双轴配置

当前仓库存在两个**正交维度**，后续开发必须同时考虑：

- **Region 维度**：`CN` / `GLOBAL`
  - 运行时通过 `APP_REGION` 区分
  - 代码入口在 `MofunGenAI/src/region/`
  - `regionConfig` / `providers` 负责抽象登录、支付、Push、Cloud 等地区差异
- **Environment 维度**：`local` / `dev` / `prod`
  - 运行时通过 `APP_ENV` / `EXPO_PUBLIC_APP_ENV` 区分
  - 非敏感环境元数据统一放在 `config/environments/`
  - `scripts/sync-env.ts` / `scripts/init-env.ts` / `scripts/deploy.ts` 负责环境模板、初始化与部署

这两个维度是组合关系，不允许互相替代：

- 不允许用 Git 分支长期承载不同环境差异
- 不允许把 CloudBase `envId`、bucket、函数域名硬编码到业务代码
- 不允许把 region 差异塞进 `config/environments/`
- 不允许把 env 差异塞进 `src/region/`

### 环境配置单一来源

`config/environments/` 是远程环境身份信息的**单一事实来源**，当前承载：

- `cloudbaseEnvId`
- `storageBucket`
- `region`
- `functionDomain`
- `isProduction`

约束如下：

- App 代码**不直接 import** `config/environments/`
- Pipeline 与 scripts 可以 import `config/environments/`
- App 只消费由 `scripts/sync-env.ts` 生成的 `.env.dev` / `.env.prod`
- 本机实际运行文件始终是未提交的 `.env`

### 环境状态语义

- `local`：本地 mock 模式，不连接 CloudBase
- `dev`：连接开发环境 CloudBase
- `prod`：连接生产环境 CloudBase

`APP_ENV=dev|prod` 时，如果缺少 `EXPO_PUBLIC_CLOUDBASE_ENV_ID`，必须直接报错，不能静默回退 mock，也不能进入半初始化状态。

### 多环境脚本入口

涉及远程 CloudBase 的标准入口如下：

- App 模板生成：`npx tsx scripts/sync-env.ts --env dev|prod`
- 云函数部署：`npx tsx scripts/deploy.ts --env dev|prod [--fn <name>]`
- 环境初始化：`npx tsx scripts/init-env.ts --env dev|prod`
- Pipeline 入库：`npm run ingest -- <sceneId> <videoPath> --env dev|prod ...`

约束如下：

- 优先使用上述 TypeScript 脚本，不把 `tcb` 手工命令作为日常主流程
- 纯本地命令（如 generate、portrait、memory）不要求 `--env`
- 会触达 CloudBase 的 CLI 必须显式带 `--env` 或从 `APP_ENV` 得到明确环境
- 新增环境相关脚本时，优先复用 `getEnvConfig()`，不要重复解析 envId/bucket

## App 目录结构（MofunGenAI/）

```
MofunGenAI/
├── app/
│   ├── _layout.tsx                 # 根布局（主题、i18n、QueryClient）
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Tab 导航布局
│   │   ├── index.tsx               # 首页（场景列表）
│   │   └── profile.tsx             # 个人主页
│   └── scene/
│       └── [id].tsx                # 场景学习流主页面（4 步流程）
├── src/
│   ├── components/
│   │   ├── scene/                  # 学习流组件
│   │   │   ├── ElianIntro.tsx      # Step 1: Elian 介绍
│   │   │   ├── VideoPlayer.tsx     # Step 2: 双轨视频播放器
│   │   │   ├── InteractiveSubtitle.tsx  # 可交互字幕
│   │   │   ├── RolePicker.tsx      # 角色选择
│   │   │   ├── ShadowingPlayer.tsx # Step 3: 逐句跟读
│   │   │   └── RecordingButton.tsx # 录音按钮
│   │   ├── elian/                  # Elian 组件
│   │   │   ├── ElianBubble.tsx     # 对话气泡
│   │   │   └── ElianAvatar.tsx     # 头像
│   │   └── ui/                     # 通用 UI 组件
│   │       ├── ThemedText.tsx
│   │       └── ThemedView.tsx
│   ├── services/                   # 数据服务层
│   │   ├── cloudbase.ts            # CloudBase SDK 初始化
│   │   ├── sceneService.ts         # 场景 CRUD
│   │   ├── dictionaryService.ts    # 词典查询
│   │   └── feedbackService.ts      # Elian 反馈（调用云函数）
│   ├── stores/                     # Zustand 状态
│   │   ├── sceneStore.ts           # 当前场景/学习流状态
│   │   └── userStore.ts            # 用户状态
│   ├── hooks/                      # React Query hooks + 自定义 hooks
│   │   ├── useScenes.ts
│   │   ├── useScene.ts
│   │   ├── useDictionary.ts
│   │   ├── useRecording.ts
│   │   └── useSpeechRecognition.ts
│   ├── i18n/                       # 国际化
│   │   ├── index.ts
│   │   ├── en.json
│   │   └── zh.json
│   └── types/                      # 客户端类型定义
│       └── index.ts
└── cloudbase/
    └── functions/                  # 云函数源码
        └── elianFeedback/
```

## Pipeline 目录结构

```
pipeline/
├── src/
│   ├── index.ts                    # CLI 入口
│   ├── config.ts                   # 配置（API keys、模型、阈值）
│   ├── types.ts                    # 共享类型
│   ├── generate/                   # 生成模块
│   ├── quality/                    # 质量评估+修复
│   ├── video/                      # 视频生成+音轨拆分
│   └── upload/                     # CloudBase 上传
├── tests/                          # Vitest 测试
└── seeds/                          # Theme Seed 数据
```

## 关键依赖

### App（MofunGenAI）
- React Native + Expo SDK 55
- expo-video: 视频播放（双轨分离控制）
- expo-audio: 音频录制
- expo-speech-recognition: 平台原生 STT
- react-i18next: 国际化
- Zustand: 轻量客户端状态
- @tanstack/react-query: 服务端状态缓存
- @cloudbase/js-sdk: CloudBase 客户端 SDK

### Step 3 音频架构经验（iOS）

- `Shadow & Record` 在 iOS 上对 `expo-audio` 的全局 audio subsystem 很敏感，**录音与自动试听都不能假设会话会自动干净复位**
- 录音链路必须遵守以下约束：
  - 每次开始录音前，先 `setIsAudioActiveAsync(false)` 再 `setIsAudioActiveAsync(true)`
  - 每次录音都新建一个新的原生 recorder，不复用上一次 recorder 实例
  - 每次停止录音后，要显式销毁 recorder，并把 `allowsRecording` 切回 `false`
- 自动试听链路也要避免长期复用 player：
  - 用户录音 player 与背景音 player 使用懒创建
  - 多次重复试听不稳定时，优先怀疑 player 生命周期或全局 audio session 没有复位，而不是先改 UI
  - 自动试听前如出现“第一次正常、后续随机不播放”的模式，优先检查是否需要和录音一样重置 `setIsAudioActiveAsync`
  - 自动试听与手动回放默认都应等待 player 进入 `isLoaded` 后，再执行 `seekTo()` / `play()`；不要假设“先 play 后加载完成”一定能在 iOS 上保留播放意图
- `Step 3` 至少存在两类不同的回放 transport，不能混用：
  - 普通“原速 / 慢速” = video + 原声音轨，从 `lineStart` 到 `lineEnd` 的句内重播
  - 自动试听 = video 画面 + 用户录音 player（可选背景 bed），到句尾时只冻结视频
- 对普通“原速 / 慢速”：
  - 到句尾时必须同时停掉视频和原声音轨，不能只停视频
  - 快速重复点击必须使用 **latest-only** 语义，不能把所有 replay 请求简单排队执行
  - `pause -> seek -> play` 必须收敛成一个原子重播操作；不要在页面层自己拼 transport 命令
  - 如果用户在上一轮仍在播放时再次点击，优先怀疑 **video transport 没停稳**，而不是先怀疑音源切错
  - `expo-audio.seekTo` 与 `expo-video` 句内 seek 默认按**精确模式**处理；必要时把 tolerance 设为 0
- 调试普通“原速 / 慢速”时，必须区分 audio / video 谁先错位：
  - 如果 `audio` 已回到 `lineStart`，但 `video` 还停在旧句尾附近，继续查 `expo-video`
  - 不要把“只听到没有人声的一段”直接等同于“切到了纯背景音文件”
- iOS 真机优先于模拟器：
  - 模拟器上的 `AudioConverterNew returned -50`、`0 ch` 等日志不能作为录音链路真实性能判断依据
  - `Step 3` 的录音 / 回放问题默认以真机结果为准
- 当前稳定性护栏（未完成完整替代方案前不要轻易移除）：
  - 录音前后的 global audio subsystem reset
  - 自动试听前的 playback audio subsystem reset
  - 自动试听与录音回放的 player 懒创建 / 单次使用
  - 如果要移除任一护栏，必须先完成 iPhone 真机上的多轮回归：连续录音、多次自动试听、手动录音回放、切句后再试听
- 调试顺序固定为：
  1. 先验证 recorder / player 生命周期是否被复用
  2. 再验证全局 audio subsystem 是否需要显式 reset
  3. 再验证 player 是否在 `isLoaded=false` 阶段过早收到 `play()`
  4. 最后才看 UI 层时序与播放器联动

### Pipeline
- OpenAI SDK: 内容生成（按环节分模型）
- @cloudbase/node-sdk: CloudBase 服务端 SDK
- FFmpeg: 音视频轨拆分（本地 CLI）
- Vitest: 测试

## AI 服务

| 类型 | 模型 | 用途 |
|------|------|------|
| 预生成（Pipeline） | OpenAI gpt-4o / gpt-4o-mini | 场景、对话、质量评估、学习拆解 |
| 实时（云函数） | DeepSeek Chat | Elian 反馈、讨论、记忆更新 |
| 视频生成 | Google Veo | 带语音的完整视频 |

## 媒体合成边界

- steering 授权的正式目标架构：**最终音视频混音与成片导出收敛到客户端执行**，输出 `MP4/H.264 + AAC`
- 目标实现载体为 `expo-media-composer`，底层使用 iOS `AVFoundation` 与 Android `MediaCodec`
- 迁移节奏以 `docs/superpowers/specs/client-media-composer/` 为准：旧云端合成函数已下线，最终成片导出由客户端 Expo Module 承担
- 当前合规与维护基线：
  - 云端可以分发模板素材，但不承担最终媒体编码或合成
  - AI disclosure 尾卡使用 App 预置资产，不依赖云函数动态生成
  - 最终成片默认不提供云端编码兜底
- 以下能力默认不属于云端职责，除非更新 spec 与 steering 后显式批准：
  - 服务端 `libx264` / `libx265` 视频编码
  - 服务端生成新的 AAC 音轨
  - 服务端最终导出 `MP4/H.264 + AAC`
  - 运行时黑屏段、尾卡段、讨论段的视频重编码
  - 用户上传第三方音视频后的自动混音 / 拼接
- 如果产品需要背景 bed、尾卡、讨论段、字幕卡，优先方案是：
  - 在客户端原生媒体栈完成混音与最终导出
  - 或在上游生成阶段产出最终模板资产
  - 云端仅负责模板素材分发、存储与通用业务能力
  - 不把实时云函数扩展成“任意素材进来都能重新编码”的媒体处理服务

## 成本优化策略

- Pipeline 按环节分模型：结构化任务用 gpt-4o-mini，创意/评估用 gpt-4o
- 免费用户: 平台原生 STT + DeepSeek 反馈（零额外成本）
- 配音合成: 客户端原生模块导出，不引入云端合成单次成本
- 视频分发: CloudBase 内置 CDN
