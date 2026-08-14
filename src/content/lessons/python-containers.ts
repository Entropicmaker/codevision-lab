import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <vector>
#include <map>
#include <string>
using namespace std;

int main() {
    vector<int> lst = { 1, 2, 3 };  // 动态数组
    lst.push_back(4);
    cout << lst[0] << endl;          // 1

    map<string, int> d;              // 有序字典
    d["apple"] = 5;
    d["banana"] = 3;
    cout << d["apple"] << endl;      // 5
    return 0;
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        List<int> lst = new List<int> { 1, 2, 3 };
        lst.Add(4);
        Console.WriteLine(lst[0]);   // 1

        Dictionary<string, int> d = new Dictionary<string, int>();
        d["apple"] = 5;
        d["banana"] = 3;
        Console.WriteLine(d["apple"]); // 5
    }
}`;

const pythonSource = `lst = [1, 2, 3]        # 列表：有序、可变
lst.append(4)             # 末尾追加
lst.insert(0, 0)          # 指定位置插入
print(lst[0])             # 0
print(lst[-1])            # 4 —— 负索引从尾部取

d = {"apple": 5, "banana": 3}   # 字典：键值对
d["cherry"] = 7                 # 添加 / 覆盖
print(d["apple"])               # 5
print(len(lst), len(d))         # 4 3`;

export const pythonContainersLesson: LessonMeta = {
  id: 'python-containers',
  language: 'python',
  chapterId: 'containers',
  title: { zh: '列表、元组、集合、字典', en: 'Lists, Tuples, Sets & Dicts' },
  difficulty: 'easy',
  minutes: 25,
  prerequisites: [],
  concept: [
    'Python 的四大内置容器：列表 list（有序、可变，最常用）、元组 tuple（有序、不可变，常作固定组合与字典键）、集合 set（无序、去重、支持交并差）、字典 dict（键值对，查找 O(1)）。',
    '列表支持索引（含负索引）、切片 lst[1:3]、append/insert/pop 等操作；列表是引用类型——赋值是共享同一对象，需要副本时用 .copy() 或切片 [:]（浅拷贝）。',
    '字典按"键"组织数据：键必须可哈希（字符串、数字、元组），值任意。访问不存在的键会抛 KeyError，可先用 in 判断或用 d.get(key, default)。',
    '遍历习惯：for item in lst、for key, value in d.items()、enumerate(lst) 同时取下标与值。理解容器是后续切片、推导式、生成器等主题的基础。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '动态数组', en: 'Dynamic array' },
      rows: { cpp: 'std::vector', csharp: 'List<T>', python: 'list' },
    },
    {
      aspect: { zh: '键值映射', en: 'Key-value map' },
      rows: { cpp: 'std::map / unordered_map', csharp: 'Dictionary<K,V>', python: 'dict' },
    },
    {
      aspect: { zh: '不可变序列', en: 'Immutable sequence' },
      rows: { cpp: 'const vector / array', csharp: 'ReadOnlyCollection', python: 'tuple' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '把 list 当默认参数', en: 'Using a list as a default argument' },
      detail: {
        zh: 'def f(x=[]): 的默认列表在函数定义时创建一次，多次调用共享同一对象导致状态累积。应写 x=None 再在函数内初始化。',
        en: 'A default [] is created once at definition time and shared across calls. Use x=None and initialize inside the function.',
      },
    },
    {
      title: { zh: '遍历列表时增删元素', en: 'Mutating a list while iterating it' },
      detail: {
        zh: 'for 循环中 remove 元素会跳过后续元素。应遍历副本 for x in lst[:]: 或使用列表推导式生成新列表。',
        en: 'Removing items during iteration skips elements. Iterate over a copy (lst[:]) or build a new list with a comprehension.',
      },
    },
  ],
  exercise: {
    prompt: {
      zh: '给定列表 nums = [3, 1, 4, 1, 5, 9, 2]，用一行列表推导式得到其中所有偶数的平方（结果应去重并排序）。',
      en: 'Given nums, produce sorted unique squares of its even numbers in one comprehension.',
    },
    hints: ['偶数：x % 2 == 0', 'sorted(set(...)) 去重排序'],
    answer: `nums = [3, 1, 4, 1, 5, 9, 2]
result = sorted({x * x for x in nums if x % 2 == 0})
print(result)  # [4, 16]`,
  },
};
