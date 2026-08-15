import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <climits>
#include <iostream>
using namespace std;

// Prim 最小生成树：顶点扩张，每次选最小 key 的未入树节点（教学版 O(V^2)）
int prim(int n, const vector<vector<pair<int,int>>>& adj, int start) { //>func
    const int INF = INT_MAX;                    //>init
    vector<int> key(n, INF);
    vector<bool> inTree(n, false);
    vector<int> parent(n, -1);
    key[start] = 0;                             // 起点 key 为 0
    int total = 0;
    for (int k = 0; k < n; k++) {
        int u = -1;                             //>select-min
        for (int v = 0; v < n; v++) {           // 选未入树中 key 最小者
            if (!inTree[v] && (u == -1 || key[v] < key[u])) u = v;
        }
        if (u == -1 || key[u] == INF) break;    // 图不连通
        inTree[u] = true;                       //>visit
        if (parent[u] != -1) {                  //>tree-edge
            total += key[u];                    // 树边加入 MST
        }
        for (auto& e : adj[u]) {                //>relax
            int v = e.first, w = e.second;
            if (!inTree[v] && w < key[v]) {     //>update
                key[v] = w;
                parent[v] = u;
            }
        }
    }
    return total;                               //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class PrimDemo
{
    // Prim 最小生成树：顶点扩张，每次选最小 key 的未入树节点（教学版 O(V^2)）
    static int Prim(int n, List<List<(int, int)>> adj, int start) { //>func
        const int INF = int.MaxValue;            //>init
        int[] key = new int[n];
        bool[] inTree = new bool[n];
        int[] parent = new int[n];
        Array.Fill(key, INF);
        Array.Fill(parent, -1);
        key[start] = 0;                          // 起点 key 为 0
        int total = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;                          //>select-min
            for (int v = 0; v < n; v++) {        // 选未入树中 key 最小者
                if (!inTree[v] && (u == -1 || key[v] < key[u])) u = v;
            }
            if (u == -1 || key[u] == INF) break; // 图不连通
            inTree[u] = true;                    //>visit
            if (parent[u] != -1) {               //>tree-edge
                total += key[u];                 // 树边加入 MST
            }
            foreach (var e in adj[u]) {          //>relax
                int v = e.Item1, w = e.Item2;
                if (!inTree[v] && w < key[v]) {  //>update
                    key[v] = w;
                    parent[v] = u;
                }
            }
        }
        return total;                            //>end
    }
}`;

const pythonSource = `import sys

# Prim 最小生成树：顶点扩张，每次选最小 key 的未入树节点（教学版 O(V^2)）
def prim(n, adj, start):                 #>func
    INF = sys.maxsize                    #>init
    key = [INF] * n
    in_tree = [False] * n
    parent = [-1] * n
    key[start] = 0                       # 起点 key 为 0
    total = 0
    for _ in range(n):
        u = -1                           #>select-min
        for v in range(n):               # 选未入树中 key 最小者
            if not in_tree[v] and (u == -1 or key[v] < key[u]):
                u = v
        if u == -1 or key[u] == INF:     # 图不连通
            break
        in_tree[u] = True                #>visit
        if parent[u] != -1:              #>tree-edge
            total += key[u]              # 树边加入 MST
        for v, w in adj[u]:              #>relax
            if not in_tree[v] and w < key[v]:  #>update
                key[v] = w
                parent[v] = u
    return total                         #>end`;

const pseudocode = `prim(n, adj, start):                 #>func
  INF = infinity                     #>init
  key = [INF] * n
  inTree = [false] * n
  parent = [-1] * n
  key[start] = 0                     # 起点 key 为 0
  total = 0
  for k in 0..n-1:
    u = -1                           #>select-min
    for v in 0..n-1:                 # 选未入树中 key 最小者
      if not inTree[v] and (u == -1 or key[v] < key[u]):
        u = v
    if u == -1 or key[u] == INF:     # 图不连通
      break
    inTree[u] = true                 #>visit
    if parent[u] != -1:              #>tree-edge
      total += key[u]                # 树边加入 MST
    for (v, w) in adj[u]:            #>relax
      if not inTree[v] and w < key[v]:  #>update
        key[v] = w
        parent[v] = u
  return total                       #>end`;

export const primMeta: AlgorithmMeta = {
  id: 'prim',
  name: { zh: 'Prim 最小生成树', en: "Prim's Minimum Spanning Tree" },
  category: 'graph',
  difficulty: 'medium',
  description: {
    zh: 'Prim 算法求无向加权连通图的最小生成树（MST）。它维护一个 key 数组，key[v] 表示节点 v 到当前生成树的最小边权；初始 key[起点]=0、其余为 ∞。每轮从"尚未入树"的节点中选出 key 最小者 u，将其加入生成树，然后用 u 的每条邻边 (u,v,w) 松弛 v：若 v 未入树且 w < key[v]，则更新 key[v]=w 并把 parent[v] 记为 u。重复直到所有节点入树，选中的 n-1 条树边（parent[v]-v）构成 MST。本演示采用教学版 O(V²)——每轮线性扫描选最小 key；用优先队列（堆）维护候选可优化到 O(E log V)。',
    en: "Prim's algorithm computes the minimum spanning tree (MST) of an undirected weighted connected graph. It keeps a key array where key[v] is the smallest edge weight connecting v to the current tree; initially key[source]=0 and ∞ elsewhere. Each round it picks the smallest-key node u among those not yet in the tree, adds it, then uses each adjacent edge (u,v,w) to relax v: if v is not in the tree and w < key[v], set key[v]=w and parent[v]=u. This repeats until all nodes are in the tree; the selected n-1 tree edges (parent[v]-v) form the MST. This demo uses the teaching O(V²) implementation — a linear scan to pick the minimum key each round; a priority queue (heap) over candidates optimizes to O(E log V).",
  },
  complexity: {
    time: { best: 'O(V²)', average: 'O(V²)', worst: 'O(V²)' },
    space: 'O(V)',
  },
  prerequisites: ['dijkstra'],
  tags: ['图', '最小生成树', 'MST', 'Prim', '贪心'],
  inputSpec: {
    name: 'edges',
    kind: 'edge-list',
    maxLen: 10,
    aux: { name: { zh: '起点 start', en: 'Start node' }, kind: 'int', min: 0, max: 20, default: 0 },
  },
  defaultInput: '0-1:2, 0-3:6, 1-2:3, 1-3:8, 1-4:5, 2-4:7, 3-4:9',
  presets: [
    { name: { zh: '教材经典图', en: 'Textbook classic graph' }, input: '0-1:2, 0-3:6, 1-2:3, 1-3:8, 1-4:5, 2-4:7, 3-4:9' },
    { name: { zh: '三角形', en: 'Triangle' }, input: '0-1:1, 1-2:1, 0-2:3' },
    { name: { zh: '链式结构', en: 'Chain' }, input: '0-1:2, 1-2:3, 2-3:4' },
  ],
  boundaryCases: [
    { name: { zh: '两节点一条边', en: 'Two nodes, one edge' }, input: '0-1:3' },
    { name: { zh: '链式结构', en: 'Chain' }, input: '0-1:1, 1-2:2' },
    { name: { zh: '三角形', en: 'Triangle' }, input: '0-1:1, 1-2:1, 0-2:3' },
  ],
  runnerId: 'prim',
  visualKind: 'graph',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: 'key 数组初始化错误', en: 'Wrong key array initialization' },
      detail: {
        zh: 'key 数组必须初始化为"足够大的 ∞"，再把 key[起点] 置 0。若写反——全部初始化为 0、起点置 ∞——算法第一轮就会选中一个 key=0 的错误节点，起点反而最后才被选中，结果错误。本演示中起点显示 key=0，其余节点初始显示 key=∞。',
        en: 'The key array must start as a large ∞, then set key[source]=0. If reversed — everything 0 and the source ∞ — the first round picks a wrong key-0 node and the source is chosen last, producing a wrong result. Here the source shows key=0 and all others start as key=∞.',
      },
      code: 'key[start] = 0;  // 其余必须初始化为 INF，不是 0',
    },
    {
      title: { zh: '更新了已入树节点的 key', en: 'Updating the key of an in-tree node' },
      detail: {
        zh: 'Prim 只对"尚未入树"的节点做松弛。已入树节点的 key 已经固定，若继续用邻边更新它们，可能把生成树之外的边误算进来，破坏 MST 的不变量。松弛条件必须带上 !inTree[v] 判断。',
        en: "Prim only relaxes nodes that are not yet in the tree. An in-tree node's key is final; updating it with an adjacent edge could pull in an edge outside the spanning tree and break the MST invariant. The relaxation must check !inTree[v].",
      },
      code: 'if (!inTree[v] && w < key[v]) key[v] = w;  // 只看未入树节点',
    },
    {
      title: { zh: '把 MST 总权算成所有边权之和', en: 'Summing all edge weights instead of tree edges' },
      detail: {
        zh: 'MST 的总权只等于选中的 n-1 条树边的权之和，而不是图中所有边权之和。每轮选入节点 u 时，只累加它对应的树边 parent[u]-u 的权 key[u]；图中其余未选中的边不计入。',
        en: "The MST's total weight equals the sum of only the n-1 selected tree edges, not every edge in the graph. When node u joins the tree, add only its tree edge weight key[u] (parent[u]-u); all unselected edges contribute nothing.",
      },
      code: 'if (parent[u] != -1) total += key[u];  // 只累加树边',
    },
  ],
};
