import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <climits>
#include <iostream>
using namespace std;

// Dijkstra 单源最短路：贪心选择 + 松弛（教学版 O(V^2)）
vector<int> dijkstra(int n, const vector<vector<pair<int,int>>>& adj, int start) { //>func
    const int INF = INT_MAX;                    //>init
    vector<int> dist(n, INF);
    vector<bool> done(n, false);
    dist[start] = 0;                            // 起点距离为 0
    for (int k = 0; k < n; k++) {
        int u = -1;                             //>select-min
        for (int v = 0; v < n; v++) {           // 扫描未确定节点选最小
            if (!done[v] && (u == -1 || dist[v] < dist[u])) u = v;
        }
        if (u == -1 || dist[u] == INF) break;   // 无可达节点则结束
        done[u] = true;                         //>visit
        cout << u << " ";
        for (auto& e : adj[u]) {                //>relax
            int v = e.first, w = e.second;
            if (dist[u] + w < dist[v]) {        //>update
                dist[v] = dist[u] + w;
            }
        }
    }
    return dist;                                //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class DijkstraDemo
{
    // Dijkstra 单源最短路：贪心选择 + 松弛（教学版 O(V^2)）
    static int[] Dijkstra(int n, List<List<(int, int)>> adj, int start) { //>func
        const int INF = int.MaxValue;            //>init
        int[] dist = new int[n];
        bool[] done = new bool[n];
        Array.Fill(dist, INF);
        dist[start] = 0;                         // 起点距离为 0
        for (int k = 0; k < n; k++) {
            int u = -1;                          //>select-min
            for (int v = 0; v < n; v++) {        // 扫描未确定节点选最小
                if (!done[v] && (u == -1 || dist[v] < dist[u])) u = v;
            }
            if (u == -1 || dist[u] == INF) break; // 无可达节点则结束
            done[u] = true;                      //>visit
            Console.Write(u + " ");
            foreach (var e in adj[u]) {          //>relax
                int v = e.Item1, w = e.Item2;
                if (dist[u] + w < dist[v]) {     //>update
                    dist[v] = dist[u] + w;
                }
            }
        }
        return dist;                             //>end
    }
}`;

const pythonSource = `import sys

# Dijkstra 单源最短路：贪心选择 + 松弛（教学版 O(V^2)）
def dijkstra(n, adj, start):          #>func
    INF = sys.maxsize                 #>init
    dist = [INF] * n
    done = [False] * n
    dist[start] = 0                   # 起点距离为 0
    for _ in range(n):
        u = -1                        #>select-min
        for v in range(n):            # 扫描未确定节点选最小
            if not done[v] and (u == -1 or dist[v] < dist[u]):
                u = v
        if u == -1 or dist[u] == INF: # 无可达节点则结束
            break
        done[u] = True                #>visit
        print(u, end=" ")
        for v, w in adj[u]:           #>relax
            if dist[u] + w < dist[v]: #>update
                dist[v] = dist[u] + w
    return dist                       #>end`;

const pseudocode = `dijkstra(n, adj, start):                 #>func
  INF = infinity                         #>init
  dist = [INF] * n
  done = [false] * n
  dist[start] = 0                        # 起点距离为 0
  for k in 0..n-1:
    u = -1                               #>select-min
    for v in 0..n-1:                     # 扫描未确定节点选最小
      if not done[v] and (u == -1 or dist[v] < dist[u]):
        u = v
    if u == -1 or dist[u] == INF:        # 无可达节点则结束
      break
    done[u] = true                       #>visit
    output u
    for (v, w) in adj[u]:                #>relax
      if dist[u] + w < dist[v]:          #>update
        dist[v] = dist[u] + w
  return dist                            #>end`;

export const dijkstraMeta: AlgorithmMeta = {
  id: 'dijkstra',
  name: { zh: 'Dijkstra 单源最短路', en: 'Dijkstra Single-Source Shortest Path' },
  category: 'graph',
  difficulty: 'medium',
  description: {
    zh: 'Dijkstra 算法求带非负权图从单一源点到其余所有节点的最短路径。它维护一个距离数组 dist，初始时 dist[起点]=0、其余为 ∞；每轮从"尚未确定"的节点中选出距离最小者 u，将其标记为已确定（它的距离不会再变），然后用 u 松弛它的每条出边：若 dist[v] > dist[u] + w，则更新 dist[v] = dist[u] + w。如此反复，直到所有可达节点都确定。本演示采用教学版的 O(V²) 实现——每轮线性扫描选最小值；若改用优先队列（堆）维护未确定节点，复杂度可降到 O((V+E) log V)。',
    en: "Dijkstra's algorithm computes shortest paths from a single source to every other node in a graph with non-negative edge weights. It keeps a distance array dist with dist[source]=0 and ∞ elsewhere. Each round it picks the smallest-distance node u among the still-undetermined nodes, finalizes it (its distance will never change again), then relaxes each outgoing edge of u: if dist[v] > dist[u] + w, set dist[v] = dist[u] + w. This repeats until all reachable nodes are finalized. This demo uses the teaching O(V²) implementation — a linear scan to pick the minimum each round; a priority queue (heap) lowers that to O((V+E) log V).",
  },
  complexity: {
    time: { best: 'O(V²)', average: 'O(V²)', worst: 'O(V²)' },
    space: 'O(V)',
  },
  prerequisites: ['topological-sort'],
  tags: ['图', '最短路径', '单源最短路', 'Dijkstra', '贪心'],
  inputSpec: {
    name: 'edges',
    kind: 'edge-list',
    maxLen: 10,
    aux: { name: { zh: '起点 start', en: 'Start node' }, kind: 'int', min: 0, max: 20, default: 0 },
  },
  defaultInput: '0->1:4, 0->2:1, 1->3:1, 2->1:2, 2->3:5',
  presets: [
    { name: { zh: '教材经典图', en: 'Textbook classic graph' }, input: '0->1:4, 0->2:1, 1->3:1, 2->1:2, 2->3:5' },
    { name: { zh: '无向加权图', en: 'Undirected weighted graph' }, input: '0-1:4, 0-2:1, 1-3:1, 2-1:2, 2-3:5' },
    { name: { zh: '链式结构', en: 'Chain' }, input: '0->1:2, 1->2:3, 2->3:4' },
  ],
  boundaryCases: [
    { name: { zh: '两节点一条边', en: 'Two nodes, one edge' }, input: '0->1:3' },
    { name: { zh: '链式结构', en: 'Chain' }, input: '0->1:1, 1->2:2' },
    { name: { zh: '含不可达节点', en: 'Graph with unreachable nodes' }, input: '0->1:2, 2->3:1' },
  ],
  runnerId: 'dijkstra',
  visualKind: 'graph',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '负权边导致结果错误', en: 'Negative edge weights break the result' },
      detail: {
        zh: 'Dijkstra 依赖"已确定节点的距离不会再变小"这一性质，它只在边权非负时成立。存在负权边时可能出错：例如 0→1:2、0→2:3、2→1:-2，算法先确定 1（dist=2），随后才经 2 发现 0→2→1=1 更短，但 1 已固化，返回错误答案 2。含负权边的最短路应改用 Bellman-Ford。',
        en: "Dijkstra relies on the property that a finalized node's distance never shrinks, which holds only for non-negative weights. With a negative edge (e.g. 0→1:2, 0→2:4, 1→2:-3), a finalized distance can still be improved later, so the greedy choice is wrong. Use Bellman-Ford (or SPFA with negative-cycle detection) instead.",
      },
    },
    {
      title: { zh: '距离初始化为 INF、起点为 0 写反', en: 'Swapping INF initialization and source 0' },
      detail: {
        zh: 'dist 数组必须初始化为"足够大的 ∞"，再把 dist[起点] 置 0。若写反——把全部初始化为 0、起点置 ∞——算法一开始就会选中一个距离为 0 的错误节点，起点永远无法被正确确定。本演示中未到达节点显示 ∞，起点显示 d=0。',
        en: 'The dist array must start as a large ∞, then set dist[source]=0. If reversed — everything 0 and the source ∞ — the algorithm immediately picks a wrong distance-0 node and the source is never finalized. Here unreached nodes show ∞ and the source shows d=0.',
      },
      code: 'dist[start] = 0;  // 其余必须初始化为 INF，不是 0',
    },
    {
      title: { zh: '每轮必须选"未确定"中最小', en: 'Each round must pick the smallest among undetermined nodes' },
      detail: {
        zh: '关键约束是：只能从"尚未确定"的节点中选距离最小者，且选后立即标记为已确定、不再回头。若误把已确定节点也纳入候选（或选错成"随便一个未确定节点"），贪心正确性就被破坏。教学版每轮 O(V) 线性扫描选最小，总复杂度 O(V²)；用优先队列维护候选可优化为 O((V+E) log V)。',
        en: 'The crucial rule is to pick the smallest-distance node only among the still-undetermined nodes, then finalize it immediately and never revisit it. Including already-finalized nodes (or picking an arbitrary undetermined node) destroys the greedy correctness. The teaching version scans linearly each round for O(V²) total; a priority queue over candidates optimizes to O((V+E) log V).',
      },
      code: 'if (!done[v] && (u == -1 || dist[v] < dist[u])) u = v;  // 只看未确定节点',
    },
  ],
};
