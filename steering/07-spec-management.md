---
inclusion: always
---

# Spec 生命周期管理规范

## 文档形态

每个 Feature Spec 必须登记在 `docs/superpowers/specs/SPECS.md`，但文件形态可以按实际规模选择。当前仓库同时接纳以下两种模式：

### 模式 A：三件套 Spec

适用于长期基础设施、跨模块系统、需要稳定需求 / 设计 / 任务分层维护的功能。

目录位于 `docs/superpowers/specs/<feature-name>/`：

| 文件 | 内容 | 何时更新 |
|------|------|----------|
| `requirements.md` | 当前权威需求 | 每次需求迭代 |
| `design.md` | 当前权威设计 | 每次设计迭代 |
| `tasks.md` | 当前迭代任务，含完成状态 `[ ]` / `[x]` / `[~]` | 按执行模式更新 |

### 模式 B：单文件 Spec + Implementation Plan

适用于 superpowers 系列 skill 当前常见产物：先生成一个权威 Spec 文档，再生成一个 implementation plan 文档。

| 文件 | 内容 | 何时更新 |
|------|------|----------|
| `docs/superpowers/specs/<date-or-feature>-<name>-design.md` | 当前权威需求、设计、边界、验收口径 | 需求或设计发生变化时 |
| `docs/superpowers/plans/<date-or-feature>-<name>.md` | 当前实施拆解、步骤、验证命令、完成状态 | 按执行模式更新 |

单文件 Spec 不是二等公民；只要已登记到 `SPECS.md`，其权威性与三件套 Spec 等同。无需为了满足旧模板而把窄范围 Spec 强行拆成 `requirements.md` / `design.md` / `tasks.md`。

### 形态选择原则

- 新 Spec 默认选择最贴近实际输出与维护成本的形态
- 窄范围 UI、文案、数据展示、局部体验改动可以使用单文件 Spec
- 跨模块架构、长期平台能力、复杂状态机、支付 / 权限 / 媒体等高风险系统优先使用三件套 Spec
- 单文件 Spec 后续范围扩大时，可以迁移为三件套；迁移必须在 `SPECS.md` 备注中说明
- 已存在的单文件 Spec 和三件套 Spec 都保持有效，不要求为了统一形态做机械迁移

## 全局索引 SPECS.md

`docs/superpowers/specs/SPECS.md` 是状态与接管关系的**唯一权威来源**。

- 新建 Spec → 在 SPECS.md 追加一行
- Spec 状态变更 → 更新 SPECS.md 对应行
- Spec 文件形态变化 → 更新 SPECS.md 的路径或备注
- 不删除条目（`superseded` / `archived` 也保留）

Status 枚举：`active` | `superseded` | `archived` | `draft`

## 核心规则

### 规则 1：修订记录必须说明 WHY，不只写 WHAT

Spec 文档顶部的 `> **修订记录**：` 是轻量的决策日志。三件套模式下通常写在 `requirements.md` 和 `design.md`；单文件模式下写在该 Spec 文档顶部。每次迭代更新时，用一句话说明**为什么**做这个变更，不只列出变更了什么。

```markdown
<!-- ❌ 只有 WHAT -->
> - v1.1 — 新增 Requirement 7（Free Tier 文字配额模型）

<!-- ✅ WHAT + WHY -->
> - v1.1 — 新增 Req 7（Free Tier 配额）——careers-redesign 接入后发现免费用户无使用路径，影响转化
```

这一句话记录在文档里，保证"为什么这样改"和"改了什么"始终同处一地。

### 规则 2：新 Spec 必须在 SPECS.md 中声明接管关系

若新 Spec 覆盖或替代现有 Spec 的部分或全部内容：
1. 在 SPECS.md 新条目的"接管/被接管关系"列注明接管了哪个 Spec 的哪些部分
2. 将被接管 Spec 的状态更新为 `superseded`
3. 若仅部分接管，在备注列明"X Spec 的 Y 部分仍然有效"

不在 SPECS.md 中声明 = 不存在接管关系。没有隐性覆盖。

### 规则 3：区分持久进度源与执行期进度源

项目的持久进度只允许有一个当前权威源，避免 `tasks.md`、implementation plan 和聊天记录各写一套状态。

| 文档形态 | 当前权威进度文档 |
|----------|----------------|
| 三件套 Spec | `docs/superpowers/specs/<feature-name>/tasks.md` |
| 单文件 Spec + Implementation Plan | `docs/superpowers/plans/<date-or-feature>-<name>.md` |

复选框状态统一为：

- `[ ]`：未完成
- `[x]`：已验证完成
- `[~]`：经用户明确同意跳过，并在同一项注明原因

执行方式决定何时写入当前权威进度文档：

#### Inline `superpowers:executing-plans`

- 每个步骤验证通过后，立即将 `[ ]` 更新为 `[x]`，不等迭代结束统一补。
- 跳过步骤时，先获得用户明确同意，再写入 `[~]` 和原因。

#### `superpowers:subagent-driven-development`

- SDD 执行期间，以该计划独立 workspace 中的 `progress.md` ledger 作为唯一执行进度源，不逐任务修改当前权威进度文档的复选框。
- Todo、聊天记录、阶段性汇报和 commit message 都不能替代 ledger。
- 计划中的任务均已完成或经用户同意跳过后、最终全分支审查前，根据 ledger 一次性将已验证任务同步到当前权威进度文档；只同步 ledger 能直接证明的状态。
- 跳过任务必须获得用户明确同意，在 ledger 中记录理由，并在最终同步时写入 `[~]` 和原因。
- 执行中断但预计继续时保留 ledger，不提前回写未完成状态。

无论采用哪种执行方式：

- 每个子任务应尽量引用对应需求编号；单文件 Spec 无编号时，引用章节标题、验收项或明确的 Spec 段落
- 跨迭代开始新计划前，确保上一轮任务状态已同步到对应进度源
- 若 implementation plan 执行中发现需求或设计需要改变，先回写 Spec 修订记录，再继续改计划或代码
- 不把聊天记录、commit message 或 PR 描述当作 Spec 进度源

### 规则 4：不一致必须显式化

当两个 Spec 之间存在矛盾，不得静默忽略：
1. 在修订记录中一句话说明该矛盾及解决方式
2. 在 SPECS.md 对应条目的备注列注明
3. 若矛盾涉及接管关系，按规则 2 处理

## 模型读取多个相关 Spec 时的优先级

1. 先查 `SPECS.md`，确认哪些 Spec 为 `active`
2. 以 `active` Spec 的权威文档为实现依据：
   - 三件套模式：读取 `requirements.md` / `design.md`
   - 单文件模式：读取对应 `*-design.md` 或 SPECS.md 指向的 Spec 文件
3. 执行实现时，再读取对应的 `tasks.md` 或 `docs/superpowers/plans/*.md`
4. `superseded` Spec 仅供理解历史决策背景，不作为实现依据
5. 若 SPECS.md 无对应条目，默认视为 `active`（旧 Spec 兼容规则），但应尽快补登记

## 跨 Spec 依赖声明

若 Spec A 依赖 Spec B 的 API 或组件，应在权威 Spec 文档开头声明**跨 Spec 依赖**：

- 三件套模式：写在 `requirements.md`
- 单文件模式：写在该 Spec 文件

```markdown
## 跨 Spec 依赖

| 依赖 Spec | 说明 |
|-----------|------|
| `subscription-system` | 提供 `canAccess()` / `requireAccess()` / `PaywallDialog` |
```

这使 Spec B 变更时，维护者可快速识别受影响的下游 Spec。
