# CodeVision Lab 代理工作规范

> 本文件是任何编码代理（包括 DeepSeek Harness / DeepSeek V4P）的首要入口，适用于整个仓库。
> 详细流程按任务类型继续读取 `docs/` 中对应文档。代码、`package.json` 与自动化测试的事实优先级高于历史说明。

## 1. 每次会话必须先做

1. 确认当前位置是仓库根目录，并运行 `git status --short --branch`。
2. 完整阅读本文件；再读 `README.md`、`docs/ROADMAP.md`，以及与任务相关的专项文档。
3. 检查现有未提交修改。它们默认属于用户，不覆盖、不回滚、不顺手格式化无关文件。
4. 对跨文件、内容批量或架构性任务，先写清目标、范围、验收标准和预计修改文件；小修复可直接实施。
5. 先定位现有实现和测试，再编辑。优先复用已有 schema、注册表、UI 组件、设计令牌和测试模式。

推荐启动提示词见 `docs/DEEPSEEK_HANDOFF.md`。

## 2. 当前项目事实

- 产品：CodeVision Lab / 编程视界，面向 C++、C#、Python 学习者的课程与算法可视化平台。
- 技术栈：React 19、TypeScript strict、Vite 8、Tailwind CSS 4、Zustand、Vitest、Playwright、Monaco、Pyodide。
- 包管理器：只使用 npm；不要引入 pnpm/yarn 锁文件。
- 远程仓库：`https://github.com/Entropicmaker/codevision-lab.git`
- 默认分支：`main`；推送到 `main` 会触发 GitHub Pages 自动部署。
- 线上地址：`https://lingeocs.com/codevision-lab/`
- 部署子路径：`/codevision-lab/`，不要把生产 base 改成 `/`。
- 数据边界：学习进度与设置仅保存在浏览器 localStorage；当前没有账号、数据库或云同步。
- 执行边界：Python 由 Pyodide Web Worker 真实执行；C++/C# 仅为明确标注的演示模式。

上次基线（2026-08-16）：27 个算法、24 个课程知识点、30 个单元测试文件、333 项单元测试。数字会随迭代变化，报告时必须以当次命令结果为准。

## 3. 常用命令

```bash
npm install          # 依赖确实变化时使用；CI 使用 npm ci
npm run dev          # http://127.0.0.1:5173
npm run typecheck    # TypeScript strict
npm run test         # Vitest 单元测试
npm run build        # 类型检查 + Vite 生产构建 + 404 回退页
npm run test:e2e     # Playwright：桌面、手机、平板规则
npm run test:all     # 单元 + E2E
```

首次运行 Playwright 若缺浏览器，再执行 `npx playwright install chromium`。不要为了修复代码随意升级依赖。

## 4. 目录责任边界

| 目录 | 责任 | 修改时优先阅读 |
| --- | --- | --- |
| `src/engine/` | Step 协议、Runner、播放控制、输入解析、代码行映射 | `docs/ALGORITHM_CONTRIBUTING.md` |
| `src/renderers/` | SVG/表格等状态渲染器 | `docs/DESIGN.md`、现有同类渲染器 |
| `src/content/algorithms/` | 算法教学元数据与三语言示例 | `docs/CONTENT_AUTHORING.md` |
| `src/content/lessons/` | 课程骨架与知识点 | `docs/CONTENT_AUTHORING.md` |
| `src/components/` | 可复用 UI、编辑器、面板、布局 | `docs/ENGINEERING_WORKFLOW.md` |
| `src/pages/` | 路由页面与页面编排 | `src/app/router.tsx` |
| `src/stores/` | 本地进度和设置持久化 | 现有 store 与迁移策略 |
| `src/i18n/` | 类型安全中英文界面词典 | `src/i18n/index.ts` |
| `e2e/` | 跨端与生产冒烟测试 | `playwright.config.ts` |
| `.github/workflows/` | 构建、Pages 部署、生产冒烟 | `docs/ENGINEERING_WORKFLOW.md` |

## 5. 不可破坏的工程契约

### 算法与播放

- Runner 必须是纯函数且确定性；禁止在 Runner 内使用 `Math.random()`、时间、网络或 DOM。
- 每一步必须是完整、互不共享可变对象的状态快照；后退是恢复快照，不是反向执行算法。
- `stepId` 必须等于数组下标，累计统计只能增加。
- Runner 发出的每个 `codeLineId` 必须存在于 C++、C#、Python 与伪代码的行映射中。
- 新算法必须同时补 Runner、Meta、两处注册和 Runner 单元测试。

### 教学内容

- 技术事实、复杂度、边界条件和示例输出必须可验证，不能凭模型记忆直接定稿。
- 不伪造“可运行”：Python 示例需语法有效；C++/C# 没有后端沙箱前始终称为演示模式。
- `LocalizedText` 必须同时提供 `zh` 与 `en`。当前课程 `concept` 与 `hints` schema 仍是中文字符串；不要让英文 UI 泄漏中文，完整双语化应作为单独 schema 迁移任务。
- 新知识点必须注册到 `lessonMetas`，并与 `lessonChapters` 中的语言、章节和先修关系一致。
- 新算法和知识点的细则见 `docs/CONTENT_AUTHORING.md` 与 `docs/ALGORITHM_CONTRIBUTING.md`。

### UI 与视觉

- 复用 `src/styles/global.css` 的语义色与工具类，不在组件中复制一套硬编码主题。
- 视觉方向：博客的深海自然色系 + 克制的复古未来科技点缀 + Apple 式清晰层级与材质。
- 最小支持宽度为 320px；不得出现页面级横向滚动。
- 粗指针设备交互目标至少 44px；键盘操作必须有可见焦点。
- 深色、浅色、中英文、减少动态效果都不能退化；弹窗/抽屉要管理焦点并恢复焦点。
- Monaco、Pyodide 等重资源继续按页面或交互懒加载。
- 博客是 LingeoCS 主站，CodeVision Lab 是系列子站；顶部、移动菜单和页脚的站群导航契约见 `docs/LINGEOCS_NETWORK.md`，不得把两者改成无层级的平级品牌。

### 安全与数据

- 不把 API key、token、`.env` 内容、Cookie、个人路径凭据或密钥写入仓库、日志和对话。
- 不执行破坏性 Git 操作，不 force push，不删除用户数据。
- 未经用户明确授权，不新增后端、数据库、账号、付费服务或遥测。
- 进度导入数据必须校验结构；不要把 localStorage 描述成云端保存。

## 6. 验证规则

最低要求按变更范围执行：

- 仅文档：`git diff --check`，人工检查命令、路径和链接。
- 课程/算法内容：`npm run typecheck && npm run test && npm run build`。
- Runner/协议/渲染器：上述三项 + 相关 Playwright 或完整 `npm run test:e2e`。
- UI/响应式/交互：上述三项 + 桌面/390px 手机/1024px 平板真实浏览器检查；核心流程需 E2E。
- 部署工作流：推送后等待 `build`、`deploy`、`production-smoke` 三个 job 全绿。

完整矩阵见 `docs/QUALITY_CHECKLIST.md`。禁止只写“应该通过”；报告必须列出实际执行的命令与结果。

## 7. Git 与交付

- 开始和结束都检查 `git status --short --branch`。
- 提交只包含本任务文件；提交信息使用清楚的 Conventional Commit，例如 `feat: 补充 Python 异常处理课程`。
- 除非用户明确要求，否则不要自行 push、建 PR、改远程或改 Pages 设置。
- 用户要求上传时：先完成验证，再提交并推送；不得使用 `--force`。
- push 到 `main` 后不等于完成：必须确认 GitHub Actions 和生产冒烟测试结果。
- 最终交付需说明：修改摘要、关键文件、验证结果、未解决风险、提交号与部署状态（如适用）。

计划与交接分别使用：

- `docs/templates/TASK_PLAN.md`
- `docs/templates/HANDOFF_REPORT.md`

## 8. 文档优先级

发生冲突时按以下顺序处理：

1. 用户当前明确要求；
2. 实际代码、类型和自动化测试；
3. 本 `AGENTS.md`；
4. 专项规范（`CONTENT_AUTHORING`、`ALGORITHM_CONTRIBUTING`、`QUALITY_CHECKLIST`）；
5. `README.md` 与 `ROADMAP.md`；
6. `DESIGN.md`、`REDESIGN_PLAN.md` 等历史设计记录。

发现文档与代码不一致时，在同一任务内修正文档，或在交接报告中明确记录，不要默默忽略。
