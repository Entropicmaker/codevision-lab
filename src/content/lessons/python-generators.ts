import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

// C++：没有 yield 生成器；用"惰性迭代"思想手写迭代器或一次性计算
long long fib(int n) {          // 一次性计算版本
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        long long t = a + b;
        a = b;
        b = t;
    }
    return a;
}

int main() {
    for (int i = 0; i < 10; ++i)
        cout << fib(i) << " ";   // 0 1 1 2 3 5 8 13 21 34
    return 0;
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class Program
{
    // C#：yield return 实现迭代器（惰性）
    static IEnumerable<long> Fib(int n)
    {
        long a = 0, b = 1;
        for (int i = 0; i < n; i++)
        {
            yield return a;
            (a, b) = (b, a + b);
        }
    }

    static void Main()
    {
        foreach (var x in Fib(10))
            Console.Write(x + " ");  // 0 1 1 2 3 5 8 13 21 34
    }
}`;

const pythonSource = `# 生成器函数：包含 yield，调用时返回生成器对象（惰性）
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        yield a          # 产出后暂停，状态保留
        a, b = b, a + b

gen = fib(10)
print(next(gen))         # 0 —— 每次 next 恢复执行到下一个 yield
print(next(gen))         # 1
print(list(fib(6)))      # [0, 1, 1, 2, 3, 5]`;

export const pythonGeneratorsLesson: LessonMeta = {
  id: 'python-generators',
  language: 'python',
  chapterId: 'generators',
  title: { zh: '生成器（yield）', en: 'Generators & yield' },
  difficulty: 'medium',
  prerequisites: ['python-containers'],
  concept: [
    '生成器是"可以暂停和恢复的函数"：函数体内出现 yield 时，调用它不会立即执行，而是返回一个生成器对象；每次 next() 执行到下一个 yield，把值产出并暂停，期间局部变量与执行位置都被保留。',
    '生成器的核心价值是惰性求值：不需要一次性把全部结果算出来放进内存。fib(10**6) 这种生成器在未消费时几乎不占内存，非常适合处理大序列、数据流。',
    'yield 的执行流程：第一次 next() 开始执行到 yield → 暂停并返回值；再次 next() 从暂停处继续；函数自然结束时抛 StopIteration（for 循环会自动处理）。',
    '与列表对比：list(fib(6)) 一次性物化；gen = fib(6) 逐个消费。理解生成器的暂停/恢复模型，是学习 async/await（协程本质上是生成器的演进）的前置。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '惰性序列', en: 'Lazy sequence' },
      rows: { cpp: '迭代器 / 手写惰性结构', csharp: 'yield return（迭代器）', python: 'yield（生成器）' },
    },
    {
      aspect: { zh: '逐个取值', en: 'Pull one value' },
      rows: { cpp: '++it 解引用', csharp: 'foreach / GetEnumerator()', python: 'next(gen)' },
    },
    {
      aspect: { zh: '结束信号', en: 'End signal' },
      rows: { cpp: 'it == end()', csharp: 'MoveNext() == false', python: 'StopIteration' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '以为调用生成器函数就会执行', en: 'Expecting the generator body to run on call' },
      detail: {
        zh: 'fib(10) 只是创建生成器对象，函数体一行都没执行。必须用 next() 或 for 消费才会运行。',
        en: 'fib(10) only creates a generator; the body runs lazily when consumed via next() or a for loop.',
      },
    },
    {
      title: { zh: '生成器只能迭代一次', en: 'Generators are single-pass' },
      detail: {
        zh: '生成器被消费完后再次遍历得到空结果。需要多次遍历时，重新调用生成器函数创建新实例，或物化成列表。',
        en: 'Once exhausted, iterating a generator again yields nothing. Call the generator function again for a fresh instance.',
      },
    },
  ],
  exercise: {
    prompt: {
      zh: '写生成器函数 countdown(n)：依次产出 n, n-1, ..., 1；然后用 for 循环打印，再演示第二次遍历为空。',
      en: 'Write a countdown(n) generator yielding n..1; print with a for loop, then show the second pass is empty.',
    },
    hints: ['while n > 0: yield n; n -= 1', '同一个生成器对象第二次 for 无输出'],
    answer: `def countdown(n):
    while n > 0:
        yield n
        n -= 1

gen = countdown(3)
print(list(gen))   # [3, 2, 1]
print(list(gen))   # [] —— 已消费完`,
  },
};
