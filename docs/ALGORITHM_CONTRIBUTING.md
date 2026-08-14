# 算法贡献契约（Algorithm Contributing Contract）

本文档定义在 CodeVision Lab 中新增一个可视化算法的完整规范。所有内容必须数据驱动，
Runner（执行逻辑）与 meta（教学内容）分离，且满足自动化测试的不变量。

## 1. 文件与注册

每个算法两个文件 + 两处注册：

1. Runner：`src/engine/runners/<algorithm-id>.ts`，导出 `runXxx: AlgorithmRunner`
   - 在 `src/engine/runners/registry.ts` 的 `runners` 表中登记 `'<algorithm-id>': runXxx`
2. Meta：`src/content/algorithms/<algorithm-id>.ts`，导出 `xxxMeta: AlgorithmMeta`
   - 在 `src/content/algorithms/registry.ts` 的 `algorithmMetas` 数组登记

参考实现（务必先读）：
- `src/engine/runners/bubbleSort.ts` + `src/content/algorithms/bubble-sort.ts`（数组柱状图）
- `src/engine/runners/binarySearch.ts` + `src/content/algorithms/binary-search.ts`（数组方块 + aux 输入）

## 2. Step 协议（src/engine/types/step.ts）

一步 = 一份不可变完整快照：

```ts
interface AlgorithmStep {
  stepId: number;                 // 必须等于 steps 数组下标
  codeLineId: string | null;      // 当前逻辑代码行 id
  operation: OperationType;       // init/compare/swap/assign/push/pop/enqueue/dequeue/visit/backtrack/return/found/not-found/finalize/no-op…
  containers: Record<string, DisplayItem[]>;  // 数组等容器快照
  structures: StructureSnapshot[];            // 栈/队列/链表/树/图/表
  variables: Record<string, Primitive>;
  pointers: PointerState[];       // {id,name,target:'a:0' 等}
  callStack: CallFrame[];         // 递归算法必须手动维护帧
  output: string[];
  explanation: { zh: string; en: string };  // 每步都要双语说明！
  stats: OpStats;                 // 累计值 {comparisons,swaps,accesses,writes}
}
```

**快照独立性（硬性要求）**：维护一份可变 `base` 状态，每次 push 前对 base 做深拷贝
（`base.map(b => ({...b}))`）写入 step。**绝不让两个 step 共享可变对象**。

**确定性（硬性要求）**：Runner 为纯函数，同输入两次运行必须产生 `toEqual` 完全相同的
steps。禁止 `Math.random()`、`Date.now()` 等。

**统计**：`stats` 为累计值，只能增加；比较 +1 次应同时 `accesses += 2`。

## 3. 颜色语义（elements.state）

| state | 颜色 | 含义 |
|---|---|---|
| idle | 灰 | 未访问 / 默认 |
| active | 蓝 | 当前访问 / 当前节点 |
| comparing | 黄 | 正在比较 / 候选 |
| done | 绿 | 已完成 / 已访问 / 已排序 |
| invalid | 红 | 冲突 / 错误 / 无效路径 |
| call | 紫 | 函数调用 / 递归关系 |

## 4. 渲染器约定（visualKind → 结构快照）

- `array-bars`：`containers.a`（值→柱高），指针 target 用 `a:<index>`
- `array-blocks`：同上，等高方块；指针可多支（lo/mid/hi、left/right）
- `stack`：`structures: [{kind:'stack', id, items}]`，items[0]=栈底（渲染栈顶在上）
- `queue`：`structures: [{kind:'queue', id, items, capacity}]`，items[0]=队首
- `linked-list`：`structures: [{kind:'linked-list', id, items, linked}]`，items 顺序=链序；
  游离节点 `label:'detached'`
- `tree`：`structures: [{kind:'tree', id, nodes, edges, rootId}]`；节点 id 用 `n:<数组索引>`
  （完全二叉树布局公式自动计算）；edges 为 `{from,to,state?}`（遍历路径）
- `graph`：`structures: [{kind:'graph', id, nodes, edges}]`；节点可带 x/y 坐标（缺省圆形布局）；
  edges 为 `{from,to,label?,directed?,state?}`
- `table`：`structures: [{kind:'table', id, rows, cols, colHeaders, rowHeaders, cells, sourceEdges}]`；
  cells 元素含 `{row,col}`；sourceEdges 为 `{from:{row,col}, to:{row,col}, state?}`（DP 转移来源箭头）

数组类算法也可以同时提供 containers 与 structures（如堆的数组+树双视图）。

## 5. 输入模型

- 纯数组：`input.value` 为 `number[]`
- 带标量附加输入（如 target）：`inputSpec.aux` 定义，`input.value` 为
  `{ array: number[], target: number }`
- 复杂输入（图/树等）：在**自己的 runner 文件内**解析。约定：
  - 树：层序数组字符串，空节点用 `null`（用户输入 `1, 2, 3, null, 4, 5`）
  - 图：边列表字符串 `0-1, 0-2, 1-3`（节点自动编号），起点用 aux
  - 输入解析失败时产生显式 invalid 步骤并给出中文说明，不要抛异常伪装成功

## 6. codeLineId 与三语言代码

每行逻辑代码行打标记（行尾注释）：
- C++ / C# / 伪代码：`//>codeLineId`
- Python：`#>codeLineId`

`lineMap` 用 `extractLineMap(source)` 生成（不要手写行号）。
**硬性要求**：三种语言 + 伪代码四处的 codeLineId 集合完全一致（自动化测试强制）。
Runner 每一步的 `codeLineId` 必须存在于全部三种语言的 lineMap。

## 7. Meta 内容要求

```ts
{
  id, name: {zh, en}, category, difficulty: 'easy'|'medium'|'hard',
  description: {zh, en},          // 概念说明
  complexity: { time: {best, average, worst}, space },
  prerequisites: string[],        // 前置算法 id（技能树依赖）
  tags: string[],
  inputSpec: { name, kind:'int-array', minLen, maxLen, valueMin, valueMax, allowEmpty, aux? },
  defaultInput, presets, boundaryCases,   // 边界案例必须有：空/单元素/极值
  runnerId, visualKind,
  codeExamples: { cpp, csharp, python },  // source + extractLineMap
  pseudocode,                     // 带 //> 行标记
  commonMistakes: [{title:{zh,en}, detail:{zh,en}, code?}],  // 至少 2 条
}
```

## 8. 测试

每个算法在 runner 文件旁写 `<runner>.test.ts`：
- 正确性：默认/边界输入的结果正确
- 确定性：同输入两次 `toEqual`
- 快照独立：修改某步不影响其他步
- 关键 codeLineId 出现过

`src/content/algorithms/registry.test.ts` 会自动校验全部算法（lineMap 一致、runner 存在、
确定性、协议合法），新增算法后运行 `npm test` 必须全绿。

## 9. 验证命令

```bash
npx tsc -b          # 类型检查必须零错误（strict 模式）
npm test            # 单元测试必须全绿
```

> 注意：`src/engine/types/step.ts` 的 `OperationType` 如需新操作类型，先扩展该联合类型。
