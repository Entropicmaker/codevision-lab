import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <iostream>
using namespace std;

// 深度优先搜索（递归视角）：邻接表 + visited 标记
void dfs(int u, const vector<vector<int>>& adj, vector<bool>& visited) { //>func
    visited[u] = true;                               //>visit
    cout << u << " ";                                // 记录访问顺序
    for (int v : adj[u]) {                           //>check-edge
        if (!visited[v]) {                           //>recurse
            dfs(v, adj, visited);                    // 递归深入
        }
    }
}                                                    //>backtrack

// 入口：从 start 出发进行 DFS 遍历
void graphDfs(const vector<vector<int>>& adj, int start) { //>init
    vector<bool> visited(adj.size(), false);         // 初始化访问标记
    dfs(start, adj, visited);                        // 从起点开始
}                                                    //>end`;

const csharpSource = `using System;
using System.Collections.Generic;

class GraphDfsDemo
{
    // 深度优先搜索（递归视角）：邻接表 + visited 标记
    static void Dfs(int u, List<List<int>> adj, bool[] visited) { //>func
        visited[u] = true;                                    //>visit
        Console.Write(u + " ");                               // 记录访问顺序
        foreach (int v in adj[u]) {                           //>check-edge
            if (!visited[v]) {                                //>recurse
                Dfs(v, adj, visited);                         // 递归深入
            }
        }
    }                                                         //>backtrack

    // 入口：从 start 出发进行 DFS 遍历
    static void GraphDfs(List<List<int>> adj, int start) {    //>init
        bool[] visited = new bool[adj.Count];                 // 初始化访问标记
        Dfs(start, adj, visited);                             // 从起点开始
    }                                                         //>end
}`;

const pythonSource = `# 深度优先搜索（递归视角）：邻接表 + visited 标记
def dfs(u, adj, visited):               #>func
    visited[u] = True                   #>visit
    print(u, end=" ")                   # 记录访问顺序
    for v in adj[u]:                    #>check-edge
        if not visited[v]:              #>recurse
            dfs(v, adj, visited)        # 递归深入
    # 返回：所有邻接点访问完毕（回溯）  #>backtrack

# 入口：从 start 出发进行 DFS 遍历
def graph_dfs(adj, start):              #>init
    visited = [False] * len(adj)        # 初始化访问标记
    dfs(start, adj, visited)            # 从起点开始
    # 遍历完成                            #>end`;

const pseudocode = `dfs(u, adj, visited):        #>func
  visited[u] = true          #>visit
  output u                   # 记录访问顺序
  for v in adj[u]:           #>check-edge
    if not visited[v]:       #>recurse
      dfs(v, adj, visited)   # 递归深入
  # 返回（回溯）             #>backtrack

graphDfs(adj, start):        #>init
  visited = [false] * n      # 初始化访问标记
  dfs(start, adj, visited)   # 从起点开始
  # 遍历完成                 #>end`;

export const dfsMeta: AlgorithmMeta = {
  id: 'dfs',
  name: { zh: '深度优先搜索（图）', en: 'Depth-First Search (Graph)' },
  category: 'graph',
  difficulty: 'medium',
  description: {
    zh: '深度优先搜索从起点出发，沿一条路径尽可能深入地探索，直到无法继续再回溯，然后尝试其他分支。它借助显式栈（或递归调用栈）记录待探索的路径，是连通性判断、拓扑排序、环检测等任务的基础。',
    en: 'Depth-first search starts from a source node and explores as far as possible along each branch before backtracking, then tries other branches. It uses an explicit stack (or the recursion call stack) to remember the exploration path — the foundation of connectivity checks, topological sort, and cycle detection.',
  },
  complexity: {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
  },
  prerequisites: [],
  tags: ['图', '深度优先', '回溯', '栈'],
  inputSpec: {
    name: 'edges',
    kind: 'edge-list',
    maxLen: 10,
    aux: { name: { zh: '起点 start', en: 'Start node' }, kind: 'int', min: 0, max: 20, default: 0 },
  },
  defaultInput: '0-1, 0-2, 1-3, 2-4, 3-5, 4-5',
  presets: [
    { name: { zh: '星形图', en: 'Star graph' }, input: '0-1, 0-2, 0-3, 0-4' },
    { name: { zh: '含环图', en: 'Graph with a cycle' }, input: '0-1, 1-2, 2-0, 2-3' },
  ],
  boundaryCases: [
    { name: { zh: '两节点一条边', en: 'Two nodes, one edge' }, input: '0-1' },
    { name: { zh: '星形图', en: 'Star graph' }, input: '0-1, 0-2, 0-3' },
    { name: { zh: '含环图', en: 'Graph with a cycle' }, input: '0-1, 1-2, 2-0' },
  ],
  runnerId: 'dfs',
  visualKind: 'graph',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '忘记标记 visited 导致死循环', en: 'Forgetting to mark nodes visited' },
      detail: {
        zh: '若进入节点时没有立即标记 visited，在含环图上 DFS 会反复进入同一节点，永不停止。必须在"进入"节点的第一步就标记 visited。',
        en: 'If a node is not marked visited as soon as it is entered, DFS on a graph with cycles will keep re-entering the same node forever. Mark visited immediately when entering a node.',
      },
      code: 'visited[u] = true;   // 进入 dfs(u) 的第一步',
    },
    {
      title: { zh: '回溯时栈与访问状态不同步', en: 'Stack and visited state out of sync on backtrack' },
      detail: {
        zh: '回溯时必须弹出对应的调用栈帧，且已访问标记要保留（绝不能"反标记"）。若弹出时机与递归返回不一致，栈顶会指向错误的当前节点，破坏"回到最近分支"的逻辑。',
        en: 'On backtrack, pop exactly the frame that returns and keep the visited marks (never unmark them). If the pop timing mismatches the recursion return, the stack top points at the wrong node and the "back to the nearest branch" logic breaks.',
      },
      code: '// 回溯：只弹出当前 dfs(u) 的帧，visited 保持 true',
    },
    {
      title: { zh: '递归深度过大导致栈溢出', en: 'Stack overflow from deep recursion' },
      detail: {
        zh: '在链状图上递归深度可达 O(V)。工程上可改用"显式栈"的迭代写法，避免递归栈溢出。本演示的栈面板正是递归路径的可视化。',
        en: 'On path-like graphs recursion depth can reach O(V). In practice, use an explicit-stack iterative version to avoid stack overflow. The stack panel here visualizes the recursion path.',
      },
    },
  ],
};
