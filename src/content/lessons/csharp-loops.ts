import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {
    int n = 10, sum = 0;
    for (int i = 1; i <= n; i++) {  //>cppFor
        if (i % 2 == 0)
            sum += i;
    }
    cout << sum << endl;            // 30
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        // if / else if / else
        int score = 85;
        if (score >= 90)                    //>if
            Console.WriteLine("A");
        else if (score >= 60)
            Console.WriteLine("B");
        else
            Console.WriteLine("C");

        // switch 表达式（C# 8+）
        string grade = score switch         //>switch
        {
            >= 90 => "A",
            >= 60 => "B",
            _ => "C",
        };
        Console.WriteLine(grade);

        // for：累加 1..n 中的偶数
        int n = 10, sum = 0;
        for (int i = 1; i <= n; i++)        //>for
        {
            if (i % 2 == 0)                 //>even
                sum += i;
        }
        Console.WriteLine(sum);             // 30

        // foreach：遍历数组
        int[] nums = { 2, 4, 6 };
        foreach (int x in nums)             //>foreach
            Console.WriteLine(x);

        // while
        int j = 1;
        while (j <= 3)                      //>while
        {
            Console.WriteLine(j);
            j++;
        }
    }
}`;

const pythonSource = `n = 10
total = 0
for i in range(1, n + 1):   #>pyFor
    if i % 2 == 0:
        total += i
print(total)                #>pyPrint  30

# 更 Pythonic：sum(range(2, n + 1, 2))`;

export const csharpLoopsLesson: LessonMeta = {
  id: 'csharp-loops',
  language: 'csharp',
  chapterId: 'conditionals-loops',
  title: { zh: '条件与循环', en: 'Conditionals & Loops' },
  difficulty: 'easy',
  prerequisites: ['csharp-operators'],
  concept: [
    '条件语句让程序根据状态选择执行路径：if 判断一个 bool 条件，else if 补充多个分支，else 兜底。C# 要求条件必须是 bool 类型，不能像 C++ 那样把非零整数当"真"。',
    'switch 适合对同一个值做多分支判断；C# 8 引入 switch 表达式，把"选择"写成"求值表达式"，更简洁。C# 的 switch 禁止贯穿（fall-through），每个 case 必须以 break/return 结束，从源头避免了忘记 break 引发的连锁 bug。',
    '循环让代码重复执行：for 适合已知次数，while 适合先判断后执行，do-while 至少执行一次，foreach 专门遍历集合。break 提前退出整个循环，continue 跳过本轮、进入下一次。',
    '循环最容易翻车的两处：死循环（while 忘记更新循环变量）和边界差一（off-by-one，i < n 还是 i <= n）。写完循环，先在脑子里把第一轮和最后一轮各跑一遍。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '条件分支', en: 'Branching' },
      rows: { cpp: 'if / else if / else、switch', csharp: 'if / else if / else、switch 表达式', python: 'if / elif / else（3.10+ 有 match）' },
    },
    {
      aspect: { zh: 'for 循环', en: 'for loop' },
      rows: { cpp: 'for (init; cond; step)', csharp: 'for (init; cond; step)', python: 'for i in range(...)' },
    },
    {
      aspect: { zh: '遍历集合', en: 'Iterating a collection' },
      rows: { cpp: '范围 for (auto x : c)', csharp: 'foreach (var x in c)', python: 'for x in c' },
    },
    {
      aspect: { zh: 'switch 贯穿', en: 'Switch fall-through' },
      rows: { cpp: '允许贯穿（可省略 break）', csharp: '禁止贯穿（每个 case 必须 break/return）', python: 'match 按模式分支' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: 'while 忘更新循环变量导致死循环', en: 'Forgetting to update the loop variable causes an infinite loop' },
      detail: {
        zh: 'while 的条件一旦永远为真，循环就不会结束。务必在循环体里推进循环变量（如 i++）。',
        en: 'If the while condition stays true forever, the loop never ends. Always advance the loop variable inside the body.',
      },
      code: `int i = 0;
while (i < 5)
{
    Console.WriteLine(i);
    // 忘记 i++; → 无限循环
}`,
    },
    {
      title: { zh: 'for 循环边界差一（off-by-one）', en: 'Off-by-one in for loop bounds' },
      detail: {
        zh: '想输出 1..10 时写 i < 10 会少最后一个数；应写 i <= 10。边界是 i < n 还是 i <= n 要明确。',
        en: 'To print 1..10, writing i < 10 misses the last value; use i <= 10. Be explicit about whether the bound is inclusive.',
      },
      code: `// 想输出 1..10，却少一个：i < 10 应改为 i <= 10
for (int i = 1; i < 10; i++)
    Console.WriteLine(i); // 只输出 1..9`,
    },
    {
      title: { zh: 'switch case 漏写 break', en: 'Missing break in a switch case' },
      detail: {
        zh: 'C# 禁止贯穿：每个 case 必须以 break、return 或 throw 结束，否则编译报错 CS0163。',
        en: 'C# forbids fall-through: each case must end with break, return, or throw, or the compiler reports CS0163.',
      },
      code: `switch (x)
{
    case 1:
        Console.WriteLine("one");
        // 漏写 break; → 编译错误 CS0163（C# 禁止贯穿）
}`,
    },
  ],
  exercise: {
    prompt: {
      zh: '给定整数 n，输出 1 到 n 中所有偶数之和。请分别用 for 和 while 两种写法实现。',
      en: 'Given an integer n, print the sum of all even numbers from 1 to n. Implement it with both a for loop and a while loop.',
    },
    hints: ['用 i % 2 == 0 判断偶数', 'for 循环注意边界：i <= n 才包含 n', 'while 版本可让 j 从 2 开始每次 += 2，直接累加偶数'],
    answer: `// for 版本
int n = 10, sum = 0;
for (int i = 1; i <= n; i++)
    if (i % 2 == 0)
        sum += i;
Console.WriteLine(sum); // 2+4+6+8+10 = 30

// while 版本
int j = 2, sum2 = 0;
while (j <= n)
{
    sum2 += j;
    j += 2; // 直接跳到下一个偶数
}
Console.WriteLine(sum2);`,
  },
};
