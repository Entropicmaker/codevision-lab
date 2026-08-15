import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {
    int score = 85;                    //>input   读入或给定一个分数

    if (score >= 90) {                 //>if      第一个分支：≥90
        cout << "A" << endl;
    } else if (score >= 80) {          // 80-89
        cout << "B" << endl;
    } else if (score >= 70) {          // 70-79
        cout << "C" << endl;
    } else if (score >= 60) {          // 60-69
        cout << "D" << endl;
    } else {                           //>else    兜底分支：<60
        cout << "F" << endl;
    }

    char op = 'A';
    switch (op) {                      //>switch  按值多路分支
        case 'A': case 'B':
            cout << "优秀" << endl;
            break;                     // 跳出 switch，防止贯穿
        default:
            cout << "其他" << endl;
    }

    int pass = score >= 60 ? 1 : 0;    //>ternary 三元运算符（条件 ? 值1 : 值2）
    bool valid = (score >= 0) && (score <= 100);  // 逻辑与：左边为假即短路
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        int score = 85;
        if (score >= 90) Console.WriteLine("A");
        else if (score >= 80) Console.WriteLine("B");
        else Console.WriteLine("F");

        int pass = score >= 60 ? 1 : 0;   // 三元
    }
}`;

const pythonSource = `score = 85
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("F")

pass_ = 1 if score >= 60 else 0   # 三元：a if cond else b`;

export const cppConditionalsLesson: LessonMeta = {
  id: 'cpp-conditionals',
  language: 'cpp',
  chapterId: 'conditionals',
  title: { zh: '条件判断', en: 'Conditionals' },
  difficulty: 'easy',
  prerequisites: ['cpp-vars', 'cpp-operators'],
  concept: [
    '条件判断让程序根据运行时的值选择不同的执行路径。最基本的 if 语句：圆括号里是条件表达式（结果为 true 或 false），花括号里是条件成立时执行的语句。用 else if 继续判断更多分支，用 else 兜底处理前面都不满足的情况。',
    '条件表达式由关系运算（==、!=、>、<、>=、<=）和逻辑运算（&& 与、|| 或、! 非）组合而成。逻辑运算符有"短路"特性：&& 左边为假就不再计算右边，|| 左边为真就不再计算右边——既省时间，也常被用来避免除零或解引用空指针。',
    'switch 适合对同一个整数或字符值做多路匹配：程序跳到匹配的 case 标签处执行，直到遇到 break 或 switch 结束。注意 case 只是"入口标签"，没有 break 会"贯穿"进下一个 case；default 处理没有任何 case 命中的情况。',
    '三元运算符 cond ? a : b 是 if-else 的单行简写，适合给变量在两个候选值之间选一个。它追求的是"表达式的结果"，不要往里塞太多逻辑，否则可读性反而变差。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '条件分支', en: 'Branching' },
      rows: { cpp: 'if / else if / else', csharp: 'if / else if / else', python: 'if / elif / else' },
    },
    {
      aspect: { zh: '多路匹配', en: 'Multi-way match' },
      rows: { cpp: 'switch', csharp: 'switch', python: 'match（3.10+）' },
    },
    {
      aspect: { zh: '三元表达式', en: 'Ternary' },
      rows: { cpp: 'x ? a : b', csharp: 'x ? a : b', python: 'a if x else b' },
    },
    {
      aspect: { zh: '逻辑与/或', en: 'Logical and/or' },
      rows: { cpp: '&& / ||', csharp: '&& / ||', python: 'and / or' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '把赋值 = 当成相等判断 ==', en: 'Confusing assignment = with equality ==' },
      detail: {
        zh: 'if (x = 5) 是赋值而不是比较：它把 5 写进 x，结果恒为真（非 0），还悄悄改了 x 的值。判断相等必须用 ==。',
        en: 'if (x = 5) assigns instead of comparing: it writes 5 into x, is always true (nonzero), and silently changes x. Use == to compare.',
      },
      code: 'if (x = 5) { ... }   // 错误：赋值\nif (x == 5) { ... }  // 正确：比较',
    },
    {
      title: { zh: 'switch 里忘记 break 导致贯穿', en: 'Forgetting break causes switch fall-through' },
      detail: {
        zh: 'case 匹配后若没有 break，会继续执行下一个 case 的语句（贯穿）。除非你明确想合并多个 case，否则每个分支结尾都要 break。',
        en: 'Without break, execution falls through into the next case. Add break to every branch unless you intentionally merge cases.',
      },
      code: 'case 1:\n    foo();  // 缺 break，会继续执行 case 2\ncase 2:\n    bar();',
    },
    {
      title: { zh: '悬空 else 绑错了 if', en: 'Dangling else binds to the wrong if' },
      detail: {
        zh: 'else 总是和最近的、尚未配对的 if 匹配。缩进看着像绑定外层，实际却绑到内层。用大括号显式圈定范围，别依赖缩进。',
        en: 'An else binds to the nearest unmatched if, regardless of indentation. Use braces to make the pairing explicit instead of relying on indentation.',
      },
      code: 'if (a)\n    if (b) f();\nelse g();   // else 绑定到内层 if，而非外层',
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个程序：读入一个整数分数，按规则输出等级：≥90 为 A，80-89 为 B，70-79 为 C，60-69 为 D，小于 60 为 F。',
      en: 'Read an integer score and print its grade: ≥90 A, 80-89 B, 70-79 C, 60-69 D, below 60 F.',
    },
    hints: ['用 cin >> score; 读入分数', '用 if / else if / else 从高到低依次判断', '条件顺序建议从 >= 90 开始往下写，最后用 else 兜底 < 60'],
    answer: `#include <iostream>
using namespace std;

int main() {
    int score;
    cin >> score;
    if (score >= 90) {
        cout << "A" << endl;
    } else if (score >= 80) {
        cout << "B" << endl;
    } else if (score >= 70) {
        cout << "C" << endl;
    } else if (score >= 60) {
        cout << "D" << endl;
    } else {
        cout << "F" << endl;
    }
    return 0;
}`,
  },
};
