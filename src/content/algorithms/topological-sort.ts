import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <queue>
#include <iostream>
using namespace std;

// Kahn 算法：对有向无环图（DAG）做拓扑排序
vector<int> topologicalSort(int n, const vector<vector<int>>& adj, vector<int> indeg) { //>func
    vector<int> order;                             //>init
    queue<int> q;
    for (int u = 0; u < n; u++) {                  //>indegree
        if (indeg[u] == 0) q.push(u);              //>enqueue
    }
    while (!q.empty()) {                           //>dequeue
        int u = q.front(); q.pop();                // 出队并输出
        order.push_back(u);
        for (int v : adj[u]) {                     //>relax
            if (--indeg[v] == 0) q.push(v);        //>enqueue-next
        }
    }
    if ((int)order.size() != n) return {};         //>detect-cycle
    return order;                                  //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class TopologicalSortDemo
{
    // Kahn 算法：对有向无环图（DAG）做拓扑排序
    static List<int> TopologicalSort(int n, List<List<int>> adj, int[] indeg) { //>func
        List<int> order = new List<int>();           //>init
        Queue<int> q = new Queue<int>();
        for (int u = 0; u < n; u++) {                //>indegree
            if (indeg[u] == 0) q.Enqueue(u);         //>enqueue
        }
        while (q.Count > 0) {                        //>dequeue
            int u = q.Dequeue();                     // 出队并输出
            order.Add(u);
            foreach (int v in adj[u]) {              //>relax
                if (--indeg[v] == 0) q.Enqueue(v);   //>enqueue-next
            }
        }
        if (order.Count != n) return new List<int>(); //>detect-cycle
        return order;                                //>end
    }
}`;

const pythonSource = `from collections import deque

# Kahn 算法：对有向无环图（DAG）做拓扑排序
def topological_sort(n, adj, indeg):            #>func
    order = []                                  #>init
    q = deque()
    for u in range(n):                          #>indegree
        if indeg[u] == 0:                       #>enqueue
            q.append(u)                         # 入度为零的节点入队
    while q:                                    #>dequeue
        u = q.popleft()                         # 出队并输出
        order.append(u)
        for v in adj[u]:                        #>relax
            indeg[v] -= 1                       # 移除边，入度减一
            if indeg[v] == 0:                   #>enqueue-next
                q.append(v)                     # 邻居入度归零则入队
    if len(order) != n:                         #>detect-cycle
        return []                               # 存在环，无法拓扑排序
    return order                                #>end`;

const pseudocode = `topologicalSort(n, adj, indeg):     #>func
  order = []                         #>init
  q = empty queue
  for u in 0..n-1:                   #>indegree
    if indeg[u] == 0:                #>enqueue
      enqueue(q, u)                  # 入度为零的节点入队
  while not empty(q):                #>dequeue
    u = dequeue(q)                   # 出队并输出
    output u
    for v in adj[u]:                 #>relax
      indeg[v] -= 1                  # 移除边，入度减一
      if indeg[v] == 0:              #>enqueue-next
        enqueue(q, v)                # 邻居入度归零则入队
  if len(order) != n:                #>detect-cycle
    return empty                     # 存在环，无法拓扑排序
  return order                       #>end`;

export const topologicalSortMeta: AlgorithmMeta = {
  id: 'topological-sort',
  name: { zh: '拓扑排序（Kahn 算法）', en: 'Topological Sort (Kahn)' },
  category: 'graph',
  difficulty: 'medium',
  description: {
    zh: '拓扑排序把一个有向无环图（DAG）的节点排成线性顺序，使得每条有向边 u→v 都满足 u 在 v 之前，常用于任务调度、课程先修、编译依赖等场景。Kahn 算法（入度法）反复挑选入度为零的节点输出，并移除其出边、更新邻居入度，直到所有节点输出完毕；若输出数少于节点数，则说明图中存在环，无法拓扑排序。',
    en: "Topological sort arranges the nodes of a directed acyclic graph (DAG) into a linear order such that every directed edge u→v places u before v — useful for task scheduling, course prerequisites, and build dependencies. Kahn's algorithm (the in-degree method) repeatedly outputs nodes with zero in-degree and removes their outgoing edges, updating neighbors' in-degrees, until every node is output; if the output count is less than the node count, the graph contains a cycle and cannot be sorted.",
  },
  complexity: {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
  },
  prerequisites: ['bfs'],
  tags: ['图', '拓扑排序', '有向无环图', '队列', '入度'],
  inputSpec: {
    name: 'edges',
    kind: 'edge-list',
    maxLen: 12,
  },
  defaultInput: '0->1, 0->2, 1->3, 2->3, 3->4',
  presets: [
    { name: { zh: '菱形依赖', en: 'Diamond dependency' }, input: '0->1, 0->2, 1->3, 2->3' },
    { name: { zh: '链式依赖', en: 'Chain' }, input: '0->1, 1->2, 2->3' },
  ],
  boundaryCases: [
    { name: { zh: '两节点一条边', en: 'Two nodes, one edge' }, input: '0->1' },
    { name: { zh: '链式结构', en: 'Chain' }, input: '0->1, 1->2' },
    { name: { zh: '含环图', en: 'Graph with a cycle' }, input: '0->1, 1->2, 2->0' },
  ],
  runnerId: 'topological-sort',
  visualKind: 'graph',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '忽略"仅适用 DAG"的前提', en: 'Ignoring the DAG-only prerequisite' },
      detail: {
        zh: '拓扑排序只对有向无环图有意义。若图中存在环（如 0→1→2→0），任何节点都有前置依赖，算法最终输出数会少于节点数，永远无法给出合法拓扑序。',
        en: 'Topological sort only makes sense for a DAG. If the graph has a cycle (e.g. 0→1→2→0), every node has a pending prerequisite, so the algorithm ends with fewer outputs than nodes and can never produce a valid order.',
      },
    },
    {
      title: { zh: '用"输出数 < 节点数"判断环', en: 'Detecting a cycle via output count < n' },
      detail: {
        zh: 'Kahn 算法不必显式 DFS 找环：当队列耗尽后，若已输出节点数小于总节点数，剩余节点必然构成环。忘记这最后一步判断会误把不完整序列当作结果。',
        en: "Kahn's algorithm detects cycles for free: when the queue drains, if the output count is less than n, the remaining nodes must form a cycle. Forgetting this final check mistakes a partial sequence for a valid result.",
      },
      code: 'if (order.size() != n) { /* 存在环 */ }',
    },
    {
      title: { zh: '误以为拓扑序唯一', en: 'Assuming the topological order is unique' },
      detail: {
        zh: '拓扑序通常不唯一：同一时刻若有多个入度为零的节点，任选其一的顺序都是合法拓扑序。队列实现天然按先进先出给出其中一种，但并非唯一答案。',
        en: 'The topological order is usually not unique: when several nodes have zero in-degree at once, picking any of them still yields a valid order. The queue implementation returns one such order (FIFO), but it is not the only answer.',
      },
    },
  ],
};
