# 语言规范与 Git 规范

本文件定义所有 agent 和开发者在本项目中必须遵守的语言和 Git 规范。

---

## 语言规范（必须遵守）

| 场景 | 语言 | 示例 |
|------|------|------|
| 与用户交流 | **中文** | "这个功能已完成" |
| 代码注释 | **中文** | `// 检查用户配额` |
| 文档编写 | **中文** | README、说明文档、spec、plan |
| 前端界面（UI 文本） | **中文** | 按钮"开始学习"、标签"首页"、提示"加载中…" |
| 前端界面（学习内容） | **英文** | 场景标题、台词、练习指令、评分反馈 |
| 变量/函数名 | **英文** | `calculateScore`, `fetchScenes` |
| 前端日志 | **英文** | `console.log('Quota check failed')` |
| Git commit | **英文** | `feat: add new feature` |

### 常见违规

- ❌ 用英文回复用户 → ✅ 必须用中文
- ❌ 代码注释用英文 → ✅ `// 计算预期进球`
- ❌ Git commit 用中文 → ✅ `fix: correct calculation`
- ❌ UI 文本用英文（如按钮"Start"） → ✅ 用中文（如"开始学习"）
- ❌ 学习内容用中文（如场景标题翻译） → ✅ 保留英文原文

---

## Git 规范

### 分支命名

```
feature/<name>     # 新功能
fix/<name>         # Bug 修复
hotfix/<name>      # 紧急修复
chore/<name>       # 维护任务
```

### Commit 格式（Conventional Commits）

```
type(scope): subject

# type: feat, fix, docs, refactor, chore, test, perf, style
# scope: pipeline, app, elian, payment, gamification, migration
```

示例：
```
feat(pipeline): add quality scorer with 7 dimensions
fix(app): resolve audio track sync issue on Android
docs(spec): update dialogos video design spec
```

### 合并策略

#### 协作 / PR 流

- 默认通过 PR 合并到 `main`
- 对短生命周期、单一主题 feature 分支，优先 Squash & Merge
- 每个 feature 分支在 `main` 上对应 1 个清晰 checkpoint commit

#### 单人简化流

当项目处于单人独立开发、无需 PR 审核时，可以使用本地简化流：

- 可以直接在本地将开发分支合并到 `main`
- 如果开发分支包含多阶段、有语义价值的提交历史，优先使用 fast-forward 或普通 merge 保留历史
- 如果开发分支只是细碎 WIP，且历史没有排障价值，可以 squash 后合入 `main`
- 合并前必须确认工作区干净，并完成与改动范围匹配的测试或手工验证
- 合并后删除已经被 `main` 包含的临时分支，避免分支语义过期
- 从既有长期分支临时切出 plan 分支时，完成后应先合回原长期分支，再由长期分支合入 `main`

### 语义化版本

```bash
git tag v<MAJOR>.<MINOR>.<PATCH> -m "description"
```

- MAJOR: 破坏性变更（如 v1 → v2 全面重设计）
- MINOR: 新功能（如 v1.0 → v1.1 添加 Learning Flow Layer）
- PATCH: Bug 修复（如 v1.1.0 → v1.1.1）
