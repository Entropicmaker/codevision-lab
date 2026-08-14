# CodeVision Lab · 编程视界

面向 **C++、C#、Python** 学习者的交互式编程与算法可视化学习平台。
可单步执行、可回放、可修改数据，动画与代码行严格同步。

🌐 **线上地址**：<https://lingeocs.com/codevision-lab/>（GitHub Pages 部署，仓库 `Entropicmaker/codevision-lab`，push 到 main 自动构建发布）

![技术栈](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-strict-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple)

## ✨ 功能特性

- **算法可视化实验室**：每个算法都能修改输入、随机生成、单步前进/后退、自动播放、调速、跳首尾、重置；
  动画（SVG 自研渲染引擎）与三语言示例代码逐行同步高亮。
- **统一执行协议**：每个执行步骤都是完整状态快照（变量、容器、指针、调用栈、输出、操作统计），
  后退 = 恢复快照，绝不反向执行算法。
- **三语言同步**：C++ / C# / Python 示例代码随时切换，高亮行不错位（codeLineId 跨语言映射）。
- **学习路线图**：可拖拽、滚轮缩放、适应画布、搜索的技能树，绿/黄/红区分难度，前置依赖连线。
- **在线实验室**：Python 代码经 Pyodide 在 Web Worker 中真实执行（输出/错误/超时保护）；
  C++/C# 为诚实标注的演示模式（浏览器内不伪装编译）。
- **本地进度**：学习进度、收藏、主题、语言、播放速度等偏好保存在 localStorage，刷新不丢失。
- **响应式**：桌面三栏 → 平板折叠 → 手机标签页（说明/代码/动画/状态）。
- **国际化**：默认简体中文，界面文案支持一键切换英文（内容双语存储）。
- **键盘快捷键**：`Space` 播放/暂停 · `←/→` 上/下一步 · `R` 重置 · `Home/End` 跳首/尾 · `S` 随机数据 · `[`/`]` 减速/加速 · `?` 帮助。

## 🚀 快速开始

要求：Node.js ≥ 20（开发环境使用 v24），npm ≥ 10。

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 → http://localhost:5173
```

常用命令：

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器（Vite） |
| `npm run build` | 类型检查 + 生产构建（输出 dist/） |
| `npm run preview` | 预览生产构建 |
| `npm run typecheck` | 仅 TypeScript 严格类型检查 |
| `npm test` | 单元测试（Vitest，一次运行） |
| `npm run test:watch` | 单元测试监听模式 |
| `npm run test:e2e` | 端到端测试（Playwright，自动启动 dev server） |
| `npm run test:all` | 单元 + 端到端全部测试 |

> 首次运行 E2E 需先安装浏览器：`npx playwright install chromium`

## 🗺 页面导航

| 路由 | 页面 |
|---|---|
| `/` | 首页 |
| `/roadmap` | 学习路线图（技能树） |
| `/algorithms` | 算法库（搜索 / 分类 / 难度筛选） |
| `/algorithms/:id` | 算法实验室（核心多面板页面） |
| `/learn/:lang` | 语言课程树（C++ / C# / Python） |
| `/learn/:lang/:lessonId` | 统一教学页 |
| `/lab` | 在线实验室 |
| `/exercises` | 练习题 |
| `/progress` | 学习进度 |

## 🧩 架构

```
src/
├── engine/        # 纯逻辑：Step 协议 / Runner（确定性步骤生成）/ PlaybackController / 输入解析 / CodeMap
├── renderers/     # SVG 渲染器注册表：柱状图/方块/栈/队列/链表/树/图/DP 表
├── content/       # 数据驱动内容：算法 meta（三语言代码+伪代码+常见错误）/ 课程 / 路线图
├── components/    # 编辑器(Monaco)/面板/控制栏/布局/UI 组件库
├── stores/        # Zustand：进度 / 设置（localStorage 持久化）
├── pages/         # 路由页面
├── workers/       # Pyodide Web Worker（实验室）
└── i18n/          # zh-CN / en-US 类型安全词典
```

核心设计原则见 `docs/DESIGN.md`；新增算法的完整契约见 `docs/ALGORITHM_CONTRIBUTING.md`。

### 关键机制

- **一步一快照**：`AlgorithmStep` 为不可变状态快照；`PlaybackController` 的“上一步”恢复上一快照，
  不反向执行算法，保证正确性与确定性。
- **代码行同步**：Runner 的每步携带语言无关的 `codeLineId`；三种语言源码用
  `//>id` / `#>id` 行尾标记，构建期提取 `lineMap`（自动化测试强制三语言标记一致）。
- **演示模式声明**：C++ / C# 示例由内置确定性执行模拟器逐步生成（忠实还原真实执行过程），
  UI 明确标注“演示模式”；只有 Python 在实验室中真实运行（Pyodide + Web Worker + 10s 超时）。

## 🎨 视觉

- 默认深色主题（类 IDE 风格），一键切换浅色；配色令牌基于 CSS 变量。
- 统一颜色语义：**蓝**=当前访问 · **黄**=正在比较 · **绿**=已完成/已访问 · **红**=冲突/无效 · **紫**=函数调用/递归 · **灰**=未访问。

## 🧪 测试

- **单元测试**（Vitest）：Runner 确定性 / 快照独立性 / 播放控制器状态机 / 输入校验 / CodeMap /
  内容注册表不变量（所有算法自动校验三语言行映射一致、协议合法）。
- **端到端**（Playwright，desktop-chromium + mobile-chromium）：冒泡排序全链路
  （改输入/前进后退/跳首尾/重置/语言切换/播放暂停/快捷键/进度持久化/主题恢复/分享链接）与移动端标签页。

## 📦 技术栈

React 19 · TypeScript 5.9（strict）· Vite 8 · Tailwind CSS 4 · React Router 7 · Zustand 5 ·
Monaco Editor · 自研 SVG 渲染引擎 · Framer Motion · Vitest 4 · Playwright · Pyodide（按需 CDN）

## 🔒 安全边界

- 前端不执行任何未经隔离的系统命令；浏览器内不编译 C++/C#。
- Python 在 Web Worker 的 Pyodide 中运行，10 秒超时，可随时终止 Worker。
- 未来若支持 C++/C# 真实编译，必须通过独立后端沙箱（Docker 隔离、CPU/内存/时间限制、seccomp、禁网）。

## 📄 许可

MIT（教学示例代码随内容文件一并许可）。
