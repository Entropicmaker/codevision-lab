import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <string>
using namespace std;

int main() {
    int age = 17;              // 整型：占 4 字节（通常）
    double price = 9.9;        // 双精度浮点
    char grade = 'A';          // 字符
    bool ok = true;            // 布尔
    const int MAX = 100;       // 常量：不可修改
    string name = "Lin";       // std::string 字符串

    age = 18;                  // 变量可重新赋值
    // MAX = 200;              // 错误：常量不可修改
    cout << name << " 今年 " << age << " 岁" << endl;
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        int age = 17;              // 值类型：整型
        double price = 9.9;
        char grade = 'A';
        bool ok = true;
        const int MAX = 100;       // 常量
        string name = "Lin";       // 引用类型：字符串

        age = 18;
        // MAX = 200;              // 错误：常量不可修改
        Console.WriteLine($"{name} 今年 {age} 岁");
    }
}`;

const pythonSource = `age = 17            # 动态类型：解释器自动推断
price = 9.9
grade = 'A'
ok = True
MAX = 100           # 约定大写为"常量"，但技术上仍可修改
name = "Lin"

age = 18            # 变量可重新赋值，甚至可换成其他类型
print(f"{name} 今年 {age} 岁")`;

export const cppVarsLesson: LessonMeta = {
  id: 'cpp-vars',
  language: 'cpp',
  chapterId: 'vars',
  title: { zh: '变量、常量和基本类型', en: 'Variables, Constants & Basic Types' },
  difficulty: 'easy',
  minutes: 15,
  prerequisites: [],
  concept: [
    '变量是一块有名字的内存区域：程序通过变量名读写其中的值。C++ 是静态类型语言——每个变量在声明时就要确定类型，编译器据此分配内存并检查操作是否合法。',
    'C++ 的基本类型包括：整型 int（通常 4 字节）、浮点 double（8 字节）、字符 char（1 字节）、布尔 bool（true/false），以及标准库提供的字符串 std::string。sizeof 运算符可以查看类型占用的字节数。',
    '常量用 const 修饰，声明后不可再修改。把不会改变的值声明为 const 能让编译器帮忙把关，也能让代码意图更清晰。',
    '注意：C++ 中变量的"类型"是编译期概念；运行期你看到的是内存中的二进制位。理解这一点是后续学习指针、引用与内存布局的基础。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '类型声明', en: 'Type declaration' },
      rows: { cpp: 'int age = 17;', csharp: 'int age = 17;', python: 'age = 17（推断）' },
    },
    {
      aspect: { zh: '常量', en: 'Constant' },
      rows: { cpp: 'const int MAX = 100;', csharp: 'const int MAX = 100;', python: 'MAX = 100（约定）' },
    },
    {
      aspect: { zh: '字符串', en: 'String' },
      rows: { cpp: 'std::string', csharp: 'string（引用类型）', python: 'str（不可变）' },
    },
    {
      aspect: { zh: '类型检查', en: 'Type checking' },
      rows: { cpp: '编译期强制', csharp: '编译期强制', python: '运行期（动态）' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '把 double 隐式转成 int 丢失精度', en: 'Losing precision in implicit double→int conversion' },
      detail: {
        zh: 'int x = 3.9; 会把 3.9 截断成 3（不是四舍五入）。跨浮点与整型赋值时要显式转换并确认意图。',
        en: 'int x = 3.9; truncates to 3, not rounding. Convert explicitly and make your intent clear.',
      },
    },
    {
      title: { zh: '把 char 当字符串用', en: 'Treating char as a string' },
      detail: {
        zh: '单引号是字符（char），双引号是字符串（const char* / std::string）。用 "a" 赋给 char 会编译报错。',
        en: 'Single quotes make a char, double quotes make a string. Assigning "a" to a char fails to compile.',
      },
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个程序：声明整型变量 a=7、b=3，用第三个变量交换它们的值，并输出交换前后的结果。',
      en: 'Declare ints a=7 and b=3, swap them using a third variable, and print before/after values.',
    },
    hints: ['需要一个临时变量暂存 a 的值', '交换：tmp = a; a = b; b = tmp;'],
    answer: `int a = 7, b = 3, tmp;
tmp = a; a = b; b = tmp;
cout << a << " " << b << endl; // 3 7`,
  },
};
