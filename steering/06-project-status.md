---
inclusion: manual
---

# 项目状态

查看项目当前进度时通过 `#06-project-status` 引用。

---

## 当前状态（2026-06-19）

> **项目阶段**: 发布准备与上线 Gate 收口阶段
> **当前分支**: `chore/app-testing-readiness`
> **更新前 Git 基线**: `git status --short --branch` 显示工作区干净，当前分支为 `chore/app-testing-readiness`
> **上次状态更新**: 2026-06-19

当前项目已经不再是 PoC、基础 App 搭建或单纯功能闭环阶段。主线工作已推进到生产环境、商店审核、旧用户迁移和真机 smoke 的上线前收口：

1. iOS / Android 发布身份、版本号、合规材料和生产 CloudBase 环境已基本就绪
2. 旧用户上线前迁移主批次已完成，认领入口生产侧处于冻结 / 可控状态
3. App Store Review 专用手机号登录、EAS production credentials、TestFlight 真机 smoke 是当前发布阻塞点
4. App 主体验、支付、游戏化、魔币流水、首页/发现页真实数据等功能持续进入发布前细节修正
5. 媒体合成长期方案已经收敛为客户端 `expo-media-composer`，不得默认恢复云端最终合成

---

## 已完成里程碑

- PoC 阶段已完成，CloudBase、Pipeline 与 App 主链路均已进入工程化与上线准备阶段
- App 基础架构完成：Expo SDK 55、React Native 0.83、expo-router、CloudBase SDK、i18n、Zustand、React Query、主题 token 与 Jest 测试基线
- App 核心页面已实现：首页、发现页、练习页、魔方秀页、个人页、登录页、引导页、旧用户认领页、场景学习流
- Step 2 / Step 3 / Step 4 主链路已实现：视频播放、双轨字幕、逐句跟读、录音回放、发音反馈、词典抽屉、Elian 讨论与作品生成入口
- 客户端本地合成架构已接入：`MofunGenAI/modules/expo-media-composer/`、`compositionService`、`templateService`、`dubbingService` 与本地作品生成 UI
- 生产 CloudBase 环境已创建并写入 `config/environments/prod.ts`：`mofunshow-reborn-prod-cn-dfe75d7`
- 开发 CloudBase 环境仍为 `config/environments/dev.ts`：`mofunshow-reborn-d4e77bic9c7ca3f`
- 发布配置脚本已固定首发身份：iOS `com.Mofunsky.EnglishMofunShow`、Android `com.memory.me`、版本 `12.0.0`
- 合规材料已发布到 `app.mofunshow.com`，release gate 中 legal 页面与 compliance JSON 已有 2026-06-16 的通过记录
- Plan 6 旧用户迁移主批次已完成：release go/no-go 记录显示 2026-06-17 用户正式 import、抽样验收、claim freeze 与回滚材料已归档
- CloudBase 函数目录已扩展到 38 个函数目录 + `_shared`，覆盖登录、认领、Elian、支付、订阅、游戏化、模板资产、审核登录、账号注销等能力
- App 测试规模已扩展到约 214 个 Jest 测试文件，Pipeline 测试规模已扩展到约 62 个 Vitest 测试文件
- Spec 生命周期规范已落地为 `.kiro/steering/07-spec-management.md`，`docs/superpowers/specs/SPECS.md` 是 Spec 状态与接管关系唯一权威来源

---

## 当前重点阶段

### 1. 发布 Gate 与商店审核准备

当前最重要的状态来源是：

- `docs/release/release-go-no-go.md`
- `docs/release/testflight-smoke-checklist.md`
- `docs/release/app-review-phone-login-evidence.md`
- `docs/release/app-store-connect-checklist.md`
- `docs/release/production-cloudbase-checklist.md`

截至 2026-06-19，主要阻塞 / 进行中项为：

- EAS production iOS build credentials 尚未完成配置，release go/no-go 标记为阻塞
- App Review 审核手机号登录仍处于 pending / 阻塞状态，需要完成生产环境变量、函数部署、审核账号隔离与 TestFlight smoke
- TestFlight 最小真机 Gate B 尚未开始，需要至少 1 台 iPhone 真机完成冷启动、审核登录、公开内容读取、Step 2、Step 3、Step 4、合规链接、会员页与保存/分享 smoke
- 支付、登录、录音、分享、认领入口的 iOS / Android 真机测试仍在进行中
- 生产 CloudBase 函数权限、环境变量和回调 URL 已部分核验，但支付 / 登录回调 URL 冻结仍需按 release checklist 复核

### 2. 旧用户迁移与认领安全

旧用户迁移已经进入上线前冻结与证据归档阶段：

- `prelaunch-full-20260616` 主批次已完成用户、资产、权益导入与抽样验收
- `claimLegacyUser` 云函数已上线并通过相关单元测试记录
- 生产 `legacyClaimEnabled=false`，认领入口默认冻结，不影响普通登录与新用户注册
- `legacy_*` 集合权限已核验为 `ADMINONLY`
- 仍需补齐客服 FAQ 中无法认领、候选冲突、会员补偿、金币 / 成长值解释等材料

旧用户相关改动必须优先读取：

- `docs/superpowers/specs/2026-05-28-legacy-migration-safety-design.md`
- `docs/superpowers/specs/2026-06-13-legacy-claim-experience-design.md`
- `docs/release/release-go-no-go.md`
- `docs/release/customer-support-faq.md`

### 3. 客户端音视频合成与真机稳定性

正式架构目标已经从旧云端合成迁移到客户端原生模块：

- 目标载体：`MofunGenAI/modules/expo-media-composer/`
- JS 消费侧：`compositionService`、`templateService`、`dubbingService`、`useDubbing`
- 输出目标：`MP4/H.264 + AAC`
- 规范依据：`docs/superpowers/specs/client-media-composer/`

后续不得把最终成片导出重新接回云端函数，除非先更新 `client-media-composer` spec、`.kiro/steering/02-coding-standards.md` 与 `.kiro/steering/04-architecture.md`。

仍需以真机证据收口：

- iOS：录音、自动试听、手动回放、句内重播、本地合成、保存与系统分享
- Android 13+：prepared file / 临时 ASR WAV、Step 3 发音评价、Step 4 chatting fallback
- Android 12 及以下：旧版语音降级路径、键盘兜底与用户提示
- 分享目标：相册、系统分享面板、微信 / 抖音等平台回放

### 4. Spec 驱动的功能收口

当前所有 Feature Spec 状态以 `docs/superpowers/specs/SPECS.md` 为准。读取实现依据时必须先确认状态：

- `active`：可作为当前实现依据
- `draft`：可作为当前设计草案或进行中实现依据，但需要注意未完成项
- `superseded`：仅保留历史背景，不作为新实现依据
- `archived`：只供历史追溯

更新或新增 Spec 时必须遵守 `.kiro/steering/07-spec-management.md`：

- 新 Spec 必须写入 `SPECS.md`
- 接管关系必须显式声明
- Spec 修订记录必须说明 WHY
- 当前迭代进度源按 Spec 形态确定：三件套用 `tasks.md`，单文件 Spec + implementation plan 用对应 plan 文档
- 发现 Spec 冲突时必须在修订记录和 `SPECS.md` 中显式化

---

## App 当前模块状态

| 模块 | 路径 | 状态 |
|------|------|------|
| 根布局与 Provider | `MofunGenAI/app/_layout.tsx` | 已实现 |
| Tab 导航 | `MofunGenAI/app/(tabs)/` | 已实现 |
| 首页 / 发现 / 练习 / 魔方秀 / 个人页 | `MofunGenAI/app/(tabs)/*.tsx` | 已实现，持续真实数据与发布态收口 |
| 登录与引导 | `MofunGenAI/app/login.tsx`, `MofunGenAI/app/onboarding.tsx` | 已实现 |
| 旧用户认领 | `MofunGenAI/app/legacy-claim.tsx` | 已实现，生产入口当前受远程配置冻结 |
| 场景学习流 | `MofunGenAI/app/scene/[id].tsx` | 已实现，需继续真机 smoke |
| Step 2 视频播放器 | `MofunGenAI/src/components/scene/VideoPlayer.tsx` | 已实现 |
| Step 3 跟读 | `MofunGenAI/src/components/scene/ShadowingPlayer.tsx` | 已实现，音频链路需真机回归 |
| Step 3 查词抽屉 | `MofunGenAI/src/components/scene/Step3DictionaryDrawer.tsx` | 已实现 |
| Step 4 Summary / Elian 讨论 | `MofunGenAI/src/components/scene/SummaryReview.tsx`, `ElianDiscussion.tsx` | 已实现，语音 fallback 持续收口 |
| 本地作品生成 UI | `MofunGenAI/src/components/scene/DubbingGeneration.tsx` | 已实现 |
| 本地合成服务 | `MofunGenAI/src/services/compositionService.ts`, `dubbingService.ts` | 已接入 |
| 原生合成模块 | `MofunGenAI/modules/expo-media-composer/` | 已实现，待完整真机验收 |
| CloudBase 服务层 | `MofunGenAI/src/services/` | 已扩展到约 84 个 service 文件 |
| 自定义 Hooks | `MofunGenAI/src/hooks/` | 已扩展到约 15 个 hook 文件 |
| 状态管理 | `MofunGenAI/src/stores/` | 已扩展到约 4 个 store 文件 |
| 区域化与合规 | `MofunGenAI/src/region/` | 已实现基础设施 |
| 国际化 | `MofunGenAI/src/i18n/` | 已实现 |

---

## Pipeline 当前模块状态

Pipeline 仍是内容生产主入口，当前能力包括：

- 场景生成与 canonical script
- 对话生成与学习拆解
- Line-level 学习规划与 Elian 风格化讲解
- 质量评估与 reviser
- 角色库、角色选择、角色记忆与关系记忆
- AI-native visual pipeline
- 多栏目 / 多系列内容生产组织
- 模型策略 A/B 评估与质量门禁
- 时间轴对齐、音轨拆分、背景音 artifact、composition-safe video 元数据
- CloudBase 上传、入库与环境化 ingest

当前重点不是从零搭建 Pipeline，而是保证 Pipeline 输出继续满足 App 本地合成、发现页真实数据、系列组织与学习流消费契约，尤其是：

- `backgroundAudioFileId`
- `discussionTemplateId`
- `sceneVideoEncoding`
- `series` / `columnId`
- 模板资产 `compositionProfile` / `decoderConfigHash` / `firstSampleIsSync`
- `cacheVersion`

---

## 当前有效 Spec 与计划入口

读取任务状态时优先从以下入口开始：

- `.kiro/steering/07-spec-management.md`
- `docs/superpowers/specs/SPECS.md`
- `docs/release/release-go-no-go.md`
- `docs/release/testflight-smoke-checklist.md`
- `docs/superpowers/specs/client-media-composer/`
- `docs/superpowers/specs/region-config-compliance/`
- `docs/superpowers/specs/multi-environment-setup/`
- `docs/superpowers/specs/payment-order-admin-ops/`
- `docs/superpowers/specs/gamification-system/`
- `docs/superpowers/specs/subscription-pricing-and-entitlements/`
- `docs/superpowers/specs/2026-06-17-app-review-phone-login-design.md`
- `docs/superpowers/specs/2026-06-19-magic-coin-transactions-design.md`

注意：

- `SPECS.md` 是 Spec 状态与接管关系唯一权威来源
- 若计划文件 checkbox 与代码事实冲突，先查代码、最近提交和 release / runbook 证据，再更新计划或 Spec 状态
- 媒体合成相关决策以 `.kiro/steering/02-coding-standards.md`、`.kiro/steering/04-architecture.md` 与 `client-media-composer` spec 为准
- 发布相关状态以 `docs/release/release-go-no-go.md` 为准，本文只记录阶段性概览

---

## 当前待办与风险

### P0：发布前必须处理

- 配置 EAS production iOS build credentials，并完成 production build 上传
- 完成 `appReviewPhoneLogin` 的生产环境变量、部署、审核账号隔离和 TestFlight smoke 证据
- 完成 TestFlight 最小真机 Gate B，并把证据回填到 `docs/release/testflight-smoke-checklist.md`
- 复核生产 CloudBase 函数权限、环境变量、支付 / 登录回调 URL、安全规则与匿名调用白名单
- 验证完整 E2E 用户旅程：登录 → 选场景 → 观看 → 跟读 → 讨论 → 生成本地作品 → 保存/分享
- 补齐客服 FAQ 与商店审核资料中仍标记为未开始 / 进行中的项目

### P1：近期应继续收口

- Android 13+ prepared file 转写的真机稳定性与错误降级体验
- Android 12 及以下旧版语音路径的用户提示与键盘兜底体验
- Step 4 讨论输入的键盘 / 语音切换、自动聚焦与 transcript 合并体验
- 模板资产入库、模板元数据、composition-safe encoding contract 的环境一致性
- 支付订单、订阅状态、补单对账、Apple Server Notifications V2 与国内渠道参数的上线前确认
- 首页 / 发现页 / 我的页真实数据化、魔币流水与游戏化展示的发布态细节

### P2：后续增强

- Push、连续学习、成长体系与分享链路完善
- Pipeline 批量内容生产与质量门禁自动化
- 管理后台与运营工具
- 发布后监控、灰度扩量、客服工单与用户反馈闭环
- 国际区 `GLOBAL` 渠道与海外商店发布

---

## 技术决策记录

| 决策 | 当前结论 | 时间 |
|------|----------|------|
| 配音 / 作品合成长期方案 | 客户端 `expo-media-composer`，使用平台原生媒体栈导出 `MP4/H.264 + AAC` | 2026-05 |
| 云端最终媒体合成 | 旧云端最终合成职责已被 `client-media-composer` 接管；后续不恢复云端最终编码或合成兜底，除非先更新 spec 与 steering | 2026-05 |
| Expo SDK 版本 | SDK 55 | 2026-04 |
| App 发布版本 | `12.0.0`，iOS build `120001`，Android versionCode `120000` | 2026-06 |
| iOS Bundle ID | `com.Mofunsky.EnglishMofunShow` | 2026-06 |
| Android package | `com.memory.me` | 2026-06 |
| App 主目录 | `MofunGenAI/`，不是根级 `app/` | 2026-05 |
| CloudBase RN 适配 | `@cloudbase/adapter-rn` 与 `@cloudbase/js-sdk` | 2026-05 |
| 多环境配置 | `config/environments/` 为远程环境元数据单一来源 | 2026-05 |
| 生产环境 | `mofunshow-reborn-prod-cn-dfe75d7` | 2026-06 |
| 区域化配置 | `MofunGenAI/src/region/` 承载 CN / GLOBAL 差异 | 2026-05 |
| Step 4 实时 AI | `elianDiscussion` / `elianMemoryUpdate` 调 DeepSeek，并加入 AI 安全与模型白名单 | 2026-05 |
| 语音识别 | iOS 文件转写；Android 13+ prepared file；Android 12 及以下降级 | 2026-05 |
| Spec 状态源 | `docs/superpowers/specs/SPECS.md` 是状态与接管关系唯一权威来源 | 2026-06 |

---

## 重启或接手前检查项

1. 先执行 `git status --short --branch`，确认当前分支与是否有未提交改动
2. 读取 `.kiro/steering/01-language-and-git.md`、`02-coding-standards.md`、`04-architecture.md`、`07-spec-management.md`
3. 若涉及阶段判断，读取本文档与 `docs/release/release-go-no-go.md`
4. 若涉及 Spec 或任务接续，先读取 `docs/superpowers/specs/SPECS.md`，确认 active / draft / superseded 状态与接管关系
5. 若涉及媒体合成，追加读取 `docs/superpowers/specs/client-media-composer/` 与对应 plan
6. 若涉及语音、录音、STT、回放，优先查 `docs/03_Development/Step3_Audio_Troubleshooting.md` 与相关 speech specs
7. 若涉及 CloudBase，先确认目标环境是 `local`、`dev` 还是 `prod`，不要硬编码 envId 或 bucket
8. 若涉及发布、审核或真机 smoke，先查 `docs/release/` 下对应 checklist，并把新证据回填
9. 若涉及 UI，先确认设计系统与现有主题 token，不绕过 `ThemedText` / `ThemedView` / 既有样式体系

---

## 常用验证命令

```bash
# Agent 技能路径校验
npm run validate-agent-skills

# App 发布配置校验
node MofunGenAI/scripts/verify-release-config.cjs

# App Store preflight
npm run preflight:app-store

# App 单元测试
npm --prefix MofunGenAI test -- <test-file>

# App lint
npm --prefix MofunGenAI run lint

# Pipeline 测试
npm --prefix pipeline test

# Pipeline typecheck
npm --prefix pipeline run typecheck

# 生成 App 环境文件
npm run sync-env -- --env dev
npm run sync-env -- --env prod

# 部署单个 CloudBase 函数
npm run deploy -- --env prod --fn <functionName>

# 初始化远程环境集合与配置
npm run init-env -- --env prod
```
