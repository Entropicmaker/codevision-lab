import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 3; i++) {        //>for      初始化；条件；步进
        cout << "i = " << i << endl;
    }

    int n = 0;
    while (n < 3) {                        //>while    先判断再执行
        cout << "n = " << n << endl;
        n++;                               //>step     别忘更新循环变量
    }

    int m = 0;
    do {                                   //>dowhile  先执行一次再判断
        cout << "m = " << m << endl;
        m++;
    } while (m < 0);                       // 条件一开始就为假，也执行了一次

    for (int i = 1; i <= 3; i++) {         //>nested   嵌套循环：外层每步，内层跑完一轮
        for (int j = 1; j <= 3; j++) {
            cout << i << "*" << j << "=" << i * j << "\\t";
        }
        cout << endl;
    }
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        for (int i = 1; i <= 3; i++)
            Console.WriteLine($"i = {i}");

        int n = 0;
        while (n < 3)
        {
            Console.WriteLine($"n = {n}");
            n++;
        }
    }
}`;

const pythonSource = `for i in range(1, 4):   # 左闭右开：1,2,3
    print(f"i = {i}")

n = 0
while n < 3:
    print(f"n = {n}")
    n += 1`;

export const cppLoopsLesson: LessonMeta = {
  id: 'cpp-loops',
  language: 'cpp',
  chapterId: 'loops',
  title: { zh: 'for、while、do-while', en: 'for, while, do-while' },
  difficulty: 'easy',
  prerequisites: ['cpp-vars', 'cpp-conditionals'],
  concept: [
    '循环让同一段代码重复执行多次。for 循环把"初始化、条件、步进"三件事集中在一行：for (int i = 1; i <= n; i++) 依次表示从 1 开始、i 超过 n 时停止、每轮结束后 i 加 1。它最适合"次数已知"的重复。',
    'while 循环只在开头判断条件：条件为真就执行循环体，再回到开头重新判断。它适合"次数未知、按某个条件继续"的场景。关键是要在循环体里推动条件向"假"变化，否则会变成死循环。',
    'do-while 和 while 的唯一区别是判断时机：先执行一次循环体，再判断条件。因此它至少执行一次，适合"先做一遍、再看要不要继续"的场景，比如反复读入直到输入合法。',
    'break 立即跳出整个循环，continue 跳过本轮剩余部分、直接进入下一轮。嵌套循环时，break/continue 只作用于它所在的最内层循环；外层循环体每执行一步，内层循环都要完整跑一轮——这是九九乘法表这类"二维遍历"的基础。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '计数循环', en: 'Counting loop' },
      rows: { cpp: 'for (int i=1; i<=n; i++)', csharp: 'for (int i=1; i<=n; i++)', python: 'for i in range(1, n+1)' },
    },
    {
      aspect: { zh: '条件循环', en: 'Conditional loop' },
      rows: { cpp: 'while (cond)', csharp: 'while (cond)', python: 'while cond:' },
    },
    {
      aspect: { zh: '至少执行一次', en: 'Run at least once' },
      rows: { cpp: 'do { } while (cond);', csharp: 'do { } while (cond);', python: '无（用 while True + break 模拟）' },
    },
    {
      aspect: { zh: '跳出 / 跳过', en: 'Break / continue' },
      rows: { cpp: 'break / continue', csharp: 'break / continue', python: 'break / continue' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '边界差一（off-by-one）', en: 'Off-by-one boundary error' },
      detail: {
        zh: 'for (i = 0; i <= n; i++) 会执行 n+1 次，用 < n 才是 n 次。写循环前想清楚：从 0 还是 1 开始、用 < 还是 <=。',
        en: 'for (i = 0; i <= n; i++) runs n+1 times; use < n for exactly n iterations. Decide clearly whether to start at 0 or 1 and whether to use < or <=.',
      },
      code: 'for (int i = 0; i <= n; i++)  // 执行 n+1 次\nfor (int i = 0; i < n; i++)   // 执行 n 次',
    },
    {
      title: { zh: 'while 忘记更新变量导致死循环', en: 'Forgetting to update the variable makes while loop forever' },
      detail: {
        zh: '如果循环体从不改变条件用到的变量，条件永远为真，程序会卡死。确保每轮迭代都朝"条件变假"的方向推进。',
        en: 'If the body never changes the variable in the condition, the condition stays true and the program hangs. Make each iteration move toward a false condition.',
      },
      code: 'int i = 0;\nwhile (i < 10) {\n    cout << i << endl;\n    // 忘了 i++，死循环！\n}',
    },
    {
      title: { zh: '忽略 do-while 至少执行一次', en: 'Overlooking that do-while runs at least once' },
      detail: {
        zh: 'do-while 先执行循环体、后判断条件，因此即使条件一开始就为假也会执行一次。用它处理"至少要运行一遍"的场景（如输入校验）。',
        en: 'do-while runs the body before checking the condition, so it executes at least once even if the condition is false from the start. Use it for "must run at least once" cases like input validation.',
      },
      code: 'do {\n    cout << "至少一次" << endl;\n} while (false);  // 仍然输出一次',
    },
  ],
  exercise: {
    prompt: {
      zh: '用两层 for 循环输出九九乘法表（1×1 到 9×9），每项形如 "i*j=结果"，用制表符或空格对齐，每行结束后换行。',
      en: 'Print the 9×9 multiplication table (1×1 through 9×9) with nested for loops, formatting each cell as "i*j=result" and breaking the line after each row.',
    },
    hints: ['外层循环 i 从 1 到 9，控制行', '内层循环 j 从 1 到 9，控制每行的列', '每行结束用 cout << endl; 换行'],
    answer: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 9; i++) {
        for (int j = 1; j <= 9; j++) {
            cout << i << "*" << j << "=" << i * j << "\\t";
        }
        cout << endl;
    }
    return 0;
}`,
  },
};
