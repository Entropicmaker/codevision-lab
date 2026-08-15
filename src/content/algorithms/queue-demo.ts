import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <queue>
using namespace std;

// 队列演示：依次入队，再依次出队，验证 FIFO（先进先出）
void queueDemo(const vector<int>& values) {   //>func
    queue<int> q;                             //>init
    for (int v : values) {                    //>enqueue-loop
        q.push(v);                            //>enqueue
    }
    while (!q.empty()) {                      //>dequeue-loop
        cout << q.front() << " ";             //>dequeue
        q.pop();
    }
}                                             //>end`;

const csharpSource = `using System;
using System.Collections.Generic;

class QueueDemo
{
    // 队列演示：依次入队，再依次出队，验证 FIFO（先进先出）
    static void QueueDemoMethod(List<int> values) {  //>func
        Queue<int> q = new Queue<int>();             //>init
        foreach (int v in values) {                  //>enqueue-loop
            q.Enqueue(v);                            //>enqueue
        }
        while (q.Count > 0) {                        //>dequeue-loop
            Console.Write(q.Dequeue() + " ");        //>dequeue
        }
    }                                                //>end
}`;

const pythonSource = `from collections import deque

# 队列演示：依次入队，再依次出队，验证 FIFO（先进先出）
def queue_demo(values):           #>func
    q = deque()                   #>init
    for v in values:              #>enqueue-loop
        q.append(v)               #>enqueue
    while q:                      #>dequeue-loop
        print(q.popleft(), end=" ")  #>dequeue
    # 完成                        #>end`;

const pseudocode = `queueDemo(values):                  #>func
  q = 空队列                         #>init
  for v in values:                  #>enqueue-loop
    q.enqueue(v)                    #>enqueue
  while q 非空:                      #>dequeue-loop
    print(q.dequeue())              #>dequeue
  # 完成                            #>end`;

export const queueDemoMeta: AlgorithmMeta = {
  id: 'queue-demo',
  name: { zh: '队列（Queue）演示', en: 'Queue Demo' },
  category: 'queue',
  difficulty: 'easy',
  description: {
    zh: '队列是一种先进先出（FIFO）的线性数据结构：新元素从队尾入队（enqueue），从队首出队（dequeue）。队列常用容量固定的循环数组实现，通过 front / rear 下标配合取模运算复用空间。本演示将输入序列依次入队、再依次出队，直观展示"先进先出"；入队/出队均为 O(1)。',
    en: 'A queue is a FIFO (First In, First Out) linear data structure: new elements are enqueued at the rear and dequeued from the front. Queues are often implemented with a fixed-capacity circular array, reusing space via front/rear indices and modulo arithmetic. This demo enqueues the input sequence and then dequeues it all, showing the FIFO order; both operations are O(1).',
  },
  complexity: {
    time: { best: 'O(1) 单次 · O(n) 整体', average: 'O(1) 单次 · O(n) 整体', worst: 'O(1) 单次 · O(n) 整体' },
    space: 'O(n)',
  },
  prerequisites: [],
  tags: ['队列', 'FIFO', '数据结构', '入门'],
  inputSpec: {
    name: 'values',
    kind: 'int-array',
    minLen: 0,
    maxLen: 8,
    valueMin: 0,
    valueMax: 99,
    allowEmpty: true,
  },
  defaultInput: '3, 7, 2, 9, 5',
  presets: [
    { name: { zh: '升序入队', en: 'Ascending enqueue' }, input: '1, 2, 3, 4' },
    { name: { zh: '逆序入队', en: 'Descending enqueue' }, input: '5, 4, 3, 2, 1' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单元素', en: 'Single element' }, input: '7' },
    { name: { zh: '满容量（8 个）', en: 'Full capacity (8)' }, input: '1, 2, 3, 4, 5, 6, 7, 8' },
  ],
  runnerId: 'queue-demo',
  visualKind: 'queue',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '对空队列执行 dequeue（下溢）', en: 'Dequeuing from an empty queue (underflow)' },
      detail: {
        zh: '当队列为空时执行 dequeue 会下溢：队首不存在。出队前必须先判断队列是否为空（isEmpty 或 size == 0），否则程序会崩溃或读到垃圾值。',
        en: 'Dequeuing from an empty queue causes underflow: there is no front element. Always check emptiness (isEmpty or size == 0) before dequeuing, otherwise the program may crash or read garbage.',
      },
      code: 'if (q.empty()) return;   // 先判空\nint v = q.front(); q.pop();',
    },
    {
      title: { zh: '循环数组忘记取模：rear = (rear + 1) % capacity', en: 'Forgetting modulo in a circular array: rear = (rear + 1) % capacity' },
      detail: {
        zh: '循环队列中 front / rear 到达数组末尾后要回到下标 0。入队时若只写 rear+1 而不取模，会越界写入或覆盖已有元素；判断空/满也要依据 size，而不是 front == rear（该条件在循环队列中无法区分空与满）。',
        en: 'In a circular queue, front/rear wrap back to index 0 after reaching the end. Writing rear+1 without modulo causes out-of-bounds writes or overwrites existing elements; detect empty/full with size, since front == rear cannot distinguish them in a circular queue.',
      },
      code: 'rear = (rear + 1) % capacity;\narr[rear] = v;',
    },
    {
      title: { zh: '出队后不移动 front，造成"假溢出"', en: 'Not advancing front after dequeue, causing "fake overflow"' },
      detail: {
        zh: '若出队时只把队首元素置空而不移动 front，队列空间看似被"卡死"在末尾，明明有空位却判为满（假溢出）。出队应让 front 循环前进：front = (front + 1) % capacity。',
        en: 'If dequeue only clears the front slot without advancing front, the space seems stuck at the end and the queue reports full while slots are free (fake overflow). Dequeue should advance front circularly: front = (front + 1) % capacity.',
      },
    },
  ],
};
