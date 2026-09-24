# AutoJobHunt & Resume Tailor (Solo Career Copilot)

专为你个人打造的私有化 AI 求职与智能简历定制系统。通过沉淀你的 5~6 份过往历史简历，构建个人唯一的原子级“真实事实资产库 (Source of Truth Fact Base)”，支持人工深度润色与锁定，杜绝 AI 改简历时的虚构编造，并实现针对目标岗位 (JD) 的批量自动化裁切与 Google Docs 排版输出。

---

## 快速启动 (One-Click Start)

### 方式一：双击启动 (Windows)
直接双击根目录下的 [`start.bat`](start.bat)，脚本将自动：
1. 启动 FastAPI 后端服务（运行于 `http://localhost:8000`）；
2. 启动 Vite 前端工作台（运行于 `http://localhost:5173`）；
3. 自动在浏览器中打开前端界面。

### 方式二：命令行手动启动
**后端**：
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

**前端**：
```bash
cd frontend
npm run dev
```

---

## 配置大模型 API Key (可选)

系统在未配置 API Key 时已内置智能模拟引擎，可直接体验全部前端交互、事实编辑、锁定与分类功能。

若要开启真实的 Google Gemini 或 OpenAI 强力抽取与润色：
1. 打开 `backend/.env`；
2. 填入你的 API Key：
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   （或使用 OpenAI: `LLM_PROVIDER=openai` 与 `OPENAI_API_KEY=...`）

---

## 项目工程架构

```text
autojobhunt/
├── backend/                  # FastAPI 后端服务
│   ├── app/
│   │   ├── api/              # API 路由 (/api/resumes, /api/facts, /api/stats)
│   │   ├── services/         # 文档解析、LLM 客户端、事实抽取引擎、本地存储
│   │   ├── models/           # Pydantic 数据实体
│   │   └── main.py           # FastAPI 入口
│   ├── venv/                 # Python 3.11 独立虚拟环境
│   └── test_api.py           # 自动化测试脚本
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/       # 事实卡片、工作台、多简历上传、预览组件
│   │   ├── api/client.ts     # 前端 API 请求封装
│   │   └── types/            # 数据类型定义
├── data/
│   ├── resumes/              # 存放你上传的 5~6 份历史简历 (PDF / Docx / TXT)
│   └── fact_base.json        # 你的私有唯一真实事实资产库 (JSON 本地持久化)
├── PRD.md                    # 完整产品需求文档 (v1.1.0)
└── start.bat                 # 一键启动脚本
```

---

## 核心功能特性

### Phase 1: 个人履历真实事实资产库 (Fact Base)
1. **多简历批量导入**：支持同时上传多份 PDF、DOCX、TXT 简历。
2. **原子事实块提取 (STAR / X-Y-Z 模式)**：提取公司、职位、时间、业务场景、行动、指标、技术栈标签。
3. **人工深度润色与内联编辑**：卡片上支持点击即改、修改量化指标、补充真实细节。
4. **一键事实锁定 (Lock)**：锁定满意的句子，防止后续 AI 擅自篡改。
5. **多版本变体切换**：随时查看与采用“标准版”、“指标量化版”、“架构深度版”。
6. **多维分类与实时筛选**：支持按职能分类、技术栈标签、公司及锁定状态即时过滤。

### Phase 2: 目标岗位 (JD) 智能匹配、双模态简历生成与 Google Docs 一键填入
1. **公开职位链接一键抓取 (URL Scraper)**：输入任意公开招聘链接（如 Greenhouse、Lever、Google Careers 等），自动爬取并解析职责与技能要求。
2. **事实库精准语义匹配与 ATS 评分**：严格基于已验证的事实库，自动挑选匹配度最高的经历与量化成就，杜绝虚构编造。
3. **1 页精简版 (9 Bullets) vs 2 页完整详细版 (17 Bullets) 即时切换**：
   - **严格 1 页版**：标准纸张排版，精炼呈现 6 家公司历程与 9 条核心成就。
   - **2 页完整详细版**：双 Sheet 物理分页，包含 GCP 完整 7 项旗舰成就、历任 5 家公司 10 项成果、顶会演讲、侧边项目与学历。
4. **打印与 PDF 原生分页**：支持浏览器物理分页打印，文字不跨页截断。
5. **自动填入 Google Docs (OAuth 2.0 官方直连)**：使用用户自己的 Google 账号权限，自动在个人 Google Drive 根目录创建排版美观的原生 Google Docs，并自动新标签页直达。
