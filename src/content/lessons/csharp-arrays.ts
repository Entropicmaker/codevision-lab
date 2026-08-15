import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <array>
#include <algorithm>
using namespace std;

int main() {
    array<int, 5> scores{ 78, 92, 65, 88, 74 }; //>cppDeclare
    int sum = 0;
    for (int s : scores) sum += s;              //>cppForeach
    sort(scores.begin(), scores.end());         //>cppSort
    cout << scores.size() << endl;              // 5
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        // 一维数组：声明 + 初始化（长度固定为 5）
        int[] scores = { 78, 92, 65, 88, 74 };   //>declare
        Console.WriteLine(scores.Length);        // 5

        // 遍历：累加求和
        int sum = 0;
        foreach (int s in scores)                //>foreach
            sum += s;
        Console.WriteLine(sum);                  // 397

        // 常用方法
        Array.Sort(scores);                      //>sort
        int idx = Array.IndexOf(scores, 88);     // 排序后 88 的下标
        Console.WriteLine(idx);                  // 3

        // 多维（矩形）数组：每一行长度相同
        int[,] grid = { { 1, 2, 3 }, { 4, 5, 6 } }; //>multi
        Console.WriteLine(grid[1, 2]);           // 6

        // 锯齿数组（数组的数组）：每一行长度可以不同
        int[][] jagged = new int[2][];           //>jagged
        jagged[0] = new int[] { 1, 2, 3 };
        jagged[1] = new int[] { 4, 5 };
        Console.WriteLine(jagged[0].Length);     // 3
    }
}`;

const pythonSource = `scores = [78, 92, 65, 88, 74]   #>pyDeclare
total = sum(scores)               # 内置求和，无需手写循环
scores.sort()                     #>pySort
idx = scores.index(88)            #>pyIndex
print(len(scores))                # 5`;

export const csharpArraysLesson: LessonMeta = {
  id: 'csharp-arrays',
  language: 'csharp',
  chapterId: 'arrays',
  title: { zh: '数组', en: 'Arrays' },
  difficulty: 'easy',
  prerequisites: ['csharp-types'],
  concept: [
    '数组（array）是存放同一类型元素的定长容器，通过从 0 开始的下标访问。声明时有两种写法：int[] scores = new int[5];（默认全 0）或 int[] scores = { 78, 92, 65 };（用初始值列表，长度由元素个数决定）。一旦创建，数组长度不可改变。',
    'C# 数组分三类：一维数组（int[]）最常见；多维矩形数组（int[,]）像表格，每一行长度相同，用 grid[1, 2] 这样的逗号下标访问；锯齿数组（int[][]）是"数组的数组"，每一行可以长度不同，需要先 new 外层数组、再逐行 new 内层数组。',
    '每个数组都有 Length 属性表示元素总数，配合 for (int i = 0; i < arr.Length; i++) 是最安全的遍历方式；foreach (int x in arr) 更简洁，适合只读遍历。常用静态方法有 Array.Sort（排序）、Array.IndexOf（查找下标）、Array.Reverse（反转）。',
    '数组是引用类型：int[] b = a; 只是复制了引用，b 和 a 指向同一个数组。需要独立副本时用 a.Clone() 或 Array.Copy。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '一维数组 / 列表', en: '1-D array / list' },
      rows: { cpp: 'std::array<T, N>（定长）或 T[N]', csharp: 'int[]（定长）', python: 'list（可变长度）' },
    },
    {
      aspect: { zh: '多维结构', en: 'Multidimensional structure' },
      rows: { cpp: 'T[N][M]（或嵌套 vector）', csharp: 'int[,] 矩形 / int[][] 锯齿', python: '嵌套 list' },
    },
    {
      aspect: { zh: '排序', en: 'Sorting' },
      rows: { cpp: 'std::sort(begin, end)', csharp: 'Array.Sort(arr)', python: 'arr.sort() / sorted(arr)' },
    },
    {
      aspect: { zh: '遍历', en: 'Iteration' },
      rows: { cpp: '范围 for (int x : arr)', csharp: 'foreach (int x in arr)', python: 'for x in arr' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '以为数组赋值是深拷贝', en: 'Assuming array assignment copies the elements' },
      detail: {
        zh: 'int[] b = a; 后 b 与 a 是同一个数组，改 b[0] 会同时改 a[0]。需要独立副本时用 a.Clone() 或 Array.Copy。',
        en: 'After int[] b = a;, b and a refer to the same array, so changing b[0] also changes a[0]. Use a.Clone() or Array.Copy for a real copy.',
      },
      code: `int[] a = { 1, 2, 3 };
int[] b = a;        // 只是复制引用
b[0] = 99;
Console.WriteLine(a[0]); // 99，而不是 1`,
    },
    {
      title: { zh: '越界访问抛 IndexOutOfRangeException', en: 'Out-of-range access throws IndexOutOfRangeException' },
      detail: {
        zh: '下标必须满足 0 <= i < arr.Length。访问 arr[arr.Length] 或 arr[-1] 会在运行时抛出 IndexOutOfRangeException。',
        en: 'The index must satisfy 0 <= i < arr.Length. Accessing arr[arr.Length] or arr[-1] throws IndexOutOfRangeException at runtime.',
      },
      code: `int[] a = { 1, 2, 3 };
Console.WriteLine(a[3]); // 抛 IndexOutOfRangeException：最大合法下标是 2`,
    },
    {
      title: { zh: '混淆 Length 与最高下标（差一）', en: 'Confusing Length with the highest index' },
      detail: {
        zh: 'Length 是元素个数 n，最高下标是 n - 1。用 for 循环时边界应写 i < arr.Length，写 i <= arr.Length 会越界。',
        en: 'Length is the count n, while the highest index is n - 1. In a for loop the bound should be i < arr.Length; i <= arr.Length overruns.',
      },
      code: `int[] a = { 1, 2, 3 };
for (int i = 0; i <= a.Length; i++) // 错误：i==3 时越界
    Console.WriteLine(a[i]);`,
    },
  ],
  exercise: {
    prompt: {
      zh: '给定整型数组，求所有元素的平均值（保留小数）并找出最大值所在的下标。例如 { 78, 92, 65, 88, 74 } 的平均值是 79.4，最大值 92 的下标是 1。',
      en: 'Given an int array, compute the average of all elements (keep the fraction) and find the index of the maximum value. For { 78, 92, 65, 88, 74 } the average is 79.4 and the max 92 is at index 1.',
    },
    hints: ['先累加 sum，平均值 = (double)sum / nums.Length（强制转 double 才能保留小数）', '用 maxIndex 记录当前最大值的下标，比较 nums[i] > nums[maxIndex]', '数组只有 0 个元素时要做边界判断（本题可假设非空）'],
    answer: `int[] nums = { 78, 92, 65, 88, 74 };

int sum = 0;
int maxIndex = 0;
for (int i = 0; i < nums.Length; i++)
{
    sum += nums[i];
    if (nums[i] > nums[maxIndex])
        maxIndex = i;
}

double average = (double)sum / nums.Length;
Console.WriteLine($"Average: {average}");    // 79.4
Console.WriteLine($"Max index: {maxIndex}"); // 1`,
  },
};
