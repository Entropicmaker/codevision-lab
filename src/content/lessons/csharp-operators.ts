import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {
    int a = 7, b = 2;
    cout << a + b << endl;          //>cppAdd
    cout << a / b << endl;          //>cppDiv  整数除法：截断为 3
    cout << a % b << endl;          //>cppMod
    cout << a / (double)b << endl;  //>cppReal  3.5
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        // 算术：+ - * / %
        int a = 7, b = 2;
        int div = a / b;              //>div   整数除法：截断为 3
        int rem = a % b;              //>mod   余数 1
        double real = a / (double)b;  //>real  3.5

        // 关系与逻辑
        bool range = (a > b) && (b < 3);  //>range

        // 字符串拼接：+ 连接字符串
        string msg = "sum=" + (a + b);    //>concat

        // ==：string 按内容比较
        string s1 = "abc", s2 = "abc";
        bool same = s1 == s2;         //>same  true

        Console.WriteLine(div);
        Console.WriteLine(rem);
        Console.WriteLine(real);
        Console.WriteLine(msg);
        Console.WriteLine(same);
    }
}`;

const pythonSource = `a, b = 7, 2
print(a + b)           #>pyAdd
print(a / b)           #>pyDiv   3.5（/ 是真除）
print(a // b)          #>pyFloor 3（// 地板除）
print(a % b)           #>pyMod
print("sum=" + str(a + b))  #>pyConcat 数字需先转 str`;

export const csharpOperatorsLesson: LessonMeta = {
  id: 'csharp-operators',
  language: 'csharp',
  chapterId: 'operators',
  title: { zh: '运算符', en: 'Operators' },
  difficulty: 'easy',
  prerequisites: ['csharp-structure'],
  concept: [
    '运算符把变量组合成表达式，是程序的基本计算单元。C# 的运算符分为几大类：算术（+ - * / %）、关系（== != < > <= >=）、逻辑（&& || !）、赋值（= += -= 等）。',
    '整数除法最易踩坑：两个 int 相除，结果仍是 int，小数部分被直接丢弃（截断），不是四舍五入。要得到小数，让参与运算的数里至少有一个是 double，例如 a / 2.0 或 a / (double)b。',
    '+ 号身兼两职：数值相加与字符串拼接（string 与任何对象相加都会先转成字符串）。== 号也有双重身份：对值类型比较内容，对引用类型（class）比较引用地址；string 虽是引用类型，却被重载成按内容比较——这正是值/引用类型知识点的直接体现。',
    '运算符优先级决定求值顺序（先乘除后加减，关系高于逻辑，&& 高于 ||）。拿不准时加括号：括号不仅能保证正确，还能让意图一目了然。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '整数除法', en: 'Integer division' },
      rows: { cpp: 'a / b 截断小数', csharp: 'int / int 截断小数', python: '/ 真除（浮点）、// 地板除' },
    },
    {
      aspect: { zh: '字符串拼接', en: 'String concatenation' },
      rows: { cpp: 'std::string 用 +', csharp: 'string 用 +（任意类型可拼接）', python: 'str 用 +（数字需 str() 转换）' },
    },
    {
      aspect: { zh: '相等比较 ==', en: 'Equality ==' },
      rows: { cpp: '值类型按值（类需重载 ==）', csharp: '值类型按值、引用类型按引用', python: '== 按内容比较' },
    },
    {
      aspect: { zh: '取模 % 符号', en: 'Modulo sign' },
      rows: { cpp: '结果符号随被除数', csharp: '结果符号随被除数', python: '结果符号随除数' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '整数除法丢精度', en: 'Integer division loses precision' },
      detail: {
        zh: '两个 int 相除结果仍是 int，小数被直接丢弃而非四舍五入。要保留小数，把其中一个操作数转成 double。',
        en: 'Dividing two ints yields an int; the fraction is truncated, not rounded. Cast one operand to double to keep it.',
      },
      code: `double c = 5 / 2;     // c == 2，整数除法先截断
double d = 5 / 2.0;   // d == 2.5，让一方为 double`,
    },
    {
      title: { zh: '== 对 string 按值、对 class 按引用', en: '== compares strings by value but classes by reference' },
      detail: {
        zh: 'string 重载了 ==，按内容比较；自定义 class 默认按引用（地址）比较，两个内容相同的实例并不相等。',
        en: 'string overloads == to compare content; a custom class compares references by default, so two equal-content instances are not equal.',
      },
      code: `string s1 = "hi", s2 = "hi";
bool a = s1 == s2;    // true：string 按内容比较

Point p1 = new Point(), p2 = new Point();
bool b = p1 == p2;    // false：class 比较引用（地址）`,
    },
    {
      title: { zh: '% 负数结果符号', en: 'Sign of % with negative operands' },
      detail: {
        zh: 'C# 中取模结果的符号跟随被除数：-7 % 3 = -1、7 % -3 = 1（Python 则跟随除数）。',
        en: 'In C# the modulo sign follows the dividend: -7 % 3 = -1 and 7 % -3 = 1 (Python follows the divisor).',
      },
      code: `Console.WriteLine(-7 % 3); // -1（符号随被除数）
Console.WriteLine(7 % -3); //  1`,
    },
  ],
  exercise: {
    prompt: {
      zh: '写程序把摄氏温度转成华氏温度，公式 F = C * 9 / 5 + 32。分别用 int 和 double 存储温度 26，观察整数除法陷阱。',
      en: 'Convert 26°C to Fahrenheit with F = C * 9 / 5 + 32, first storing the temperature as int then as double, and observe the integer-division trap.',
    },
    hints: ['整数除法会截断小数部分', '让参与运算的数中至少有一个是 double（如 9.0 或 (double)C）', '保持先乘 9 再除 5 的计算顺序'],
    answer: `// int 版本：26 * 9 = 234，234 / 5 = 46（截断），+ 32 = 78（错误）
int C1 = 26;
int F1 = C1 * 9 / 5 + 32;   // 78，丢了 0.8

// double 版本：正确
double C2 = 26;
double F2 = C2 * 9 / 5 + 32; // 78.8

Console.WriteLine(F2);`,
  },
};
