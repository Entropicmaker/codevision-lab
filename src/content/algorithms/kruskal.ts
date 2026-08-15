import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <array>
#include <algorithm>
#include <iostream>
using namespace std;

// 并查集：find 带路径压缩，union 按根合并
int findRoot(vector<int>& parent, int x) { //>find
    if (parent[x] != x) parent[x] = findRoot(parent, parent[x]);
    return parent[x];
}

// Kruskal 最小生成树：按权排序 + 并查集防环
int kruskal(int n, vector<array<int,3>> edges) { //>func
    vector<int> parent(n);                    //>init
    for (int i = 0; i < n; i++) parent[i] = i; // 每个节点一个集合
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a[2] < b[2]; }); //>sort
    int total = 0, cnt = 0;
    for (auto& e : edges) {                   //>check
        int ru = findRoot(parent, e[0]);
        int rv = findRoot(parent, e[1]);
        if (ru != rv) {
            parent[ru] = rv;                  //>union
            total += e[2];                    //>tree-edge
            cnt++;
        } else {
            // 同一集合：加入会成环，跳过 //>skip
        }
    }
    return cnt == n - 1 ? total : -1;         //>end
}`;

const csharpSource = `using System;
using System.Collections.Generic;
using System.Linq;

class KruskalDemo
{
    // 并查集：find 带路径压缩，union 按根合并
    static int FindRoot(int[] parent, int x) { //>find
        if (parent[x] != x) parent[x] = FindRoot(parent, parent[x]);
        return parent[x];
    }

    // Kruskal 最小生成树：按权排序 + 并查集防环
    static int Kruskal(int n, List<(int u, int v, int w)> edges) { //>func
        int[] parent = new int[n];              //>init
        for (int i = 0; i < n; i++) parent[i] = i; // 每个节点一个集合
        edges = edges.OrderBy(e => e.w).ToList();  //>sort
        int total = 0, cnt = 0;
        foreach (var e in edges) {              //>check
            int ru = FindRoot(parent, e.u);
            int rv = FindRoot(parent, e.v);
            if (ru != rv) {
                parent[ru] = rv;                //>union
                total += e.w;                   //>tree-edge
                cnt++;
            } else {
                // 同一集合：加入会成环，跳过 //>skip
            }
        }
        return cnt == n - 1 ? total : -1;       //>end
    }
}`;

const pythonSource = `# 并查集：find 带路径压缩，union 按根合并
def find_root(parent, x):                #>find
    if parent[x] != x:
        parent[x] = find_root(parent, parent[x])
    return parent[x]

# Kruskal 最小生成树：按权排序 + 并查集防环
def kruskal(n, edges):                   #>func
    parent = list(range(n))              #>init
    edges.sort(key=lambda e: e[2])       #>sort
    total = 0
    cnt = 0
    for u, v, w in edges:                #>check
        ru = find_root(parent, u)
        rv = find_root(parent, v)
        if ru != rv:
            parent[ru] = rv              #>union
            total += w                   #>tree-edge
            cnt += 1
        else:                            #>skip
            pass                         # 同一集合：加入会成环，跳过
    return total if cnt == n - 1 else -1 #>end`;

const pseudocode = `findRoot(parent, x):                     #>find
  if parent[x] != x:
    parent[x] = findRoot(parent, parent[x])
  return parent[x]

kruskal(n, edges):                       #>func
  parent = [0..n-1]                      #>init
  sort edges by weight ascending         #>sort
  total = 0
  cnt = 0
  for (u, v, w) in edges:                #>check
    ru = findRoot(parent, u)
    rv = findRoot(parent, v)
    if ru != rv:                         # 不同集合 → 选入
      parent[ru] = rv                    #>union
      total += w                         #>tree-edge
      cnt += 1
    else:                                #>skip
      skip                               # 同一集合 → 成环跳过
  return total if cnt == n-1 else -1     #>end`;

export const kruskalMeta: AlgorithmMeta = {
  id: 'kruskal',
  name: { zh: 'Kruskal 最小生成树', en: "Kruskal's Minimum Spanning Tree" },
  category: 'graph',
  difficulty: 'medium',
  description: {
    zh: 'Kruskal 算法求无向加权连通图的最小生成树（MST）。它先把所有边按权重升序排序，然后从最轻的边开始逐条尝试加入：用并查集（union-find）判断边两端是否已经连通——若属于不同集合，则选中这条边并合并两端集合；若属于同一集合，加入它会形成环，故跳过。重复直到选中 n-1 条边为止。复杂度由排序主导，为 O(E log E)；带路径压缩与按秩合并的并查集单次操作接近 O(1)。与 Prim 一样，Kruskal 也是贪心算法，但 Prim 从顶点扩张，Kruskal 按边贪心。',
    en: "Kruskal's algorithm computes the minimum spanning tree (MST) of an undirected weighted connected graph. It first sorts all edges by weight ascending, then tries each edge from lightest to heaviest, using a union-find structure to test whether the two endpoints are already connected: if they are in different sets, the edge is selected and the two sets are merged; if they are in the same set, adding it would create a cycle, so it is skipped. This repeats until n-1 edges are selected. Complexity is dominated by sorting, O(E log E); each union-find operation is near O(1) with path compression and union by rank. Like Prim, Kruskal is greedy, but it works edge-by-edge instead of expanding a vertex frontier.",
  },
  complexity: {
    time: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
    space: 'O(V + E)',
  },
  prerequisites: ['prim'],
  tags: ['图', '最小生成树', 'MST', 'Kruskal', '并查集', '贪心'],
  inputSpec: {
    name: 'edges',
    kind: 'edge-list',
    maxLen: 10,
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
  runnerId: 'kruskal',
  visualKind: 'graph',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '忘记先按权重排序', en: 'Forgetting to sort edges by weight' },
      detail: {
        zh: 'Kruskal 的正确性依赖"每次选当前最轻的、不会成环的边"这一贪心性质。若直接按输入顺序处理而不先按权重升序排序，就可能先选中一条重边，错过更优的轻边，得到的总权不再是全局最小。',
        en: "Kruskal's correctness relies on always picking the current lightest edge that does not form a cycle. Processing edges in input order without sorting by weight first may select a heavy edge early and miss a lighter one, so the total weight is no longer globally minimal.",
      },
      code: 'sort(edges, by weight ascending);  // 必须先排序',
    },
    {
      title: { zh: 'find 未做路径压缩退化为 O(n)', en: 'find without path compression degrades to O(n)' },
      detail: {
        zh: '若 find 只是简单地沿 parent 指针一路向上而不做路径压缩（或不做按秩合并），并查集的树可能退化成一条链，单次 find 最坏 O(n)，多次后接近 O(n²)。加入路径压缩（把沿途节点直接挂到根）可让均摊复杂度接近 O(1)。',
        en: 'If find only walks parent pointers upward without path compression (or union by rank), the union-find tree can degenerate into a chain, making each find worst-case O(n) and repeated calls nearly O(n²). Path compression (repointing visited nodes directly to the root) gives near-O(1) amortized cost.',
      },
      code: 'if (parent[x] != x) parent[x] = findRoot(parent, parent[x]);  // 路径压缩',
    },
    {
      title: { zh: '漏掉同集合判断导致成环', en: 'Skipping the same-set check creates cycles' },
      detail: {
        zh: '并查集的核心作用是用"两端是否同集合"来判断加入某条边是否会成环。若省略这一判断、把所有排序后的边都选入，生成图会包含环，不再是 n 个节点 n-1 条边的树，MST 结果错误。同集合的边必须跳过（标红）。',
        en: "The union-find's core job is to check whether an edge's two ends are already in the same set, which detects cycles. Omitting this check and selecting every sorted edge produces a graph with cycles, not a tree of n-1 edges over n nodes, so the MST is wrong. Same-set edges must be skipped (marked red).",
      },
      code: 'if (find(u) != find(v)) { select edge; union; }  // 同集合则跳过',
    },
  ],
};
