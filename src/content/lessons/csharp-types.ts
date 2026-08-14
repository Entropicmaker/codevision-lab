import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

struct Point {           // 值语义的结构体
    int x;
    int y;
};

int main() {
    Point a{ 3, 4 };     // 栈上分配
    Point b = a;         // 整体拷贝（值拷贝）
    b.x = 10;            // 修改 b 不影响 a
    cout << a.x << endl; // 3
    return 0;
}`;

const csharpSource = `using System;

struct Point            // struct：值类型
{
    public int X;
    public int Y;
}

class Program
{
    static void Main()
    {
        Point a = new Point { X = 3, Y = 4 };
        Point b = a;     // 值拷贝
        b.X = 10;        // 不影响 a
        Console.WriteLine(a.X); // 3

        int[] arr = { 1, 2, 3 };  // 数组：引用类型
        int[] arr2 = arr;         // 拷贝的是"引用"
        arr2[0] = 99;             // 影响原数组
        Console.WriteLine(arr[0]); // 99
    }
}`;

const pythonSource = `lst = [1, 2, 3]    # 列表：可变对象
lst2 = lst          # 共享同一对象
lst2[0] = 99
print(lst)          # [99, 1, 2, 3]

num = 42            # 整数：不可变
num2 = num
num2 = 7            # 重新绑定，不修改 42
print(num)          # 42`;

export const csharpTypesLesson: LessonMeta = {
  id: 'csharp-types',
  language: 'csharp',
  chapterId: 'vars-types',
  title: { zh: '值类型与引用类型', en: 'Value Types & Reference Types' },
  difficulty: 'easy',
  prerequisites: [],
  concept: [
    'C# 把类型分为两大类：值类型（int、double、bool、char、struct、enum）直接存放数据，赋值时整体拷贝；引用类型（class、string、数组、委托）存放的是指向堆上对象的引用，赋值时只拷贝引用。',
    'struct 是值类型：a = b 之后修改 b 不影响 a。class 是引用类型：两个变量可能指向同一个对象，通过任一变量修改都会反映到对方。这是 C# 与 C++ 最需要区分的模型差异之一。',
    'string 虽然是不变（immutable）的引用类型，但行为上"像值类型"：每次修改都产生新字符串。数组、List、class 实例则是共享引用。',
    '理解值/引用模型，是理解方法参数传递（按值传引用 vs 传值）、对象关系图、以及后续委托与事件的基础。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '自定义值类型', en: 'User-defined value type' },
      rows: { cpp: 'struct（默认值拷贝）', csharp: 'struct', python: '无（一切皆对象）' },
    },
    {
      aspect: { zh: '引用类型', en: 'Reference type' },
      rows: { cpp: '指针 / 引用 &', csharp: 'class、数组、string', python: '列表、字典、自定义类' },
    },
    {
      aspect: { zh: '赋值语义', en: 'Assignment semantics' },
      rows: { cpp: '按声明类型（值或引用）', csharp: '值类型拷贝、引用类型共享', python: '共享引用（绑定名字）' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '以为数组赋值是深拷贝', en: 'Assuming array assignment deep-copies' },
      detail: {
        zh: 'int[] b = a; 之后 b 与 a 是同一个数组。需要独立副本时用 a.Clone() 或 Array.Copy。',
        en: 'After int[] b = a;, both names refer to the same array. Use a.Clone() or Array.Copy for a real copy.',
      },
    },
    {
      title: { zh: '对 string 反复 += 拼接', en: 'Repeated string += concatenation' },
      detail: {
        zh: '每次 += 都创建新字符串，循环内拼接是 O(n²)。大量拼接应使用 StringBuilder。',
        en: 'Each += allocates a new string; concatenating in a loop is O(n²). Use StringBuilder.',
      },
    },
  ],
  exercise: {
    prompt: {
      zh: '定义 struct Point { int X; int Y; }，写方法 Swap 交换两个 Point（需要 ref 参数）。为什么普通参数无法交换？',
      en: 'Define struct Point and a Swap method with ref parameters. Why can\'t plain parameters swap values?',
    },
    hints: ['值类型参数默认传值（拷贝）', '用 ref Point a, ref Point b 传引用'],
    answer: `static void Swap(ref Point a, ref Point b) {
    Point t = a; a = b; b = t;
}
// 调用：Swap(ref p1, ref p2);`,
  },
};
