import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> lst = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    vector<int> first(lst.begin(), lst.begin() + 3); // 前 3 个：无原生切片
    vector<int> reversed(lst.rbegin(), lst.rend());  // 反转
    for (int x : reversed) cout << x << " ";
    return 0;
}`;

const csharpSource = `using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        var lst = new List<int> { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
        var first = lst.Take(3).ToList();            // 前 3 个
        var last = lst.Skip(7).ToList();             // 后 3 个
        var reversed = Enumerable.Reverse(lst).ToList();
        Console.WriteLine(string.Join(" ", reversed));
    }
}`;

const pythonSource = `lst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

first = lst[0:3]      # [0, 1, 2]  —— stop 不包含        #>head
last  = lst[-3:]      # [7, 8, 9]  —— 负索引从尾部取      #>tail
rev   = lst[::-1]     # 整个列表反转                      #>reverse
cop   = lst[:]        # 新列表（浅拷贝，元素共享）         #>copy
print(first, last, rev, cop)`;

export const pythonSlicingLesson: LessonMeta = {
  id: 'python-slicing',
  language: 'python',
  chapterId: 'slicing',
  title: { zh: '切片', en: 'Slicing' },
  difficulty: 'easy',
  prerequisites: ['python-containers'],
  concept: [
    '切片是 Python 从序列（列表、元组、字符串）中取出一段子序列的语法：seq[start:stop:step]，三者都可省略。stop 是开区间——切片结果不包含下标为 stop 的元素，这与直觉相反，是最常见的坑。',
    '索引可为负：-1 表示最后一个元素，-3 表示倒数第三个。省略端点时，start 默认 0，stop 默认到末尾，step 默认 1，因此 lst[:3] 取前三个、lst[-3:] 取后三个、lst[::2] 隔一个取一个。',
    'step 为负数时方向反转：seq[::-1] 是最地道的整序列反转写法。此时 start/stop 的语义也要跟着"从右往左"理解，例如 lst[4:1:-1] 表示从下标 4 取到下标 2（不包含 1）。',
    '切片永远返回一个"新"容器，但它是浅拷贝：容器本身是新对象，里面的元素仍与原序列共享引用。对不可变元素（数字、字符串）无影响；对嵌套列表修改内层元素会同时影响原列表，需要深拷贝时用 copy.deepcopy。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '切片语法', en: 'Slice syntax' },
      rows: { cpp: '无原生切片（用迭代器区间）', csharp: 'LINQ 的 Take / Skip', python: 'seq[start:stop:step]' },
    },
    {
      aspect: { zh: '反转序列', en: 'Reverse a sequence' },
      rows: { cpp: 'reverse() 或 rbegin/rend', csharp: 'Enumerable.Reverse()', python: 'seq[::-1]' },
    },
    {
      aspect: { zh: '复制一份', en: 'Make a copy' },
      rows: { cpp: '拷贝构造 / assign', csharp: 'new List<T>(src)', python: 'seq[:]（浅拷贝）' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '误以为 stop 包含在内', en: 'Assuming stop is inclusive' },
      detail: {
        zh: 'lst[0:3] 只含下标 0、1、2，不含 3。区间是"左闭右开"：结果长度恰为 stop - start（step 为 1 时）。',
        en: 'lst[0:3] yields indices 0, 1, 2 only — 3 is excluded. The interval is half-open; its length is stop - start when step is 1.',
      },
      code: `lst = [10, 20, 30, 40, 50]
print(lst[1:3])  # [20, 30]，不含下标 3 的 40`,
    },
    {
      title: { zh: 'step 为负时方向反转', en: 'Negative step reverses direction' },
      detail: {
        zh: 'step 为负表示从右往左取，start 必须大于 stop。lst[1:4:-1] 是空列表，应写成 lst[4:1:-1]。',
        en: 'A negative step walks right-to-left, so start must exceed stop. lst[1:4:-1] is empty; write lst[4:1:-1] instead.',
      },
      code: `lst = [0, 1, 2, 3, 4]
print(lst[1:4:-1])  # [] —— 方向不对
print(lst[4:1:-1])  # [4, 3, 2]`,
    },
    {
      title: { zh: '把切片当深拷贝', en: 'Treating a slice as a deep copy' },
      detail: {
        zh: '切片只复制外层容器，内层元素仍是共享引用。对嵌套列表修改内层会"传染"到原列表，需要独立嵌套副本时用 copy.deepcopy。',
        en: 'A slice copies only the outer container; inner elements are still shared. Mutating a nested list leaks into the original — use copy.deepcopy for independent nesting.',
      },
      code: `a = [[1], [2]]
b = a[:]
b[0].append(99)
print(a)  # [[1, 99], [2]] —— 原列表也被改了`,
    },
  ],
  exercise: {
    prompt: {
      zh: '给定 nums = [3, 1, 4, 1, 5, 9, 2, 6]，用切片取出最后三个元素，并反转得到新列表。',
      en: 'Given nums, take its last three elements with slicing and reverse them into a new list.',
    },
    hints: ['取最后三个：nums[-3:]', '反转：再接一个 [::-1]'],
    answer: `nums = [3, 1, 4, 1, 5, 9, 2, 6]
result = nums[-3:][::-1]
print(result)  # [6, 2, 9]`,
  },
};
