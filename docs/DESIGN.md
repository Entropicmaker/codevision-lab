# CodeVision Lab（编程视界）产品设计与技术实施方案 v1.0

> **历史设计记录**：本文保存项目初版架构决策，包含部分已经过时的版本号、路径和 MVP 数量。
> 当前事实与操作规范以根目录 `AGENTS.md`、`README.md`、`docs/ROADMAP.md` 及实际代码/测试为准。

> 本文档为第 1 步交付物：需求理解、信息架构、页面清单、技术架构、数据结构设计、
> 项目目录、MVP 范围、后续迭代计划、主要技术风险。
> 确认后按此方案实施，实施过程中如需变更将先更新本文件。

---

## 0. 环境与交付说明

- 项目根目录：`/Users/linzii/AC/Deepseek/编程学习工具`（当前为空目录，package.json 直接建在根下）。
- 工具链：Node v24.14.0、npm 11.9.0、git 2.50.1，满足 Vite 7 + React + TypeScript 要求，统一使用 npm。
- 截图：工作目录中未发现图片文件。路线图信息架构以需求消息中完整枚举的内容为准
  （数组/基础数据结构/链表/二叉树/高级数据结构/其他算法 + 补充算法清单）；
  若后续补充截图，按截图逐一核对节点与层级后再调整 `content/roadmap` 数据。

---

## 1. 需求理解

### 1.1 产品定位

CodeVision Lab 是面向编程初学者与进阶学习者的「交互式编程与算法可视化学习平台」，
界面语言默认简体中文，预留中英文国际化。核心不是静态文档站，而是：
**每个知识点 / 每个算法都是一段可单步、可回放、可改数据、与代码行严格同步的“可执行演示”。**

### 1.2 目标用户与场景

| 用户 | 场景 |
|---|---|
| 编程初学者 | 按技能树学习三语言基础语法，边看变量变化边理解代码 |
| 进阶学习者 | 用可视化理解指针/引用/递归/DP/图算法等抽象概念 |
| 面试备考者 | 改输入、看步骤、看复杂度与操作统计，验证算法细节 |

### 1.3 四条核心设计原则

1. **数据驱动**：教学内容与算法全部是数据（meta + 步骤序列），UI 是「通用播放器 + 渲染器组合」，
   不为每个算法重复编写页面。
2. **一步一快照**：每个执行步骤是不可变状态快照；单步后退 = 恢复上一快照，
   **绝不通过反向执行算法实现**，保证正确性与确定性。
3. **统一协议**：语言课程的知识点演示与算法可视化共用同一套 Step Schema、渲染器注册表、播放控制器。
4. **诚实边界**：不在浏览器伪装“真实编译”。
   - Python：在线实验室用 Pyodide（Web Worker）真实执行；
   - C++ / C#：MVP 阶段用确定性步骤模拟器完成可视化，UI 明确标注“示例演示模式”；
   - 真实编译运行只允许走后端 Docker 沙箱（CPU/内存/时间限制、seccomp、禁网、禁危险系统调用）。

### 1.4 明确不做的事（MVP 阶段）

- 不做用户账号系统（进度存 localStorage）；
- 不做真实 C++/C# 在线编译（无后端沙箱前不宣称支持）；
- 不做所有课程内容（课程树骨架 + 首批代表性知识点，内容按迭代计划填充）；
- 不复制任何第三方网站的品牌、Logo、文案与视觉资产，仅参考路线图信息架构。

---

## 2. 信息架构

```
CodeVision Lab
├── 首页（入口与继续学习）
├── 学习路线（技能树：算法 + 三语言课程融合路线图）
├── 语言教程（C++ / C# / Python 三棵课程树）
│   └── 章节 → 知识点 → 统一教学页
├── 数据结构（按结构类型浏览：数组/链表/栈/队列/哈希/树/堆/图）
├── 算法可视化（按分类浏览：排序/搜索/双指针/滑动窗口/分治/DP/图/回溯/贪心…）
├── 在线实验室（Python 真实运行；C++/C# 演示模式）
├── 练习题（每知识点/算法配套小练习 + 参考答案）
└── 学习进度（总览、继续学习、收藏）
```

两大内容域共用一套底层能力：

- **语言课程树**：语言 → 章节 → 知识点（层级导航，支持折叠/搜索/难度筛选/已学状态/收藏/前置提示）。
- **算法技能树**：可缩放、可拖动的图；节点间前置依赖连线；绿/黄/红区分难度；
  点击节点进入对应算法实验室。

全局持久化状态：学习进度、收藏、主题、语言、代码语言偏好、播放速度等（localStorage）。

---

## 3. 页面清单（路由表）

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 HomePage | Hero、三语言入口卡片、热门算法、继续学习、路线图入口 |
| `/roadmap` | 学习路线图 RoadmapPage | 可拖拽/缩放/适应画布/搜索/难度筛选的技能树 |
| `/learn` | 语言教程总览 LessonsPage | 三语言课程树总览与进度 |
| `/learn/:lang` | 语言课程树 LessonTreePage | 章节 → 知识点层级导航（左栏） |
| `/learn/:lang/:lessonId` | 统一教学页 LessonDetailPage | 多面板：概念/编辑器/可视化/状态区/控制栏 |
| `/algorithms` | 算法库 AlgorithmsPage | 分类浏览 + 搜索 + 难度筛选 + 进度标记 |
| `/algorithms/:algorithmId` | 算法实验室 AlgorithmPlaygroundPage | 多面板可视化实验室（核心页面） |
| `/lab` | 在线实验室 LabPage | Python（Pyodide Worker）；C++/C# 演示模式 |
| `/exercises` | 练习题 ExercisesPage | 按知识点/算法聚合的小练习 |
| `/progress` | 学习进度 ProgressPage | 总览、完成度、收藏、最近学习 |
| `*` | 404 + ErrorBoundary | 空状态与错误兜底 |

### 3.1 算法实验室页面布局（核心）

```
┌────────────────────────── TopNav ──────────────────────────┐
├ LeftSidebar ┬────────────── Main 主教学区 ──────────┬ Right │
│ 算法分类树   │ 知识点说明 / 伪代码 / 复杂度 / 常见错误 │ 变量表  │
│ 折叠/搜索    │ ┌────────── Monaco 编辑器 ──────────┐ │ 容器状态│
│ 难度筛选     │ │ 三语言切换 · 当前行高亮 · 行号映射 │ │ 指针/引用│
│ 已学/收藏    │ └───────────────────────────────────┘ │ 调用栈  │
│ 前置提示     │ ┌──── 可视化画布（SVG/Canvas）───────┐ │ 输入/输出│
│             │ │ 数据快照 · 指针 · 高亮 · 结构状态   │ │ 错误信息│
│             │ └───────────────────────────────────┘ │ 操作统计│
│             │ 当前步骤中文说明 + 复杂度卡片           │ 复杂度  │
├──────────────┴────────── BottomControlBar ────────────────┤
│ 开始 暂停 上一步 下一步 重新开始 跳到开头 跳到结尾 速度 自动播放 │
│ 随机数据 自定义输入 导入案例 保存进度 · 快捷键帮助              │
└───────────────────────────────────────────────────────────┘
```

- 桌面（≥lg）：完整三栏 + 底栏；
- 平板（md–lg）：左栏可折叠，右侧状态区可折叠为抽屉；
- 手机（<md）：主区改为标签页 `[说明 | 代码 | 动画 | 状态]`，控制栏吸底。

---

## 4. 技术架构

### 4.1 技术选型

| 层 | 选型 |
|---|---|
| 框架 | React 18 + TypeScript（strict） |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS v4（CSS 变量主题：深色默认 + 浅色） |
| 路由 | React Router v7（BrowserRouter，支持刷新直达） |
| 状态 | Zustand（persist 中间件持久化进度/设置） |
| 编辑器 | Monaco Editor（@monaco-editor/react，懒加载 + 独立 worker） |
| 可视化 | SVG 优先（自研渲染器），大规模图降级 Canvas；Framer Motion 仅用于面板过渡/步骤过渡 |
| 测试 | Vitest + Testing Library（单元/组件），Playwright（E2E） |
| 运行 | Pyodide（实验室，Web Worker，按需加载） |
| i18n | 自研轻量类型安全词典模块（zh-CN 默认 / en-US 预留） |

依赖全部写入 package.json；核心动画不依赖第三方黑盒库，自研统一 Visualization Engine。

### 4.2 分层架构

```
┌───────────────────────────────────────────────┐
│ UI 层   pages / components / layout           │
├───────────────────────────────────────────────┤
│ 状态层  Zustand：progressStore / settingsStore │
│         播放态由 PlaybackController(useSyncExtStore) 管理 │
├───────────────────────────────────────────────┤
│ 渲染层  Renderer Registry（array/tree/graph/…）│
│         VizCanvas（SVG/Canvas 自适应容器）     │
├───────────────────────────────────────────────┤
│ 引擎层  Step Protocol / AlgorithmRunner        │
│         PlaybackController（播放/暂停/前后退/速度/重置）│
│         CodeMap（codeLineId → 三语言行号）     │
├───────────────────────────────────────────────┤
│ 内容层  Lesson Schema / Algorithm Schema       │
│         Roadmap 图数据 / 三语言示例源码模板    │
├───────────────────────────────────────────────┤
│ 平台层  router / i18n / theme / storage / 错误边界 │
└───────────────────────────────────────────────┘
```

### 4.3 核心数据流（算法实验室）

```
用户输入(自定义/随机/预设/URL 分享)
  → InputParser + Validator（校验失败 → 错误信息，不进入运行）
  → AlgorithmRunner(纯函数、确定性) → AlgorithmStep[]（不可变快照序列）
  → PlaybackController（index / speed / status）
  → 订阅方同时更新：
      Monaco 高亮（CodeMap 映射当前 codeLineId）
      可视化画布（渲染器按快照 + 元素状态上色）
      右侧状态区（变量表/容器/指针/调用栈/输入输出/统计）
      底部控制栏（进度条/按钮可用态）
  → 完成时 progressStore 记录完成 + 最近输入
```

### 4.4 关键机制设计

- **PlaybackController**：状态机 `idle → playing ⇄ paused → finished`；
  rAF 驱动的节拍器（每秒 N 步），速度 0.25x–4x；任何组件卸载/重置/变速时取消旧节拍器；
  React 严格模式双调用下无副作用泄漏。
- **前进/后退**：前进应用 `steps[i+1]`，后退恢复 `steps[i-1]`（快照恢复，绝不反向执行）。
- **代码行同步**：Runner 发出的每个 step 携带 `codeLineId`（逻辑行 id，与语言无关）；
  每种语言源码维护 `codeLineId → 行号` 映射（源码内以 `//>id` 注释标记，测试保证三语言映射一致）。
- **语言切换**：只切换 Monaco 文本 + 行号映射 + 高亮行，步骤序列不变。
- **输入校验**：每类输入有 InputSpec（类型/范围/约束/边界），非法输入给出中文错误提示与修复建议。
- **持久化**：zustand persist → localStorage，带版本号与 migrate；刷新后进度/主题/语言/速度恢复。
- **分享**：MVP 内输入数据编码进 URL query（`?input=...&lang=cpp`），可复制链接/书签恢复；
  导出 JSON 案例文件列入 Phase 2。
- **键盘快捷键**：`Space` 播放/暂停、`←/→` 上/下一步、`R` 重置、`Home/End` 跳首/尾、
  `S` 随机数据、`[`/`]` 减速/加速、`?` 显示快捷键帮助。

---

## 5. 数据结构设计（统一协议）

### 5.1 Step Schema（统一步骤协议）

```ts
type ElementState =
  | 'idle'       // 灰：未访问/默认
  | 'active'     // 蓝：当前访问/当前节点
  | 'comparing'  // 黄：正在比较/候选
  | 'updated'    // 绿：已更新/已交换/已访问/已完成
  | 'invalid'    // 红：冲突/错误/无效路径/越界
  | 'call';      // 紫：函数调用/递归关系

interface PointerState { name: string; target: string; note?: LocalizedText }

interface CallFrame {
  id: string; function: string; args: Record<string, Primitive>;
  locals: Record<string, Primitive>; returnValue?: Primitive;
  color: 'purple' | 'blue'; depth: number;
}

interface OpStats { comparisons: number; swaps: number; accesses: number; writes: number }

interface AlgorithmStep {
  stepId: number;                       // 从 0 开始的序号
  codeLineId: string | null;            // 当前逻辑代码行（跨语言共享）
  operation: string;                    // compare/swap/assign/push/pop/enqueue/dequeue/visit/backtrack/return…
  elements: Record<string, ElementState>;   // 元素 id → 状态（驱动统一配色）
  variables: Record<string, Primitive>;     // 变量表快照
  containers: Record<string, unknown[]>;    // 数组/字符串/矩阵等容器快照
  structures?: StructureSnapshot[];         // 栈/队列/树/图等结构快照（树/图存节点+边+状态）
  pointers: PointerState[];                 // 指针/索引位置
  callStack: CallFrame[];                   // 调用栈（递归层数 = depth 最大值）
  output: string[];                         // 标准输出
  explanation: LocalizedText;               // 本步中文/英文说明
  stats: OpStats;                           // 累计操作统计
}
```

**颜色语义统一映射**：蓝=当前访问，黄=正在比较，绿=已完成/已访问，红=冲突/错误/无效路径，紫=函数调用/递归，灰=未访问。

### 5.2 Algorithm Schema（算法元数据）

```ts
interface AlgorithmMeta {
  id: string;                       // 如 'bubble-sort'
  name: LocalizedText; category: CategoryId;
  difficulty: 'easy' | 'medium' | 'hard';
  description: LocalizedText;
  complexity: { time: { best: string; average: string; worst: string }; space: string };
  prerequisites: string[];          // 技能树前置依赖（algorithmId）
  tags: string[];
  inputSpec: InputSpec;             // 字段/类型/范围/约束/生成器/预设/边界用例
  defaultCase: CaseInput;
  boundaryCases: CaseInput[];       // 空、单元素、全等、已排序、逆序、极值等
  runnerId: string;                 // AlgorithmRunner 注册 id
  renderers: RendererKind[];        // 本算法使用的渲染器组合
  codeExamples: Record<CodeLang, CodeExample>;   // 三语言源码 + lineMap
  pseudocode: string;               // 伪代码展示
  commonMistakes: Mistake[];        // 常见错误与边界情况
}
```

### 5.3 Lesson Schema（语言课程）

```ts
interface LessonMeta {
  id: string;                       // 如 'cpp-basics-variables'
  language: 'cpp' | 'csharp' | 'python';
  chapterId: string; order: number;
  title: LocalizedText; difficulty: Difficulty; minutes: number;
  prerequisites: string[];
  concept: ContentBlock[];          // 概念说明（结构化内容块）
  codeExamples: Record<CodeLang, CodeExample>;   // 完整可运行示例
  comparison: ComparisonTable;      // 三语言写法对比
  demo?: { runnerId: string; defaultInput: CaseInput }; // 复用算法引擎做动态演示
  memoryView?: { kind: 'memory' | 'flow'; data: MemorySnapshot[] }; // 指针/堆栈/对象生命周期内存图
  commonMistakes: Mistake[];
  exercise: { prompt: LocalizedText; hints: string[]; answer: CodeExample };
}
```

知识点演示与算法可视化共用同一引擎与渲染器，课程页不需要第二套播放系统。

### 5.4 CodeMap（三语言代码行映射）

```ts
interface CodeExample { language: CodeLang; source: string; lineMap: Record<string, number> }
// 源码中用 `//>codeLineId` 注释标记逻辑行，构建/测试阶段提取生成 lineMap；
// 测试保证：每个 step.codeLineId 在三种语言中都存在映射，且三种语言逻辑行一一对应。
```

### 5.5 Renderer Registry（渲染器注册表）

| RendererKind | 渲染内容 | 用于 |
|---|---|---|
| `array-bars` | 柱状图 + 索引 + 指针 + 高亮 | 排序类 |
| `array-blocks` | 方块 + 索引 + 区间/指针 | 搜索/双指针/滑动窗口 |
| `linked-list` | 节点 + next 指针连线 + 头尾标记 | 链表 |
| `stack` | 垂直容器 + 入栈/出栈动画 + 底衬数组 | 栈、DFS |
| `queue` | 水平容器 + 队首/队尾指针 | 队列、BFS |
| `hash-table` | 桶 + 哈希计算 + 冲突链 | 哈希表 |
| `tree` | 树形节点 + 遍历路径 + 递归层高亮 | 二叉树 |
| `heap` | 树结构与数组结构同步展示 | 堆、堆排序 |
| `graph` | 节点/边/权重/访问状态/路径 | DFS/BFS/最短路 |
| `table` | 状态表 + 转移来源箭头 + 计算顺序 | 动态规划 |
| `call-stack` | 函数调用栈帧堆叠 + 参数/返回值 | 递归类 |
| `memory` | 变量/地址/引用连线/对象生命周期 | 指针、引用、堆栈内存 |
| `decision-tree` | 决策树 + 选择列表 + 撤销 | 回溯 |
| `variables` / `stats` | 变量表 / 操作统计（侧栏面板） | 所有算法 |

渲染器输入统一为 `(step: AlgorithmStep, layout: ViewBox) → ReactNode`，内部纯 SVG/Canvas，动画由 CSS/Framer Motion 过渡完成，取消与重置由播放控制器保证。

### 5.6 Roadmap（技能树图数据）

```ts
interface RoadmapNode {
  id: string;                    // 与 algorithmId / lessonId 关联
  kind: 'algorithm' | 'lesson';
  title: LocalizedText; category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];       // 前置节点（画依赖连线）
  group: string;                 // 分组列（数组/基础结构/链表/二叉树/高级结构/其他）
}
// 布局：按 group 分列、同列按依赖层级排布，自研分层布局 + 手工坐标微调；
// 视口：pointer 事件驱动的缩放/平移（滚轮缩放以鼠标为中心、拖拽平移、适应画布）。
```

### 5.7 Progress Store（持久化状态）

```ts
interface PersistedState {
  version: 1;
  completedLessons: Record<string, { doneAt: number }>;
  completedAlgorithms: Record<string, { doneAt: number; lastInput: string }>;
  favorites: string[];
  settings: {
    theme: 'dark' | 'light';
    uiLang: 'zh' | 'en';
    codeLang: 'cpp' | 'csharp' | 'python';
    playbackSpeed: number;      // 0.25–4
    fontSize: number;
    reduceMotion: boolean;
  };
}
```

---

## 6. 项目目录

```
编程学习工具/
├── README.md
├── docs/
│   ├── DESIGN.md                # 本文档
│   └── ROADMAP.md               # 路线图内容对照与迭代记录
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── index.html
├── playwright.config.ts
├── public/favicon.svg
├── src/
│   ├── main.tsx / App.tsx
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx        # Theme/i18n/ErrorBoundary
│   │   └── ErrorBoundary.tsx
│   ├── i18n/                    # zh-CN.ts / en-US.ts / index.ts（类型安全词典）
│   ├── styles/                  # global.css（主题变量）
│   ├── components/
│   │   ├── layout/              # TopNav / LeftSidebar / RightStatusPanel / BottomControlBar / MobileTabs
│   │   ├── editor/              # CodeEditor / LanguageSwitcher
│   │   ├── playback/            # PlaybackControls / SpeedControl / ProgressBar / ShortcutHelp
│   │   ├── panels/              # VariablesPanel / CallStackPanel / OutputPanel / StatsPanel /
│   │   │                        # ComplexityPanel / ExplanationPanel / PseudocodePanel / MistakesPanel
│   │   ├── viz/                 # VizCanvas / 渲染器宿主 / ViewBox 缩放适配
│   │   ├── roadmap/             # SkillTree / DragZoomViewport / RoadmapNodeCard / MiniMap / Search
│   │   └── ui/                  # Button / Badge / Tooltip / Modal / EmptyState / Tabs / Slider …
│   ├── engine/
│   │   ├── types/               # step.ts / algorithm.ts / lesson.ts / roadmap.ts / progress.ts
│   │   ├── playback/            # PlaybackController.ts / usePlayback.ts
│   │   ├── runners/             # registry.ts + bubbleSort.ts / binarySearch.ts / …（纯函数）
│   │   ├── inputs/              # parsers.ts / validators.ts / generators.ts（随机/预设/边界）
│   │   └── codeMap/             # 三语言源码模板 + codeLineId 提取与校验
│   ├── renderers/
│   │   ├── registry.ts
│   │   ├── ArrayBars.tsx / ArrayBlocks.tsx / LinkedList.tsx / Stack.tsx / Queue.tsx /
│   │   │   Tree.tsx / Graph.tsx / Table.tsx / CallStack.tsx / Memory.tsx
│   │   └── useTransition.ts     # 元素状态 → 颜色/过渡的统一映射
│   ├── content/
│   │   ├── lessons/             # cpp/ csharp/ python/ 分章节知识点文件
│   │   ├── algorithms/          # meta 注册表 + 三语言源码 + 伪代码
│   │   ├── roadmap/             # 技能树图数据（依赖/分组/坐标）
│   │   └── exercises/
│   ├── stores/                  # progressStore.ts / settingsStore.ts（persist）
│   ├── pages/                   # 见页面清单
│   ├── hooks/                   # useMediaQuery / useKeyboardShortcuts / useAlgorithmPlayer
│   ├── workers/                 # pyodide.worker.ts（实验室，按需）
│   ├── lib/                     # storage / validation / i18n / url-share / types 工具
│   └── test/
│       ├── unit/                # runners 确定性 / 步骤协议 / PlaybackController / 校验器 / CodeMap
│       └── e2e/                 # Playwright 用例
```

职责边界：算法逻辑（engine/runners，纯 TS 函数）与动画渲染（renderers）完全分离；
教学内容（content/*）与页面组件完全分离；组件单一职责；`strict` 模式 + 禁止 `any`。

---

## 7. MVP 范围（第一阶段）

### 7.1 里程碑 M1：冒泡排序纵向切片（验证全部基础架构）

先完成脚手架 → 统一协议 → 播放控制器 → 渲染框架 → 冒泡排序完整链路，验证后进入 M2：

- 冒泡排序：柱状图渲染、比较/交换高亮、指针、代码行同步、变量表、统计、复杂度；
- 可修改输入（自定义数组 + 随机 + 预设 + 边界用例）、前进/后退/自动播放/暂停/速度/重置/跳首尾；
- 三语言源码切换且高亮行同步；完成状态写入进度；刷新恢复设置。

### 7.2 里程碑 M2：完整 MVP（验收标准对齐）

**页面**：首页、学习路线图、算法库、统一算法实验室、课程树骨架 + 首批教学页、实验室入口、进度页。

**路线图**：可拖动、缩放、适应画布、搜索、难度配色（绿/黄/红）、前置依赖连线、点击进入算法页。

**必须完整实现的 11 个可视化**（每个都满足：改输入/生成步骤/前进后退/自动播放/调速/重置/代码高亮同步/变量状态/步骤说明/复杂度/三语言切换）：

| 算法 | 渲染器 | 要点 |
|---|---|---|
| 冒泡排序 | array-bars | M1 切片 |
| 二分搜索 | array-blocks + 指针 | 区间收缩、mid 指针、比较计数 |
| 数组双指针 | array-blocks | 两指针移动、碰撞/相向 |
| 滑动窗口 | array-blocks | 窗口区间高亮、进出窗口 |
| 栈 | stack | push/pop 动画、top 指针、容量 |
| 队列 | queue | enqueue/dequeue、队首队尾、循环数组形态 |
| 链表 | linked-list | 遍历/插入/删除、节点与连线 |
| 二叉树遍历 | tree + call-stack | 前/中/后序（递归版），访问路径与调用栈 |
| DFS | graph + stack | 访问状态、回溯、栈快照 |
| BFS | graph + queue | 层序扩展、队列快照、距离 |
| 动态规划 | table + call-stack | 斐波那契（状态表/递归树）与 0-1 背包（转移来源箭头） |

**统一教学页**：概念说明、伪代码、Monaco 编辑器、可视化画布、步骤说明、复杂度、常见错误、小练习+参考答案、三语言对比（首批每语言至少 2 个知识点，验证 Lesson Schema 链路）。

**其他 MVP 能力**：深色/浅色主题、zh/en 切换框架（界面文案词典化，MVP 内容以中文为主）、本地进度/收藏/设置持久化、URL 分享输入、键盘快捷键、响应式三档布局、错误边界与空状态、Vitest 单元测试 + Playwright E2E（冒泡排序全链路 + 刷新恢复）。

---

## 8. 后续迭代计划

- **Phase 2（算法扩展）**：其余排序（选择/插入/希尔/归并/快速/堆/计数/基数）、哈希表（桶+冲突）、
  堆（树+数组同步）、Trie、并查集、拓扑排序、Dijkstra、Bellman-Ford、Floyd、Prim、Kruskal、KMP、
  LCS、LIS、背包族、回溯（决策树渲染器）、贪心、数学；导出案例 JSON；边界测试案例扩展。
- **Phase 3（语言课程内容）**：三语言全部基础+进阶知识点；指针/引用/栈堆/对象生命周期内存图渲染器；
  委托/事件/LINQ/async 流程图渲染器；生成器/装饰器/闭包/异步图解；练习题系统。
- **Phase 4（平台化）**：C++/C# 真实编译运行（后端 Docker 沙箱：rlimits、seccomp、禁网、超时）；
  Python 实验室完善（多文件、输入输出、matplotlib）；账号与云同步；完整英文化；无障碍深化。

---

## 9. 主要技术风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 步骤快照内存：大输入产生大量全量快照 | 卡顿/内存膨胀 | 结构共享快照；输入规模上限（数组≤100、图节点≤60）；快照仅存必要字段 |
| 后退正确性 | 错误结果 | 快照恢复，禁止反向执行；runner 纯函数 + 确定性测试 |
| 三语言代码同步 | 高亮错行 | codeLineId 映射（非行号猜测）；测试校验三语言映射完整一致 |
| Monaco 体积/worker | 首屏慢 | 路由级懒加载 + 独立 worker + 代码分包 |
| 严格模式双调用/定时器泄漏 | 动画错乱 | PlaybackController 节拍器统一创建/取消；unmount 清理 |
| Pyodide 加载慢/内存大 | 实验室体验差 | 按需加载 + Web Worker + 超时控制；MVP 不阻塞其他功能 |
| 大规模图 SVG 性能 | 掉帧 | 节点数阈值切换 Canvas；减少每帧重渲染（快照 diff + memo） |
| 内容量大、易漂移 | 维护困难 | Schema + 内容校验测试；内容数据驱动、无手写页面 |
| 中文界面 + 国际化演进 | 文案散落 | 全部文案走词典（zh/en），新增文案有 lint 级校验 |
| C++/C# 真实运行预期 | 用户误解 | UI 明确“演示模式”标注；文档声明沙箱要求；不伪装实现 |

---

## 10. 实施顺序（确认后执行）

1. 项目脚手架：Vite + TS strict + Tailwind + Router + Zustand + Monaco，可安装、可启动、深色主题骨架。
2. 引擎核心：Step 协议、PlaybackController、输入解析/校验、CodeMap。
3. 渲染框架：Renderer Registry + array-bars + 统一配色 + VizCanvas。
4. 冒泡排序纵向切片（M1），验证：代码高亮、动画、变量、前进/后退/重置/速度/语言切换全部可用。
5. M2 其余 10 个算法 + 首页/路线图/算法库/课程骨架/进度页 + 响应式。
6. 测试（Vitest + Playwright）、README、运行说明，验收对照。
