import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <queue>
#include <iostream>
using namespace std;

// 广度优先搜索：从 start 出发逐层扩散（队列实现）
void bfs(const vector<vector<int>>& adj, int start) {  //>func
    int n = (int)adj.size();                           //>init
    vector<bool> visited(n, false);
    vector<int> dist(n, -1);
    queue<int> q;
    visited[start] = true;                             //>enqueue-start
    dist[start] = 0;                                   // 起点距离为 0
    q.push(start);                                     // 起点入队
    while (!q.empty()) {                               //>dequeue
        int u = q.front(); q.pop();                    // 出队
        cout << u << " ";                              //>visit
        for (int v : adj[u]) {                         //>check-edge
            if (!visited[v]) {                         //>enqueue-next
                visited[v] = true;
                dist[v] = dist[u] + 1;                 // 距离 +1
                q.push(v);                             // 邻居入队
            }
        }
    }
}                                                      //>end`;

const csharpSource = `using System;
using System.Collections.Generic;

class GraphBfsDemo
{
    // 广度优先搜索：从 start 出发逐层扩散（队列实现）
    static void Bfs(List<List<int>> adj, int start) {  //>func
        int n = adj.Count;                             //>init
        bool[] visited = new bool[n];
        int[] dist = new int[n];
        Array.Fill(dist, -1);
        Queue<int> q = new Queue<int>();
        visited[start] = true;                         //>enqueue-start
        dist[start] = 0;                               // 起点距离为 0
        q.Enqueue(start);                              // 起点入队
        while (q.Count > 0) {                          //>dequeue
            int u = q.Dequeue();                       // 出队
            Console.Write(u + " ");                    //>visit
            foreach (int v in adj[u]) {                //>check-edge
                if (!visited[v]) {                     //>enqueue-next
                    visited[v] = true;
                    dist[v] = dist[u] + 1;             // 距离 +1
                    q.Enqueue(v);                      // 邻居入队
                }
            }
        }
    }                                                  //>end
}`;

const pythonSource = `from collections import deque

# 广度优先搜索：从 start 出发逐层扩散（队列实现）
def bfs(adj, start):                    #>func
    n = len(adj)                        #>init
    visited = [False] * n
    dist = [-1] * n
    q = deque([start])                  # 起点入队
    visited[start] = True               #>enqueue-start
    dist[start] = 0                     # 起点距离为 0
    while q:                            #>dequeue
        u = q.popleft()                 # 出队
        print(u, end=" ")               #>visit
        for v in adj[u]:                #>check-edge
            if not visited[v]:          #>enqueue-next
                visited[v] = True
                dist[v] = dist[u] + 1   # 距离 +1
                q.append(v)             # 邻居入队
    # 遍历完成                          #>end`;

const pseudocode = `bfs(adj, start):                 #>func
  n = len(adj)                   #>init
  visited = [false] * n          # 初始化访问标记
  dist = [-1] * n                # 距离数组
  q = empty queue
  visited[start] = true          #>enqueue-start
  dist[start] = 0                # 起点距离为 0
  enqueue(q, start)              # 起点入队
  while not empty(q):            #>dequeue
    u = dequeue(q)               # 出队
    output u                     #>visit
    for v in adj[u]:             #>check-edge
      if not visited[v]:         #>enqueue-next
        visited[v] = true
        dist[v] = dist[u] + 1    # 距离 +1
        enqueue(q, v)            # 邻居入队
  # 遍历完成                     #>end`;

export const bfsMeta: AlgorithmMeta = {
  id: 'bfs',
  name: { zh: '广度优先搜索（图）', en: 'Breadth-First Search (Graph)' },
  category: 'graph',
  difficulty: 'medium',
  description: {
    zh: '广度优先搜索从起点出发，按"层"向外逐层扩散：先访问距离为 1 的所有节点，再访问距离为 2 的节点，以此类推。它用队列维护待访问节点，天然给出无权图中从起点到各节点的最短路径距离。',
    en: 'Breadth-first search starts from a source node and expands layer by layer: first all nodes at distance 1, then distance 2, and so on. It uses a queue to hold pending nodes and naturally yields shortest-path distances from the source in unweighted graphs.',
  },
  complexity: {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
  },
  prerequisites: [],
  tags: ['图', '广度优先', '队列', '最短路径'],
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
  runnerId: 'bfs',
  visualKind: 'graph',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '入队前不标记导致重复入队', en: 'Not marking nodes on enqueue causes duplicates' },
      detail: {
        zh: 'BFS 必须在"入队"时就标记 visited，而不是等到出队时。否则同一节点会被多个邻居重复入队，队列膨胀、序列重复。本演示中节点一入队就变蓝并标距离。',
        en: 'BFS must mark visited when a node is enqueued, not when it is dequeued. Otherwise the same node gets enqueued multiple times by different neighbors, bloating the queue and duplicating the order. Here nodes turn blue with their distance as soon as they are enqueued.',
      },
      code: 'visited[v] = true; q.push(v);  // 入队即标记',
    },
    {
      title: { zh: '用栈代替队列变成 DFS', en: 'Using a stack instead of a queue turns BFS into DFS' },
      detail: {
        zh: '若用栈（后进先出）代替队列维护待访问节点，遍历会立刻深入最近发现的节点，行为退化为深度优先，层级距离也不再有"逐层扩散"的意义。',
        en: 'If a stack (LIFO) replaces the queue, the traversal immediately dives into the most recently discovered node, degenerating into depth-first behavior and destroying the layer-by-layer distance property.',
      },
      code: 'queue<int> q;  // BFS 必须用队列，先进先出',
    },
    {
      title: { zh: '忘记记录距离/层级', en: 'Forgetting to record distances' },
      detail: {
        zh: 'BFS 的一大价值是给出无权图最短路径距离：dist[v] = dist[u] + 1。若忘记记录，就失去了 BFS 相对 DFS 的核心优势。',
        en: 'A key value of BFS is shortest-path distances in unweighted graphs: dist[v] = dist[u] + 1. Without recording distances, BFS loses its core advantage over DFS.',
      },
    },
  ],
};
