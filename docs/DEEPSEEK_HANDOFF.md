# DeepSeek Harness / V4P 接手指南

本文帮助新的 DeepSeek 会话在没有历史聊天记录的情况下安全接手 CodeVision Lab。它不依赖某个 Harness 的自动加载行为；即使工具不自动读取规则，也可以通过下面的启动提示显式加载。

## 一次性启动方式

从仓库根目录启动 Harness。第一条提示建议直接使用：

```text
你正在维护 CodeVision Lab。先不要修改文件。
请依次完整读取 AGENTS.md、README.md、docs/ROADMAP.md，运行 git status --short --branch，
然后根据我的任务再读取对应专项文档。先复述当前状态、任务范围、验收标准和预计修改文件；
发现未提交改动时必须保留并说明。没有得到明确要求时不要 push。
```

执行知识点补充时追加：

```text
这是内容任务。继续完整读取 docs/CONTENT_AUTHORING.md；若涉及算法，也读取
docs/ALGORITHM_CONTRIBUTING.md。每条技术结论、代码输出、复杂度和边界条件都要验证，
不要只根据记忆生成。完成后按 docs/QUALITY_CHECKLIST.md 验收。
```

执行 UI 或交互任务时追加：

```text
这是跨端 UI 任务。继续读取 docs/ENGINEERING_WORKFLOW.md、docs/QUALITY_CHECKLIST.md
和 src/styles/global.css。复用现有设计令牌，并检查 390px 手机、1024px 平板、桌面，
同时覆盖深浅主题、键盘焦点和中英文界面。
```

## 每次会话的五阶段流程

### 1. Bootstrap：建立事实

- 读取 `AGENTS.md` 与相关文档。
- 运行 `git status --short --branch`，识别当前分支与未提交修改。
- 查找现有实现、注册表、类型和相邻测试。
- 不引用旧聊天中的测试数字；从当前仓库重新确认。

### 2. Plan：把任务变成可验收清单

- 说明要解决的用户问题，而不是只列文件操作。
- 写明 in scope / out of scope。
- 列出需要修改的文件和不会修改的边界。
- 给每项写可观察的完成标准。
- 多阶段任务复制 `docs/templates/TASK_PLAN.md` 作为临时计划；不需要提交临时计划时，可在交接后删除它。

### 3. Implement：小步修改

- 先改 schema/底层契约，再改数据，再改 UI，最后补测试与文档。
- 每完成一个独立切片就运行最小相关测试，避免最后才发现大范围错误。
- 机械性批量工作可以分批，但每批必须经过注册表与内容不变量测试。
- 不改无关格式，不升级无关依赖，不重写用户已有修改。

### 4. Verify：证据优先

- 按 `docs/QUALITY_CHECKLIST.md` 选择测试矩阵。
- 内容任务除了编译通过，还需抽查代码输出、边界案例和三语言语义。
- UI 任务必须在真实浏览器看页面，不以静态代码检查代替视觉验收。
- 修复最后一处错误后，重新运行受影响的检查；不要沿用修复前结果。

### 5. Handoff：留下可继续工作的状态

- 运行最终 `git status --short --branch` 和 `git diff --check`。
- 使用 `docs/templates/HANDOFF_REPORT.md` 报告变更、验证、风险和下一步。
- 如果提交，记录 commit；如果推送，记录 Actions 与线上检查。
- 未完成事项必须写清阻塞原因与最短恢复路径，不能用“后续优化”含糊带过。

## 按任务类型加载上下文

| 任务 | 必读 | 建议参考 |
| --- | --- | --- |
| 新课程/知识点 | `CONTENT_AUTHORING.md` | 同语言相邻课程、`LessonDetailPage.tsx` |
| 新算法 | `ALGORITHM_CONTRIBUTING.md`、`CONTENT_AUTHORING.md` | 同类 Runner、Meta、测试与渲染器 |
| 修复算法正确性 | Runner、Meta、对应测试 | 内容准确性评审记录 |
| 调整页面/UI | `ENGINEERING_WORKFLOW.md`、`QUALITY_CHECKLIST.md` | `global.css`、现有 UI 组件、相关 E2E |
| 改进路线/练习 | `ROADMAP.md`、课程注册表 | 进度 store、课程页面 |
| 改部署 | workflow、Vite base、生产 smoke | README 部署说明 |

只加载当前任务需要的文件。不要一开始把整个 `src/` 塞进上下文；先通过 `rg` 找到入口，再沿 import 关系读取。

## V4P 工作分配建议

强推理模式优先用于：

- 课程事实核验与三语言语义对齐；
- 新 Runner、Step 序列和可视化协议设计；
- schema 迁移、状态迁移和跨页面重构；
- 测试失败的根因分析；
- 大批内容合并前的一致性复核。

可以机械批处理的工作包括：补齐格式、注册 import、统一字段和生成初稿。但批处理结果仍必须经过类型、测试和人工抽查，不能因为由模型批量生成就降低验收标准。

## 会话中断恢复

恢复时先执行：

```bash
git status --short --branch
git diff --stat
git diff --check
```

然后读取上一份交接报告（若有），逐项核对实际 diff。不要仅凭会话摘要判断哪些步骤已经完成；文件与测试结果才是事实来源。

## 禁止做法

- 不把一次提示中的“全部完成”理解为允许 force push、删分支或覆盖用户文件。
- 不在没有证据时声称某段代码可编译、某个算法正确或某次部署成功。
- 不通过隐藏英文内容里的中文来宣称完整国际化；当前限制应诚实记录。
- 不把计划中的账号、Docker 沙箱或云同步当成现有能力。
- 不在交接文档中记录 API key、token、Cookie 或本机密钥位置。

