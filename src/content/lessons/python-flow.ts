import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {
    int score = 85;
    if (score >= 90) cout << "A";             // 多分支
    else if (score >= 60) cout << "B";
    else cout << "C";
    cout << endl;

    for (int i = 1; i < 5; ++i) cout << i;    // 1 2 3 4（不含 5）
    cout << endl;

    int n = 0;
    while (n < 5) { n++; cout << n; }         // 1 2 3 4 5
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        int score = 85;
        if (score >= 90) Console.Write("A");          // 多分支
        else if (score >= 60) Console.Write("B");
        else Console.Write("C");
        Console.WriteLine();

        for (int i = 1; i < 5; i++) Console.Write(i); // 1 2 3 4（不含 5）
        Console.WriteLine();

        int n = 0;
        while (n < 5) { n++; Console.Write(n); }      // 1 2 3 4 5
    }
}`;

const pythonSource = `# if/elif/else：多分支条件
score = 85
if score >= 90:         #>if
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"
print(grade)            # B

# for 遍历可迭代对象；range(start, stop) 左闭右开
for i in range(1, 5):   #>range
    print(i)            # 1 2 3 4（不含 5）

# while + break/continue
n = 0
while True:             #>while
    n += 1
    if n > 5:
        break           # 跳出循环
    if n % 2 == 0:
        continue        # 跳过本次
    print(n)            # 1 3 5

# for-else：循环未被 break 打断才执行 else
for x in [1, 2, 3]:     #>forelse
    if x == 4:
        break
else:
    print("未中断")      #>elseblock`;

export const pythonFlowLesson: LessonMeta = {
  id: 'python-flow',
  language: 'python',
  chapterId: 'conditionals-loops',
  title: { zh: '条件与循环', en: 'Conditionals & loops' },
  difficulty: 'easy',
  prerequisites: ['python-primitives'],
  concept: [
    '条件分支用 if / elif / else：elif 相当于 C++/C# 的 else if，各分支按顺序判断，命中一个就跳过其余。冒号引出代码块，缩进决定分支归属。',
    'for 循环直接遍历可迭代对象（列表、字符串、range 等），不需要下标；要下标时用 enumerate()。range(start, stop, step) 生成左闭右开区间，range(n) 即 0 到 n-1。',
    'while 在条件为真时反复执行，适合"未知次数"的循环；必须确保条件最终变假，否则死循环。break 立即跳出，continue 跳过本次剩余语句进入下一轮。',
    'Python 的 for/while 都可带 else 子句：只有循环"自然结束"（未被 break 打断）才执行 else。这是 Python 特有且最常被误解的语法之一。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '多分支', en: 'Multi-way branch' },
      rows: { cpp: 'if / else if / else', csharp: 'if / else if / else', python: 'if / elif / else' },
    },
    {
      aspect: { zh: '计数循环', en: 'Counting loop' },
      rows: { cpp: 'for (int i=0; i<n; i++)', csharp: 'for (int i=0; i<n; i++)', python: 'for i in range(n)' },
    },
    {
      aspect: { zh: '遍历集合', en: 'Iterate a collection' },
      rows: { cpp: 'for (auto x : c)', csharp: 'foreach (var x in c)', python: 'for x in c' },
    },
    {
      aspect: { zh: '循环 else 子句', en: 'Loop else clause' },
      rows: { cpp: '无', csharp: '无', python: 'for/while-else（未 break 才执行）' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: 'range 右端点不含（off-by-one）', en: 'range stop is exclusive' },
      detail: {
        zh: 'range(1, 5) 只生成 1 2 3 4，不含 5。想包含 n 要写 range(1, n + 1)。',
        en: 'range(1, 5) yields 1 2 3 4, not 5. To include n, write range(1, n + 1).',
      },
      code: `for i in range(1, 5):
    print(i)   # 1 2 3 4（不含 5）`,
    },
    {
      title: { zh: 'while 忘更新条件导致死循环', en: 'Infinite loop from a missing update' },
      detail: {
        zh: '循环体内没有改变条件变量的语句，条件永远为真。务必在循环里推进 i 或用 break。',
        en: 'Nothing in the loop body changes the condition variable, so it stays true forever. Advance the variable or break.',
      },
      code: `i = 0
while i < 5:
    print(i)   # 忘记 i += 1 → 死循环`,
    },
    {
      title: { zh: '误解 for-else 的语义', en: 'Misreading for-else' },
      detail: {
        zh: 'else 不是"循环结束后总执行"，而是"未被 break 打断才执行"。break 跳出时 else 会被跳过。',
        en: 'The else runs only when the loop completes without break; a break skips it.',
      },
      code: `for x in [1, 2]:
    if x == 2:
        break
else:
    print("没找到")   # 发生了 break，else 不执行`,
    },
  ],
  exercise: {
    prompt: {
      zh: '对 1 到 20 的每个整数：能被 3 整除打印 "Fizz"，能被 5 整除打印 "Buzz"，同时能被 3 和 5 整除打印 "FizzBuzz"，否则打印数字本身。',
      en: 'For each integer from 1 to 20: print "Fizz" if divisible by 3, "Buzz" if divisible by 5, "FizzBuzz" if divisible by both, otherwise print the number.',
    },
    hints: ['for i in range(1, 21)', '先判断 i % 15 == 0（同时被 3 和 5 整除）', '用 if / elif / else 链'],
    answer: `for i in range(1, 21):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,
  },
};
