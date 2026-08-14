import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <string>
using namespace std;

int main() {
    int a = 10, b = 3;
    cout << a / b << endl;              // 3（整数除法，截断）
    cout << a % b << endl;              // 1

    double c = 10.0 / 3;                // 3.333...（浮点除法）
    cout << c << endl;

    string name = "Linzii";
    cout << "Hello, " + name << endl;   // 拼接

    cout << boolalpha << true << endl;  // true
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        int a = 10, b = 3;
        Console.WriteLine(a / b);      // 3（整数除法）
        Console.WriteLine(a % b);      // 1

        double c = 10.0 / 3;           // 3.333...（浮点除法）
        Console.WriteLine(c);

        string name = "Linzii";
        Console.WriteLine("Hello, " + name);  // 拼接

        Console.WriteLine(true);       // True
    }
}`;

const pythonSource = `# 数字：int 任意精度，float 双精度浮点
a = 10
b = 3
print(a / b)       #>div       # 3.333...（真除法，总是 float）
print(a // b)      #>floordiv  # 3（整除，向下取整）
print(a % b)       # 1（取余）

big = 2 ** 100     #>big       # 任意大整数，不会溢出
print(big)

# 字符串不可变：拼接会生成新字符串
name = "Linzii"
print("Hello, " + name)        # 用 + 拼接
print(f"Hi, {name}!")          #>fstring  # f-string 插值

# 布尔值：True / False；非空对象按真处理
print(bool("abc"))             #>bool     # True
print(bool(""))                # False
print(bool(0))                 # False`;

export const pythonPrimitivesLesson: LessonMeta = {
  id: 'python-primitives',
  language: 'python',
  chapterId: 'primitives',
  title: { zh: '数字、字符串和布尔值', en: 'Numbers, strings & booleans' },
  difficulty: 'easy',
  prerequisites: ['python-structure'],
  concept: [
    'Python 的 int 是任意精度整数：2 ** 100 这类大数不会溢出，无需像 C++ 那样操心 long long 的边界。float 则是双精度浮点，表示小数时同样有精度误差（如 0.1 + 0.2）。',
    '除法是 Python 与 C++/C# 差异最大的地方：/ 永远返回 float（5 / 2 == 2.5），// 才是整除且向下取整（5 // 2 == 2，-5 // 2 == -3），% 取余。',
    '字符串用单引号或双引号等价包裹，且不可变——任何"修改"都返回新字符串。f-string（f"..."）是推荐的插值方式，比 + 拼接更清晰、自动转类型。',
    '布尔值只有 True 与 False。真值判断：非空字符串、非零数字、非空容器都视为 True，空字符串/0/空容器为 False。理解这一点能避开大量条件判断的坑。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '整数除法', en: 'Integer division' },
      rows: { cpp: 'a / b 截断', csharp: 'a / b 截断', python: 'a // b 整除；a / b 返回 float' },
    },
    {
      aspect: { zh: '任意大整数', en: 'Arbitrary precision' },
      rows: { cpp: 'long long 有限', csharp: 'BigInteger', python: 'int 任意精度' },
    },
    {
      aspect: { zh: '字符串插值', en: 'String interpolation' },
      rows: { cpp: 'to_string + 拼接', csharp: '$"{name}"', python: 'f"{name}"' },
    },
    {
      aspect: { zh: '布尔字面量', en: 'Boolean literals' },
      rows: { cpp: 'true / false', csharp: 'true / false', python: 'True / False（非空为真）' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '/ 与 // 混淆', en: 'Confusing / with //' },
      detail: {
        zh: '求"整除"时误用 /，得到 2.5 而非 2。取整请用 //；注意负数的 // 是向下取整（-5 // 2 == -3），不是向零截断。',
        en: 'Using / for floor division yields 2.5 instead of 2. Use // for integer division; note it floors toward negative infinity (-5 // 2 == -3).',
      },
      code: `print(5 / 2)    # 2.5（float）
print(5 // 2)   # 2（整除）`,
    },
    {
      title: { zh: '用 + 拼接非字符串', en: 'Concatenating non-strings with +' },
      detail: {
        zh: '字符串 + 数字会抛 TypeError；应使用 f-string 自动转换，或显式 str()。',
        en: 'Adding a string and a number raises TypeError; use an f-string for automatic conversion or str() explicitly.',
      },
      code: `age = 18
print("I am " + age)     # TypeError
print(f"I am {age}")     # f-string 自动转换`,
    },
    {
      title: { zh: '非空字符串布尔值为 True', en: 'Non-empty strings are truthy' },
      detail: {
        zh: '"False"、空格、"0" 等非空字符串在布尔判断中都为 True，容易把字符串字面量误当布尔值。判断是否为空用 if s == "" 或 if not s。',
        en: 'Non-empty strings like "False" or "0" are truthy. Use if s == "" or if not s to test for emptiness.',
      },
      code: `if "False":        # 非空字符串为 True
    print("会执行")   # 被打印`,
    },
  ],
  exercise: {
    prompt: {
      zh: '给定 total = 375（秒），用 // 和 % 计算分钟数与剩余秒数，并用 f-string 打印成"6 分 15 秒"这样的格式。',
      en: 'Given total = 375 seconds, compute minutes and remaining seconds using // and %, then print them as "6 分 15 秒" with an f-string.',
    },
    hints: ['minutes = total // 60', 'seconds = total % 60', '用 f-string：f"{minutes} 分 {seconds} 秒"'],
    answer: `total = 375
minutes = total // 60
seconds = total % 60
print(f"{minutes} 分 {seconds} 秒")   # 6 分 15 秒`,
  },
};
