import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <vector>
#include <map>
#include <set>
using namespace std;

int main() {
    vector<string> names{ "Alice", "Bob" };  //>cppVector
    names.push_back("Carol");
    map<string, int> ages;                   //>cppMap
    ages["Alice"] = 30;
    set<int> s{ 1, 2, 2, 3 };                //>cppSet
    cout << s.size() << endl;                // 3（2 只保留一次）
    return 0;
}`;

const csharpSource = `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        // List<T>：动态数组，可增删元素
        var names = new List<string> { "Alice", "Bob" };  //>list
        names.Add("Carol");                               //>add
        names.Remove("Bob");                              // 删除元素
        foreach (var n in names)                          //>foreach
            Console.WriteLine(n);                         // Alice, Carol

        // Dictionary<K,V>：键值映射，按键快速查找
        var ages = new Dictionary<string, int>();         //>dict
        ages["Alice"] = 30;
        ages["Bob"] = 25;
        Console.WriteLine(ages["Alice"]);                 // 30

        // HashSet<T>：去重，元素唯一、无序
        var set = new HashSet<int> { 1, 2, 2, 3 };        //>set
        Console.WriteLine(set.Count);                     // 3（2 只保留一次）
    }
}`;

const pythonSource = `names = ["Alice", "Bob"]        #>pyList
names.append("Carol")            # 动态列表
ages = {"Alice": 30, "Bob": 25}  #>pyDict
print(ages["Alice"])
s = {1, 2, 2, 3}                 #>pySet
print(len(s))                    # 3`;

export const csharpCollectionsLesson: LessonMeta = {
  id: 'csharp-collections',
  language: 'csharp',
  chapterId: 'collections',
  title: { zh: '集合', en: 'Collections' },
  difficulty: 'easy',
  prerequisites: ['csharp-arrays'],
  concept: [
    'List<T> 是动态数组：长度可以随 Add / Remove 自动伸缩，是数组最常用的替代品。初始化用 new List<int> { 1, 2, 3 }，通过索引访问（list[0]），遍历同样用 foreach。需要频繁增删元素、又不确定数量时，优先选 List<T> 而不是定长数组。',
    'Dictionary<K, V> 是键值映射：通过唯一的键（key）快速定位到值（value）。例如用学生姓名查年龄。读取 ages["Alice"] 的前提是这个键必须存在；更适合"按某个字段查找"而非"按位置访问"的场景。',
    'HashSet<T> 是唯一元素集合：自动去重，元素无序，不支持下标访问。适合"某元素是否出现过""去掉重复项"这类需求。Count 属性返回去重后的元素个数。',
    '选择指南：需要固定长度的简单数据用数组；需要动态增删、按位置访问用 List<T>；需要按键快速查找用 Dictionary<K, V>；只需要判断唯一性或去重用 HashSet<T>。三者都在 System.Collections.Generic 命名空间中。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '动态数组', en: 'Dynamic array' },
      rows: { cpp: 'std::vector<T>', csharp: 'List<T>', python: 'list' },
    },
    {
      aspect: { zh: '键值映射', en: 'Key-value map' },
      rows: { cpp: 'std::map / std::unordered_map', csharp: 'Dictionary<K,V>', python: 'dict' },
    },
    {
      aspect: { zh: '唯一元素集合', en: 'Unique-element set' },
      rows: { cpp: 'std::set / std::unordered_set', csharp: 'HashSet<T>', python: 'set' },
    },
    {
      aspect: { zh: '查找不存在键', en: 'Missing-key lookup' },
      rows: { cpp: 'operator[] 会插入默认值', csharp: '抛 KeyNotFoundException（用 TryGetValue）', python: '抛 KeyError' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: 'List 遍历时删除元素会跳过相邻项', en: 'Removing while iterating a List skips elements' },
      detail: {
        zh: '遍历时删除元素会改变后续下标，导致漏删相邻项（foreach 遍历中直接 Remove 还会抛 InvalidOperationException）。应倒序 for 遍历，或改用 RemoveAll / 收集待删项后再删。',
        en: 'Removing during a forward foreach shifts subsequent indices and skips adjacent items. Iterate backward, use RemoveAll, or collect items to delete first.',
      },
      code: `var list = new List<int> { 1, 2, 3, 4 };
for (int i = 0; i < list.Count; i++)
{
    if (list[i] % 2 == 0)
        list.RemoveAt(i);   // 删除后 i++ 会跳过下一个元素
}`,
    },
    {
      title: { zh: '访问 Dictionary 不存在的键抛异常', en: 'Accessing a missing Dictionary key throws' },
      detail: {
        zh: '直接 ages["Tom"] 访问不存在的键会抛 KeyNotFoundException。用 TryGetValue 或先 ContainsKey 判断。',
        en: 'Reading ages["Tom"] for a missing key throws KeyNotFoundException. Use TryGetValue or check ContainsKey first.',
      },
      code: `var ages = new Dictionary<string, int>();
// Console.WriteLine(ages["Tom"]); // 抛 KeyNotFoundException
if (ages.TryGetValue("Tom", out int age))
    Console.WriteLine(age);
else
    Console.WriteLine("not found");`,
    },
    {
      title: { zh: '忘记 using System.Collections.Generic', en: 'Forgetting using System.Collections.Generic' },
      detail: {
        zh: 'List、Dictionary、HashSet 都定义在 System.Collections.Generic 命名空间中，缺少 using 会编译失败。',
        en: 'List, Dictionary, and HashSet live in System.Collections.Generic; without the using directive the code fails to compile.',
      },
      code: `// 缺少 using System.Collections.Generic 时：
List<int> nums = new List<int>(); // 编译错误：找不到 List<T>`,
    },
  ],
  exercise: {
    prompt: {
      zh: '写程序统计字符串中每个字符出现的次数。例如 "banana" 中 b 出现 1 次、a 出现 3 次、n 出现 2 次。用 Dictionary<char, int> 实现。',
      en: 'Write a program that counts how many times each character appears in a string. For "banana", b appears once, a three times, and n twice. Use a Dictionary<char, int>.',
    },
    hints: ['遍历字符串的每个字符 foreach (char c in s)', '键存在则值 +1，不存在则置 1（可用 ContainsKey 判断）', '更简洁：用 TryGetValue 读旧值再加 1'],
    answer: `using System;
using System.Collections.Generic;

string s = "banana";
var counts = new Dictionary<char, int>();

foreach (char c in s)
{
    counts.TryGetValue(c, out int n); // 已存在则取出旧值，否则 n=0
    counts[c] = n + 1;
}

foreach (var kv in counts)
    Console.WriteLine($"{kv.Key}: {kv.Value}");`,
  },
};
