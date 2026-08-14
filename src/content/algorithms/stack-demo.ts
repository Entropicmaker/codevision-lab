import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <vector>
using namespace std;

// 栈演示：依次入栈，再依次出栈，验证 LIFO（后进先出）
void stackDemo(const vector<int>& values) {   //>func
    vector<int> s;                            //>init
    for (int v : values) {                    //>push-loop
        s.push_back(v);                       //>push
    }
    while (!s.empty()) {                      //>pop-loop
        cout << s.back() << " ";              //>pop
        s.pop_back();
    }
}                                             //>end`;

const csharpSource = `using System;
using System.Collections.Generic;

class StackDemo
{
    // 栈演示：依次入栈，再依次出栈，验证 LIFO（后进先出）
    static void StackDemoMethod(List<int> values) {  //>func
        Stack<int> s = new Stack<int>();             //>init
        foreach (int v in values) {                  //>push-loop
            s.Push(v);                               //>push
        }
        while (s.Count > 0) {                        //>pop-loop
            Console.Write(s.Pop() + " ");            //>pop
        }
    }                                                //>end
}`;

const pythonSource = `# 栈演示：依次入栈，再依次出栈，验证 LIFO（后进先出）
def stack_demo(values):            #>func
    s = []                         #>init
    for v in values:               #>push-loop
        s.append(v)                #>push
    while s:                       #>pop-loop
        print(s.pop(), end=" ")    #>pop
    # 完成                         #>end`;

const pseudocode = `stackDemo(values):                  #>func
  s = 空栈                           #>init
  for v in values:                  #>push-loop
    s.push(v)                       #>push
  while s 非空:                      #>pop-loop
    print(s.pop())                  #>pop
  # 完成                            #>end`;

export const stackDemoMeta: AlgorithmMeta = {
  id: 'stack-demo',
  name: { zh: '栈（Stack）演示', en: 'Stack Demo' },
  category: 'stack',
  difficulty: 'easy',
  description: {
    zh: '栈是一种后进先出（LIFO）的线性数据结构：插入（push）与删除（pop）都只在栈顶发生。本演示将输入序列依次压入栈，再依次弹出，直观展示"后进先出"的访问顺序；入栈/出栈均为 O(1)。',
    en: 'A stack is a LIFO (Last In, First Out) linear data structure: insertion (push) and deletion (pop) happen only at the top. This demo pushes the input sequence onto the stack one by one and then pops them all, showing the LIFO access order; both operations are O(1).',
  },
  complexity: {
    time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    space: 'O(n)',
  },
  prerequisites: [],
  tags: ['栈', 'LIFO', '数据结构', '入门'],
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
    { name: { zh: '升序入栈', en: 'Ascending push' }, input: '1, 2, 3, 4' },
    { name: { zh: '逆序入栈', en: 'Descending push' }, input: '5, 4, 3, 2, 1' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单元素', en: 'Single element' }, input: '7' },
    { name: { zh: '满容量（8 个）', en: 'Full capacity (8)' }, input: '1, 2, 3, 4, 5, 6, 7, 8' },
  ],
  runnerId: 'stack-demo',
  visualKind: 'stack',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '对空栈执行 pop（下溢）', en: 'Popping from an empty stack (underflow)' },
      detail: {
        zh: '当栈为空时执行 pop 会下溢：读取到不存在的栈顶。出栈前必须先判断栈是否为空（isEmpty 或 size == 0），否则程序会崩溃或读到垃圾值。',
        en: 'Popping from an empty stack causes underflow and reads a non-existent top. Always check emptiness (isEmpty or size == 0) before popping, otherwise the program may crash or read garbage.',
      },
      code: 'if (s.empty()) return;   // 先判空\nint v = s.top(); s.pop();',
    },
    {
      title: { zh: '用数组下标模拟 top 时维护出错', en: 'Maintaining top incorrectly when simulating a stack with an array index' },
      detail: {
        zh: '用数组实现栈时，top 指向当前栈顶下标（空栈为 -1）。push 必须先 top++ 再写入，pop 必须先取值再 top--。若顺序颠倒或忘记更新 top，会越界访问或读到旧数据。',
        en: 'When implementing a stack with an array, top holds the index of the top element (-1 when empty). Push must increment top before writing; pop must read before decrementing. Wrong order or a stale top causes out-of-bounds access or stale data.',
      },
      code: '// push\ns[++top] = v;\n// pop\nv = s[top--];',
    },
    {
      title: { zh: '把数组头部当栈顶，操作退化为 O(n)', en: 'Treating the array head as the top, degrading operations to O(n)' },
      detail: {
        zh: '若把数组下标 0 当作栈顶，push/pop 需要整体搬移所有元素，退化为 O(n)。栈顶应固定在数组末尾（或维护独立 top 下标），保证 push/pop 都是 O(1)。',
        en: 'If index 0 is treated as the top, push/pop must shift every element, degrading to O(n). Keep the top at the end of the array (or maintain a separate top index) so push/pop stay O(1).',
      },
    },
  ],
};
