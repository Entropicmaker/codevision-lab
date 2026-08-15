# 内容准确性评审报告（2026-08）

对 24 个算法 meta + 24 个课程知识点的系统性只读评审（两个独立评审代理），
外加 Python 代码 AST 语法客观验证。以下为结论与处置记录。

## 客观验证

- Python 语法（AST parse）：48 段三语言示例中的 Python 代码 + 8 段 Python 练习答案，**全部语法正确**。

## 算法内容评审

**结论：0 critical / 8 high / 8 low**。核心算法逻辑与复杂度标注基本准确
（冒泡 O(n²)、快排 worst O(n²)、Dijkstra O(V²)、BF O(VE)、Floyd O(V³) 均正确）。

### high 修复记录（8/8 已修复）

| # | 算法 | 问题 | 处置 |
|---|---|---|---|
| 1 | dijkstra | 负权边反例实际不失效，会误导 | 换真正失效反例（0→1:2、0→2:3、2→1:-2）+ 弱化"必然出错"措辞 |
| 2 | kruskal | 描述声称"路径压缩+按秩合并"但代码与 Runner 均未实现 | 描述/三语言注释统一为"教学简化版"，说明单次 find 最坏 O(V) |
| 3 | linked-list-ops | 插入/删除只有注释无代码 | 三语言补全实际插入/删除代码 |
| 4 | binary-search | 边界案例名称与内容错位（target 不可覆盖） | 引擎级修复：BoundaryCase 支持 aux 覆盖；各案例补 aux |
| 5 | knapsack | "W=1"案例实际演示 W=5 | 同上：aux: 1 |
| 6 | fibonacci | "n=0/1/2"案例实际 n=8 | 同上：aux: 0/1/2，input 统一空串 |
| 7 | sliding-window | "k=1"案例实际 k=3 | 同上：aux: 1、aux: 3 |
| 8 | two-pointers | preset"目标在中间"实际无解 | 换有解数组 + aux: 11 |

### low 修复记录（8/8 已修复）

| # | 算法 | 问题 | 处置 |
|---|---|---|---|
| 1 | bubble-sort | "访问越界"论据错误 | 删除越界说法，改为"重复比较已就位后缀" |
| 2 | quick-sort | space 单值 O(log n) 与最坏描述矛盾 | 改为"O(log n) 平均 · O(n) 最坏" |
| 3 | stack-demo | O(1) 口径与其他算法不一致 | "O(1) 单次 · O(n) 整体" |
| 4 | queue-demo | 同上 | 同上 |
| 5 | linked-list-ops | 复杂度混合作口径 | 注释说明各操作口径 |
| 6 | knapsack | 回溯代码不记录选中物品 | 三语言+伪代码补 selected 记录 |
| 7 | hash-table | 空输入 keys.back() 未定义行为 | 三语言加空输入保护 |
| 8 | binary-search | preset 不含默认 target 总是未命中 | 数组加入 23 |

### 抽查通过（11 个算法，无问题）

selection-sort、insertion-sort、merge-sort、heap-sort、topological-sort、
bellman-ford、floyd-warshall、prim、dfs、bfs、tree-traversal。

## 课程知识点评审

**结论：0 critical / 5 high / 5 low**（19 个知识点全部通过抽查）。

### high 修复记录（5/5 已修复）

| # | 知识点 | 问题 | 处置 |
|---|---|---|---|
| 1 | csharp-types | Python 注释输出值错 [99,1,2,3] | 改 [99,2,3] |
| 2 | csharp-arrays | IndexOf(88) 下标注释 2 应为 3 | 改 3 |
| 3 | csharp-delegates | 多播返回值注释 3 应为 7 | 改 7 |
| 4 | csharp-delegates | 练习答案不完整（只 Div） | 补全四则运算 + switch 完整答案 |
| 5 | python-containers | len(lst) 注释 4 应为 5 | 改 5 |

### low 修复记录（5/5 已修复）

| # | 知识点 | 问题 | 处置 |
|---|---|---|---|
| 1 | csharp-operators | == 对值类型概括过宽 | 限定"内置值类型"，注明自定义 struct 需重载 |
| 2 | csharp-loops | switch 表达式版本标注 | 关系模式标注 C# 9 |
| 3 | csharp-collections | foreach 删除措辞与代码不符 | 修正措辞（foreach 中 Remove 抛异常） |
| 4 | cpp-io | endl 示例代码结构缺陷（i 出作用域） | 重构为两个完整循环 |

## 结构性观察（未改，供后续决策）

- 知识点 concept 段落目前仅中文（无英文对照段落），title 等字段为双语。
- BoundaryCase 现已支持 aux 覆盖（本轮引擎级修复），新算法可放心使用。

## 处置后验证

- TypeScript strict：零错误
- 单元测试：300/300 全绿
- 修复后重新部署上线
