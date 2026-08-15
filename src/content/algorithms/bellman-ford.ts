import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <climits>
using namespace std;

// Bellman-Ford：单源最短路，支持负权边，检测负环
vector<int> bellmanFord(int n, const vector<vector<int>>& edges, int start) {  //>func
    const int INF = INT_MAX;                              //>init
    vector<int> dist(n, INF);
    dist[start] = 0;                                      // 起点距离为 0
    for (int round = 1; round <= n - 1; round++) {        //>round
        for (auto& e : edges) {                           //>relax
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != INF && dist[u] + w < dist[v]) { //>update
                dist[v] = dist[u] + w;                    // 松弛更新
            }
        }
    }
    for (auto& e : edges) {                               //>check-cycle
        int u = e[0], v = e[1], w = e[2];
        if (dist[u] != INF && dist[u] + w < dist[v]) {    // 仍可松弛 → 负环
            return {};                                    // 存在负环
        }
    }
    return dist;                                          //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class BellmanFordDemo
{
    // Bellman-Ford：单源最短路，支持负权边，检测负环
    static List<int> BellmanFord(int n, List<int[]> edges, int start) {  //>func
        const int INF = int.MaxValue;                       //>init
        int[] dist = new int[n];
        Array.Fill(dist, INF);
        dist[start] = 0;                                    // 起点距离为 0
        for (int round = 1; round <= n - 1; round++) {      //>round
            foreach (int[] e in edges) {                    //>relax
                int u = e[0], v = e[1], w = e[2];
                if (dist[u] != INF && dist[u] + w < dist[v]) { //>update
                    dist[v] = dist[u] + w;                  // 松弛更新
                }
            }
        }
        foreach (int[] e in edges) {                        //>check-cycle
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != INF && dist[u] + w < dist[v]) {  // 仍可松弛 → 负环
                return new List<int>();                     // 存在负环
            }
        }
        return new List<int>(dist);                         //>end
    }
}`;

const pythonSource = `# Bellman-Ford：单源最短路，支持负权边，检测负环
def bellman_ford(n, edges, start):          #>func
    INF = float('inf')                      #>init
    dist = [INF] * n
    dist[start] = 0                         # 起点距离为 0
    for round in range(1, n):               #>round
        for u, v, w in edges:               #>relax
            if dist[u] != INF and dist[u] + w < dist[v]:  #>update
                dist[v] = dist[u] + w       # 松弛更新
    for u, v, w in edges:                   #>check-cycle
        if dist[u] != INF and dist[u] + w < dist[v]:      # 仍可松弛 → 负环
            return []                       # 存在负环
    return dist                             #>end`;

const pseudocode = `bellmanFord(n, edges, start):          #>func
  INF = +infinity                        #>init
  dist = [INF] * n
  dist[start] = 0                        # 起点距离为 0
  for round in 1..n-1:                   #>round
    for (u, v, w) in edges:              #>relax
      if dist[u] != INF and dist[u] + w < dist[v]:  #>update
        dist[v] = dist[u] + w            # 松弛更新
  for (u, v, w) in edges:                #>check-cycle
    if dist[u] != INF and dist[u] + w < dist[v]:    # 仍可松弛 → 负环
      return empty                       # 存在负环
  return dist                            #>end`;

export const bellmanFordMeta: AlgorithmMeta = {
  id: 'bellman-ford',
  name: { zh: 'Bellman-Ford 最短路', en: 'Bellman-Ford Shortest Path' },
  category: 'graph',
  difficulty: 'hard',
  description: {
    zh: 'Bellman-Ford 算法求单源最短路，与 Dijkstra 不同，它允许负权边，并能检测负权环。核心是"松弛"：对每条边 (u,v,w)，若 dist[u]+w < dist[v] 就更新 dist[v]。算法对全部边重复松弛 V-1 轮（因为任何不含环的最短路径至多 V-1 条边），若第 V 轮仍能松弛，说明存在负权环、最短路无定义。',
    en: "Bellman-Ford computes single-source shortest paths and, unlike Dijkstra, tolerates negative edge weights and detects negative cycles. Its core is 'relaxation': for each edge (u,v,w), update dist[v] to dist[u]+w whenever that is smaller. The algorithm relaxes every edge for V-1 rounds (any simple shortest path has at most V-1 edges); if a V-th round still relaxes anything, a negative cycle exists and shortest paths are undefined.",
  },
  complexity: {
    time: { best: 'O(VE)', average: 'O(VE)', worst: 'O(VE)' },
    space: 'O(V)',
  },
  prerequisites: ['dijkstra'],
  tags: ['图', '最短路', '负权边', '负环', '松弛'],
  inputSpec: {
    name: 'edges',
    kind: 'edge-list',
    maxLen: 10,
    aux: { name: { zh: '起点 start', en: 'Start node' }, kind: 'int', min: 0, max: 20, default: 0 },
  },
  defaultInput: '0->1:4, 0->2:5, 1->2:-3, 2->3:4, 1->3:2',
  presets: [
    { name: { zh: '含负权边（无负环）', en: 'Negative edges, no cycle' }, input: '0->1:4, 0->2:5, 1->2:-3, 2->3:4, 1->3:2' },
    { name: { zh: '负权环', en: 'Negative cycle' }, input: '0->1:1, 1->2:-1, 2->0:-1' },
  ],
  boundaryCases: [
    { name: { zh: '负权环', en: 'Negative cycle' }, input: '0->1:1, 1->2:-1, 2->0:-1' },
    { name: { zh: '单边', en: 'Single edge' }, input: '0->1:5' },
    { name: { zh: '链式', en: 'Chain' }, input: '0->1:2, 1->2:3, 2->3:4' },
  ],
  runnerId: 'bellman-ford',
  visualKind: 'graph',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '忽略负环导致最短路无定义', en: 'Ignoring that negative cycles make shortest paths undefined' },
      detail: {
        zh: '一旦从起点可达一个负权环（总权值为负），沿着环每走一圈距离就更短，可以无限变负，因此"最短路径"不存在。必须在 V-1 轮后再做一轮松弛检测：若仍有边可松弛，就应报告负环而非给出错误的距离。',
        en: 'Once a negative cycle (total weight < 0) is reachable from the source, walking the cycle makes the distance arbitrarily small, so no shortest path exists. After the V-1 rounds you must run one more relaxation pass: if any edge still relaxes, report a negative cycle instead of returning wrong distances.',
      },
      code: 'if (dist[u] + w < dist[v]) { /* 第 V 轮仍可松弛 → 负环 */ }',
    },
    {
      title: { zh: '少跑轮数导致距离错误', en: 'Using fewer than V-1 rounds yields wrong distances' },
      detail: {
        zh: '松弛一次只能把"多一条边"的信息向前传播一层。一条最短路可能含 V-1 条边，因此必须做满 V-1 轮（或检测到某轮无任何更新时提前结束）。只做一轮等价于只看单边，链式路径会被漏掉。',
        en: 'Each relaxation pass propagates information forward by at most one extra edge. A shortest path can contain V-1 edges, so you need all V-1 rounds (or an early exit once a round makes no update). A single pass only sees one-edge paths and misses chains.',
      },
      code: 'for (int round = 1; round <= n - 1; round++) { /* 必须 V-1 轮 */ }',
    },
    {
      title: { zh: '负权边下误用 Dijkstra', en: 'Using Dijkstra with negative edges' },
      detail: {
        zh: 'Dijkstra 依赖"一旦确定节点距离就不再改变"的贪心前提，负权边会破坏它——已被"确定"的节点可能被更晚发现的负路径缩短。负权边场景应改用 Bellman-Ford（或负权无环图用拓扑序 + 一次松弛）。',
        en: "Dijkstra relies on the greedy assumption that a node's distance is final once settled; negative edges break it, since a settled node can later be shortened by a negative path. Use Bellman-Ford for negative weights (or topological-order relaxation on a DAG).",
      },
    },
  ],
};
