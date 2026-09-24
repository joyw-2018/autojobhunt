---
inclusion: manual
---

# Plan 执行指南

执行 Plan 任务时通过 `#05-plan-execution` 引用本文件。

---

## 执行 Plan 时的上下文需求

新会话执行 plan 时，agent 需要读取以下文件：

1. **Spec**: `docs/superpowers/specs/2026-04-28-dialogos-video-mofunshow-design.md`
2. **Plan**: 对应的 plan 文件
3. **Tech Landscape Review**: `docs/01_PRD/Tech_Landscape_Review_2026Q1.md`（技术决策背景）
4. **Legacy Migration Plan**: `docs/03_Development/Legacy_User_Migration_Plan_2026-04.md`（迁移相关任务时）

## Plan 执行顺序

| Plan | 内容 | 时间 | 前置依赖 |
|------|------|------|---------|
| Plan 1 | 内容 Pipeline | Week 1-2 开始 | 无 |
| Plan 2 | App 基础 + 核心学习流 | Week 1-4 | 无（与 Plan 1 并行） |
| Plan 3 | Elian 系统 | Week 5-6 | Plan 2 |
| Plan 4 | 配音作品 + 分享 | Week 5-6 | Plan 2 |
| Plan 5 | 变现 + 游戏化 + Push | Week 7-8 | Plan 2 |
| Plan 6 | 旧用户迁移 + 上线 | Week 9-10 | Plan 1-5 |

Plan 3-6 在 Plan 1-2 执行中期再制定。

## UX/UI 设计要求

在执行 App 相关 Plan 前，需要先完成对应页面的 UI 设计：
- 核心页面线框图
- 设计系统 token（颜色、字体、间距、圆角）
- 参考现有设计系统文档：`docs/03_Development/DesignSystem.md`

## 设计稿执行规则（必须遵守）

**每个 Task 开始前，如果 Plan 标注了设计稿路径，必须先读取 `code.html` 作为 UI 实现依据，再使用 `screen.png` 做整体视觉确认。**

具体要求：

1. **先读设计稿，再写代码** — 如果 Task 标注了设计稿路径，必须先读取对应文件夹中的 `code.html`（HTML 原型代码），从中提取精确的布局结构、CSS 色值、间距、字号，然后转换为 React Native StyleSheet。`screen.png` 截图仅用于整体视觉确认，**不要凭截图记忆还原**
2. **以设计稿代码为准** — 如果 Plan 文档中的代码片段与 `code.html` 冲突，以 `code.html` 为准。Plan 代码片段是功能骨架参考，不是最终 UI
3. **禁止占位样式** — 不允许先写功能再补 UI。每个组件第一次实现时就应该还原设计稿的视觉
4. **设计系统 token** — 使用设计稿中定义的色值、字体、间距，不使用随意的硬编码值。核心 token：
   - Primary Blue: `#3AADE0`
   - Gold: `#F5C518`
   - Dark Background: `#1A1A2E`
   - Card Background: `#252540`
   - 字体: Plus Jakarta Sans（标题）、Inter（正文）
   - 圆角: 12px
5. **模式区分** — 浏览页面用亮色模式，学习流页面用暗色沉浸模式

### code.html → React Native 转换规则（必须遵守）

从 `code.html` 转换为 React Native 时，必须逐项对照，不允许简化或替代：

1. **图标** — `code.html` 使用 `material-symbols-outlined`（如 `data-icon="home"`）。React Native 中必须使用 `@expo/vector-icons` 的 `MaterialIcons` 或 `MaterialCommunityIcons`，找到对应的图标名。**禁止用 emoji 替代图标**
2. **布局** — 逐层转换 HTML 的 flex 布局。注意：
   - `flex justify-between items-end` → `flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"`
   - 文本容器需要 `flex: 1` 防止被挤压
   - 固定宽度元素（如徽章）保持固定，不要让它们被 flex 压缩
3. **字体** — 严格对应 `code.html` 中的 class：
   - `font-headline` / `font-display` → `fontFamily: "PlusJakartaSans"` 系列
   - `font-body` / `font-label` → `fontFamily: "Inter"` 系列
   - `text-2xl` → `fontSize: 24`，`text-xl` → `fontSize: 20`，`text-lg` → `fontSize: 18`，`text-sm` → `fontSize: 14`，`text-xs` → `fontSize: 12`，`text-[10px]` → `fontSize: 10`，`text-[9px]` → `fontSize: 9`
   - `font-bold` → `fontWeight: "700"`，`font-black` → `fontWeight: "900"`，`font-semibold` → `fontWeight: "600"`，`font-medium` → `fontWeight: "500"`
4. **间距** — Tailwind 间距直接转换：`p-4` → `padding: 16`，`px-3` → `paddingHorizontal: 12`，`gap-3` → `gap: 12`，`mt-2` → `marginTop: 8`（1 单位 = 4px）
5. **圆角** — `rounded-xl` → `borderRadius: 12`，`rounded-lg` → `borderRadius: 8`，`rounded-full` → `borderRadius: 9999`，`rounded-md` → `borderRadius: 6`
6. **图片** — `code.html` 中的 `<img>` 使用 `data-alt` 描述图片内容。React Native 中使用占位 View + 首字母文本，或使用 `expo-image` 加载远程图片

**设计稿位置**: `docs/03_Development/ui-designs/stitch/`
每个文件夹包含 `screen.png`（截图）和 `code.html`（HTML 原型可浏览器打开参考）。

## Plan 进度记录

项目的持久进度文档由 `.kiro/steering/07-spec-management.md` 确定。执行期间按所用 Superpowers 流程选择记录方式，不能同时维护两套活动进度。

### Inline `superpowers:executing-plans`

- 每个步骤验证通过后，立即将当前权威进度文档中的 `[ ]` 更新为 `[x]`。
- 跳过步骤必须获得用户明确同意，并更新为 `[~]`，同时在该项内注明原因。

### `superpowers:subagent-driven-development`

1. 执行期间以该计划独立 workspace 中的 `progress.md` ledger 为唯一执行进度源，不逐任务修改计划复选框。
2. Todo、聊天记录和阶段性汇报不作为权威进度源。
3. 计划中的任务均已完成或经用户同意跳过后、最终全分支审查前，根据 ledger 一次性把已验证任务同步到项目的持久进度文档；只同步 ledger 能直接证明的状态。
4. 被跳过的任务仍须获得用户明确同意，在 ledger 中记录理由，并在最终同步时写入 `[~]` 和原因。
5. 若执行中断但预计继续，保留 ledger，不提前回写未完成状态。

## 文档导航

### 开发者常用

- `/docs/README.md` — 文档主入口
- `/docs/01_PRD/MLP_PRD_Index.md` — PRD 导航
- `/docs/02_Technical_Design/Technical_Architecture_v2.0.md` — 系统架构（3000 行）
- `/docs/02_Technical_Design/Learning_Flow_Layer_Design.md` — 4 步学习流实现
- `/docs/03_Development/Development_Plan_8_Weeks.md` — 8 周开发计划
- `/docs/03_Development/DesignSystem.md` — 设计系统（英文）
- `/docs/03_Development/DesignSystem_CN.md` — 设计系统（中文，含品牌解读）

### 产品经理常用

- `/docs/01_PRD/MLP_PRD_Executive_Summary.md` — 商业模式与战略定位
- `/docs/01_PRD/MLP_PRD_Product_Specification.md` — 功能规格
- `/docs/04_Business/Cost_Budget_Analysis.md` — 成本分析与 ROI 预测

### 文档结构

```
/docs/
├── 01_PRD/                    # 产品需求（8 个模块）
├── 02_Technical_Design/       # 技术设计
├── 03_Development/            # 开发管理
├── 04_Business/               # 商业与成本分析
├── 05_Archive/                # 历史版本与反馈
└── 06_Reports/                # 项目完成报告
```
