# 发布 Build 记录规范

## 目标

每一次面向 TestFlight、App Store Connect、应用宝或其它 Android 市场的正式构建，都必须留下可追溯记录。记录要回答三个问题：

1. 这个 build 是哪个版本号和构建号？
2. 这个 build 对应哪些 git commit / 本地改动？
3. 这个 build 是否已经上传到对应平台，以及验证证据是什么？

聊天记录、EAS 页面、应用市场后台都不能作为唯一来源；仓库内 `docs/release/` 必须有持久记录。

## 记录位置

- 汇总索引：`docs/release/build-ledger.md`
- 单 build 详情：`docs/release/builds/YYYY-MM-DD-<platform>-<version>-<build>.md`

示例：

```text
docs/release/builds/2026-07-06-ios-12.0.1-120016.md
docs/release/builds/2026-07-09-android-12.0.1-120009.md
```

## 适用范围

必须记录：

- iOS EAS production build
- iOS App Store Connect / TestFlight submit
- Android release APK / AAB
- 应用宝、华为、小米等 Android 市场上传候选包

不要求记录：

- 本地 debug build
- 模拟器验证 build
- 未准备分发的临时开发包

## 必填字段

每个 build 详情必须包含：

- 平台：`ios` / `android`
- 渠道：`testflight` / `app-store-connect` / `yingyongbao` / `android-market`
- App 版本：如 `12.0.1`
- 构建号：iOS `buildNumber` 或 Android `versionCode`
- 构建产物：EAS build id、IPA URL、APK 路径或 SHA-256
- 上传记录：EAS submission id、App Store Connect App ID、市场后台包 id 或上传状态
- Git 证据：
  - `git rev-parse HEAD` 或 EAS `gitCommitHash`
  - 从上一个已记录 build 到当前 build 的 `git log --oneline`
  - 构建时是否存在 dirty worktree
  - 如果 dirty，必须记录 `git status --short` 和 `git diff --stat`
- 验证证据：
  - release config 校验
  - targeted tests
  - preflight / apksigner / aapt 等平台相关校验
- 结论状态：`built` / `submitted` / `processing` / `available` / `rejected` / `superseded`

## Git 规则

正式分发 build 默认要求工作区干净。若因紧急原因使用 dirty worktree 构建，记录中必须显式标注：

```text
Dirty worktree: yes
Reason: ...
Included diff: ...
```

不能只写“包含本地改动”，必须说明改动范围和风险。

## 回填规则

历史记录可以回填，但必须区分证据等级：

- `complete`：有 build id、submission id、commit、产物 URL、验证命令。
- `partial`：有 build / submission 记录，但缺少完整 commit range 或验证证据。
- `best-effort`：只能从聊天、后台截图或零散日志推断。

回填记录不能伪装成当时实时记录。必须在详情页写明：

```text
Record type: backfilled
Evidence quality: partial
Known gaps: ...
```

## 发布流程要求

每次 iOS / Android 发布任务完成前，必须：

1. 更新 `docs/release/build-ledger.md`。
2. 新增或更新对应的 `docs/release/builds/*.md`。
3. 在最终回复中给出 build record 路径。

如果 build 或 submit 失败，也应记录失败记录，状态写为 `failed`，并保留失败证据和下一步处理。
