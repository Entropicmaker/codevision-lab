import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {
    int a = 7, b = 2;

    cout << "a + b = " << a + b << endl;   // 9
    cout << "a / b = " << a / b << endl;   //>div   3：整数除法截断
    cout << "a % b = " << a % b << endl;   //>mod   1：% 只用于整数

    bool ok = (a > b) && (b > 0);          //>logic 关系 + 逻辑运算
    cout << boolalpha << ok << endl;       // true

    int i = 5;
    int x = ++i;                           //>preinc  先加后用：i=6, x=6
    int y = i++;                           //>postinc 先用后加：y=6, i=7
    cout << x << " " << y << " " << i << endl;  // 6 6 7

    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        int a = 7, b = 2;
        Console.WriteLine(a / b);   // 3 —— 整数除法截断
        Console.WriteLine(a % b);   // 1

        int i = 5;
        int x = ++i;                // i=6, x=6
        int y = i++;                // y=6, i=7
        Console.WriteLine($"{x} {y} {i}"); // 6 6 7
    }
}`;

const pythonSource = `a, b = 7, 2
print(a / b)     # 3.5 —— Python 的 / 是真除法
print(a // b)    # 3   —— // 才是整除
print(a % b)     # 1

i = 5
i += 1           # Python 没有 ++，用 i += 1
print(i)         # 6`;

export const cppOperatorsLesson: LessonMeta = {
  id: 'cpp-operators',
  language: 'cpp',
  chapterId: 'operators',
  title: { zh: '运算符', en: 'Operators' },
  difficulty: 'easy',
  prerequisites: ['cpp-vars'],
  concept: [
    '运算符是对数据做运算的符号。C++ 的运算符分几类：算术（+ - * / %）、关系（> < >= <= == !=）、逻辑（&& || !）、赋值（= 及其复合形式 += 等）和自增自减（++ --）。',
    '整数除法会截断：两个 int 相除只保留整数部分，7 / 2 得到 3 而不是 3.5。想得到小数，需要先把其中一个操作数转成浮点。取余运算符 % 只对整数有效，得到的是除法的余数。',
    '++i 与 i++ 都让 i 加 1，但表达式求值的时机不同：++i 先加后用，i++ 先用后加。单独成句时二者没区别，一旦放进更复杂的表达式里，结果就不同了。',
    '多个运算符出现在同一表达式时，按"优先级"决定先算谁；优先级相同时按"结合性"决定从左到右还是从右到左。规则记不清时就加括号，让意图一目了然。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '整数除法', en: 'Integer division' },
      rows: { cpp: '7 / 2 == 3（截断）', csharp: '7 / 2 == 3（截断）', python: '7 / 2 == 3.5；7 // 2 == 3' },
    },
    {
      aspect: { zh: '取余', en: 'Modulo' },
      rows: { cpp: '7 % 2（仅整数）', csharp: '7 % 2（仅整数）', python: '7 % 2（整数/浮点均可）' },
    },
    {
      aspect: { zh: '自增', en: 'Increment' },
      rows: { cpp: '++i / i++', csharp: '++i / i++', python: '无 ++，用 i += 1' },
    },
    {
      aspect: { zh: '逻辑运算符', en: 'Logical operators' },
      rows: { cpp: '&& || !', csharp: '&& || !', python: 'and or not' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '整数除法丢精度', en: 'Losing precision in integer division' },
      detail: {
        zh: '两个 int 相除结果仍是 int，小数部分被直接丢弃（不是四舍五入）。要得到小数，把其中一个操作数转成 double。',
        en: 'Dividing two ints yields an int; the fractional part is truncated, not rounded. Cast one operand to double to keep precision.',
      },
      code: 'int a = 7, b = 2;\ncout << a / b;        // 3，不是 3.5\ncout << 1.0 * a / b;  // 3.5',
    },
    {
      title: { zh: '= 与 == 混淆', en: 'Confusing = with ==' },
      detail: {
        zh: '= 是赋值，== 是比较。写 if (x = 5) 会把 5 赋给 x 且条件恒为真，是常见隐患。',
        en: '= assigns, == compares. Writing if (x = 5) assigns 5 to x and is always true — a classic bug.',
      },
      code: 'if (x = 5)   // 赋值，条件恒真（危险）\nif (x == 5)  // 比较，正确',
    },
    {
      title: { zh: '++i / i++ 的副作用时机', en: 'Timing of ++i vs i++ side effects' },
      detail: {
        zh: '单独成句时 ++i 和 i++ 效果一样；放进表达式时 ++i 先加后用、i++ 先用后加，混用容易读错。',
        en: 'Standalone, ++i and i++ do the same thing; in an expression ++i increments before use while i++ uses then increments.',
      },
      code: 'int i = 5;\nint x = ++i;  // x=6, i=6\nint y = i++;  // y=6, i=7',
    },
  ],
  exercise: {
    prompt: {
      zh: '声明两个整数 a=10、b=20，在不使用第三个临时变量的前提下交换它们的值，并输出交换前后的结果。',
      en: 'Declare ints a=10 and b=20, swap them without a third temporary variable, and print before/after values.',
    },
    hints: ['加减法：a = a + b; b = a - b; a = a - b;', '异或法（仅限整数）：a ^= b; b ^= a; a ^= b;'],
    answer: `int a = 10, b = 20;
cout << a << " " << b << endl;  // 10 20
a = a + b;   // a = 30
b = a - b;   // b = 10
a = a - b;   // a = 20
cout << a << " " << b << endl;  // 20 10`,
  },
};
