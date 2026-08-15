import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int add(int a, int b);                    //>proto   函数原型（声明）：先声明后使用

int power(int base, int exp = 2) {        //>default 默认参数：exp 缺省为 2
    int r = 1;
    for (int i = 0; i < exp; i++) r *= base;
    return r;
}

void swapByValue(int a, int b) {          // 传值：修改的是局部副本
    int t = a; a = b; b = t;
}

void swapRef(int &a, int &b) {            //>ref     传引用：直接修改实参
    int t = a; a = b; b = t;
}

int main() {
    int s = add(2, 3);                    //>call    调用函数
    int x = 5, y = 9;
    swapByValue(x, y);                    // x、y 不变（传值）
    swapRef(x, y);                        // x、y 真正交换（传引用）
    cout << s << " " << x << " " << y << endl;
    cout << power(3) << endl;             // 9，exp 用默认值 2
    cout << power(3, 3) << endl;          // 27
    return 0;
}

int add(int a, int b) { return a + b; }   //>body    函数定义（实现）`;

const csharpSource = `using System;

class Program
{
    static int Add(int a, int b) { return a + b; }

    static void SwapRef(ref int a, ref int b)
    {
        int t = a; a = b; b = t;
    }

    static void Main()
    {
        int s = Add(2, 3);
        int x = 5, y = 9;
        SwapRef(ref x, ref y);
        Console.WriteLine($"{s} {x} {y}");
    }
}`;

const pythonSource = `def add(a, b):
    return a + b

def power(base, exp=2):
    return base ** exp

s = add(2, 3)
print(s, power(3), power(3, 3))   # 3 9 27`;

export const cppFunctionsLesson: LessonMeta = {
  id: 'cpp-functions',
  language: 'cpp',
  chapterId: 'functions',
  title: { zh: '函数与参数', en: 'Functions & parameters' },
  difficulty: 'easy',
  prerequisites: ['cpp-vars', 'cpp-loops'],
  concept: [
    '函数把一段可复用的逻辑封装起来并起个名字。定义函数要写清：返回类型、函数名、参数列表和函数体。调用时程序跳进函数体执行，遇到 return 就把结果带回调用处。main 本身也是一个函数，是程序的入口。',
    '声明（原型）与定义是两回事：声明只告诉编译器"有这么个函数、长什么样"，定义才给出具体实现。C++ 要求函数在使用前必须先声明，所以要么把定义写在调用之前，要么在文件开头写一行函数原型 int add(int a, int b);。',
    '参数的传递方式决定函数能否影响调用方：默认按值传递，函数拿到实参的副本，改副本不影响原变量；按引用传递（int &a）则让参数成为实参的别名，改它会直接影响调用方。引用会在后续章节单独细讲。',
    '默认参数允许调用时省略某些实参：int power(int base, int exp = 2) 中 exp 缺省为 2，调用 power(3) 等价于 power(3, 2)。默认参数必须从右往左连续设置，不能"跳着"给默认值。返回值类型要与声明匹配。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '定义函数', en: 'Define function' },
      rows: { cpp: 'int add(int a, int b) { ... }', csharp: 'static int Add(int a, int b) { ... }', python: 'def add(a, b): ...' },
    },
    {
      aspect: { zh: '传值', en: 'Pass by value' },
      rows: { cpp: '按值（副本）', csharp: '按值（副本）', python: '对象引用（不可变对象类似传值）' },
    },
    {
      aspect: { zh: '引用语义', en: 'Reference semantics' },
      rows: { cpp: 'int &a 引用', csharp: 'ref 关键字', python: '可变对象可直接修改' },
    },
    {
      aspect: { zh: '默认参数', en: 'Default parameter' },
      rows: { cpp: 'int exp = 2', csharp: 'int exp = 2', python: 'exp=2' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '使用前没有函数原型（声明）', en: 'Missing function prototype (declaration) before use' },
      detail: {
        zh: 'C++ 要求函数在使用前必须先声明。要么把函数定义写在调用之前，要么在开头加一行函数原型 int add(int, int);，否则编译报"未声明标识符"。',
        en: 'C++ requires a function to be declared before use. Either define it above the call site, or add a prototype like int add(int, int); up top, or the compiler reports an undeclared identifier.',
      },
      code: 'int add(int a, int b);   // 原型：告诉编译器函数的存在\n// 没有它，main 里调用 add 会编译报错',
    },
    {
      title: { zh: '传值不能修改实参', en: 'Passing by value cannot modify the argument' },
      detail: {
        zh: '默认传值时，函数拿到的是实参的副本，改副本不影响调用方的变量。想真正修改实参，需要传引用（int &a）——引用会在后续章节细讲。',
        en: 'By default a function receives a copy of the argument; changing the copy does not affect the caller. To really modify it, pass by reference (int &a) — references are covered in a later chapter.',
      },
      code: 'void bad(int a) { a = 10; }   // 改的是副本\nvoid good(int &a) { a = 10; }  // 真正修改实参',
    },
    {
      title: { zh: '返回值类型不匹配', en: 'Return type mismatch' },
      detail: {
        zh: '函数声明返回 int，却 return 一个 double 或字符串，会隐式转换或编译报错。return 的值必须能安全地转成声明类型。',
        en: 'Returning a double or string from a function declared to return int causes implicit conversion or a compile error. The returned value must safely convert to the declared type.',
      },
      code: 'int get() {\n    return 3.14;   // double 隐式转 int，得到 3（可能不是你的意图）\n}',
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个函数 int max3(int a, int b, int c)，返回三个整数中的最大值；在 main 里调用并输出结果。',
      en: 'Write a function int max3(int a, int b, int c) returning the largest of three integers; call it in main and print the result.',
    },
    hints: ['先取 a 作为当前最大值 m', '用 if 依次把 m 与 b、c 比较，谁更大就更新 m', '最后 return m;'],
    answer: `#include <iostream>
using namespace std;

int max3(int a, int b, int c) {
    int m = a;
    if (b > m) m = b;
    if (c > m) m = c;
    return m;
}

int main() {
    cout << max3(3, 7, 5) << endl;  // 7
    return 0;
}`,
  },
};
