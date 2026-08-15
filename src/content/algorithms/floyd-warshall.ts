import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <algorithm>
using namespace std;

const int INF = 1e9;

// Floyd-Warshall 全源最短路：dp[i][j] = 从 i 到 j 的最短距离
vector<vector<int>> floydWarshall(vector<vector<int>> dp, int n) {  //>func
    for (int i = 0; i < n; i++) dp[i][i] = 0;          //>init
    for (int k = 0; k < n; k++) {                      //>loop-k
        for (int i = 0; i < n; i++) {                  //>loop-i
            for (int j = 0; j < n; j++) {              //>loop-j
                if (dp[i][k] + dp[k][j] < dp[i][j]) {  //>relax
                    dp[i][j] = dp[i][k] + dp[k][j];    //>update
                }
            }
        }
    }
    return dp;                                         //>end
}`;

const csharpSource = `using System;

class FloydWarshallDemo
{
    const int INF = int.MaxValue / 2;

    // Floyd-Warshall 全源最短路：dp[i][j] = 从 i 到 j 的最短距离
    static int[,] FloydWarshall(int[,] dp, int n) {     //>func
        for (int i = 0; i < n; i++) dp[i, i] = 0;       //>init
        for (int k = 0; k < n; k++) {                   //>loop-k
            for (int i = 0; i < n; i++) {               //>loop-i
                for (int j = 0; j < n; j++) {           //>loop-j
                    if (dp[i, k] + dp[k, j] < dp[i, j]) {  //>relax
                        dp[i, j] = dp[i, k] + dp[k, j];    //>update
                    }
                }
            }
        }
        return dp;                                      //>end
    }
}`;

const pythonSource = `# Floyd-Warshall 全源最短路：dp[i][j] = 从 i 到 j 的最短距离
def floyd_warshall(dp, n):              #>func
    for i in range(n):                  #>init
        dp[i][i] = 0
    for k in range(n):                  #>loop-k
        for i in range(n):              #>loop-i
            for j in range(n):          #>loop-j
                if dp[i][k] + dp[k][j] < dp[i][j]:    #>relax
                    dp[i][j] = dp[i][k] + dp[k][j]    #>update
    return dp                           #>end`;

const pseudocode = `floydWarshall(dp, n):            #>func
  for i = 0 .. n-1:              #>init
    dp[i][i] = 0
  for k = 0 .. n-1:              #>loop-k
    for i = 0 .. n-1:            #>loop-i
      for j = 0 .. n-1:          #>loop-j
        if dp[i][k] + dp[k][j] < dp[i][j]:   #>relax
          dp[i][j] = dp[i][k] + dp[k][j]     #>update
  return dp                     #>end`;

export const floydWarshallMeta: AlgorithmMeta = {
  id: 'floyd-warshall',
  name: { zh: 'Floyd-Warshall 全源最短路', en: 'Floyd-Warshall All-Pairs Shortest Path' },
  category: 'graph',
  difficulty: 'hard',
  description: {
    zh: 'Floyd-Warshall 用动态规划求所有点对之间的最短距离：dp[i][j] 表示从 i 到 j 的最短距离。初始时对角线为 0、直接边为权、其余为 ∞；随后依次允许节点 0, 1, …, k 作为中间点，用转移 dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j]) 逐步松弛。它支持负权边（但不能有负环），时间复杂度 O(V³)，适合稠密图与"求全源最短距离"的场景。本演示用 DP 距离矩阵表格 + 转移来源箭头可视化三重循环。',
    en: 'Floyd-Warshall computes shortest distances between every pair of vertices via dynamic programming: dp[i][j] is the shortest distance from i to j. Initially the diagonal is 0, direct edges hold their weights, and the rest are ∞; it then allows nodes 0, 1, …, k as intermediates one by one, relaxing with dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j]). It supports negative edges (but no negative cycles), runs in O(V³), and suits dense graphs and all-pairs queries. This demo visualizes the triple loop with a DP distance-matrix table and source arrows.',
  },
  complexity: {
    time: { best: 'O(V³)', average: 'O(V³)', worst: 'O(V³)' },
    space: 'O(V²)',
  },
  prerequisites: ['dijkstra'],
  tags: ['图论', '最短路径', '动态规划', '全源最短路'],
  inputSpec: {
    name: 'edges',
    kind: 'edge-list',
    maxLen: 12,
  },
  defaultInput: '0->1:4, 0->2:1, 1->3:1, 2->1:2, 2->3:5',
  presets: [
    { name: { zh: '有向加权图', en: 'Directed weighted' }, input: '0->1:4, 0->2:1, 1->3:1, 2->1:2, 2->3:5' },
    { name: { zh: '无向加权图', en: 'Undirected weighted' }, input: '0-1:3, 0-2:8, 1-2:1, 1-3:4, 2-3:2' },
    { name: { zh: '含负权边', en: 'Negative edge' }, input: '0->1:4, 0->2:5, 1->2:-3, 2->3:4' },
  ],
  boundaryCases: [
    { name: { zh: '负环', en: 'Negative cycle' }, input: '0->1:1, 1->2:1, 2->0:-3' },
    { name: { zh: '不可达节点', en: 'Unreachable nodes' }, input: '0->1:2, 2->3:1' },
    { name: { zh: '单条边', en: 'Single edge' }, input: '0->1:5' },
  ],
  runnerId: 'floyd-warshall',
  visualKind: 'table',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: 'k 没有放在最外层循环', en: 'k is not the outermost loop' },
      detail: {
        zh: '中间节点 k 必须放在最外层，否则 dp[i][j] 会在"中间节点集合尚未扩展完"时就参与松弛，导致某些路径被漏掉、结果偏大。正确顺序必须是 k → i → j。',
        en: 'The intermediate k must be the outermost loop; otherwise dp[i][j] relaxes before the set of allowed intermediates is fully expanded, missing some paths and overestimating distances. The order must be k → i → j.',
      },
      code: 'for k ... for i ... for j ...',
    },
    {
      title: { zh: '对角线与不可达的初始化错误', en: 'Wrong diagonal / unreachable initialization' },
      detail: {
        zh: '对角线必须初始化为 0（节点到自身距离为 0），不可达边必须初始化为足够大的 ∞，且不能与真实边权混用；否则转移时会算出自环距离或把不可达误判为可达。',
        en: 'The diagonal must be 0 (distance to itself) and unreachable pairs a large enough ∞, kept distinct from real weights; otherwise transitions produce wrong self-distances or mistake unreachable for reachable.',
      },
    },
    {
      title: { zh: '忽略负环导致对角线出现负值', en: 'Ignoring negative cycles (negative diagonal)' },
      detail: {
        zh: '若图存在负环（环上权值和为负），某条 dp[i][i] 会变成负数。Floyd-Warshall 不能处理负环，检测到对角线负值即说明存在负环，此时"最短距离"无定义。',
        en: 'If the graph has a negative cycle (negative total weight), some dp[i][i] becomes negative. Floyd-Warshall cannot handle negative cycles; a negative diagonal entry signals one, and shortest distances are undefined.',
      },
    },
  ],
};
