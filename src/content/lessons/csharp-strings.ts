import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "Hello, World";
    size_t pos = s.find("World");     //>cppFind
    string sub = s.substr(0, 5);      //>cppSubstr
    s += "!";                         // C++ 字符串可变
    cout << s << endl;                // Hello, World!
    return 0;
}`;

const csharpSource = `using System;
using System.Text;

class Program
{
    static void Main()
    {
        string s = "  Hello, World  ";
        string t = s.Trim();                 //>trim
        Console.WriteLine(t);                // "Hello, World"

        string[] parts = t.Split(',');       //>split
        Console.WriteLine(parts[0]);         // "Hello"

        bool has = t.Contains("World");      // true
        string sub = t.Substring(0, 5);      // "Hello"

        string r = t.Replace("World", "C#"); //>replace
        Console.WriteLine(r);                // "Hello, C#"

        // 插值：用 $ 前缀把表达式嵌进字符串
        int score = 95;
        string msg = $"Score is {score}";    //>interp
        Console.WriteLine(msg);              // "Score is 95"

        // 大量拼接用 StringBuilder（性能更好）
        var sb = new StringBuilder();        //>builder
        for (int i = 0; i < 5; i++)
            sb.Append(i);
        Console.WriteLine(sb.ToString());    // "01234"
    }
}`;

const pythonSource = `s = "  Hello, World  "
t = s.strip()                        #>pyStrip
parts = t.split(",")                 #>pySplit
print(t.replace("World", "C#"))      #>pyReplace
score = 95
print(f"Score is {score}")           # f-string 插值`;

export const csharpStringsLesson: LessonMeta = {
  id: 'csharp-strings',
  language: 'csharp',
  chapterId: 'strings',
  title: { zh: '字符串', en: 'Strings' },
  difficulty: 'easy',
  prerequisites: ['csharp-types'],
  concept: [
    'string 是 C# 里最常用的引用类型，但它"不可变"（immutable）：一旦创建，内容就不能被改动。任何看起来"修改"字符串的操作——Replace、Trim、+= ——实际上都是创建并返回一个全新的字符串，原字符串保持不变。',
    '常用实例方法：Split 按分隔符切成字符串数组；Substring(start, length) 截取子串；Contains 判断是否包含；Replace 替换；Trim 去掉首尾空白；ToUpper/ToLower 转大小写。它们都返回新字符串，记得接收返回值。',
    '字符串插值用 $ 前缀：$"Score is {score}" 会先求值大括号里的表达式再拼进结果，比 string.Format 或一堆 + 号更直观。相邻字符串与数字混拼时，插值是首选写法。',
    '当需要在循环里反复拼接大量字符串时，用 + 或 += 每次都会分配新字符串，复杂度会退化成 O(n²)。此时应改用 StringBuilder：它内部维护可变缓冲区，最后一次性 ToString() 得到结果。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '不可变性', en: 'Mutability' },
      rows: { cpp: 'std::string 可变（可 += 原地改）', csharp: 'string 不可变（每次生成新串）', python: 'str 不可变' },
    },
    {
      aspect: { zh: '拆分', en: 'Splitting' },
      rows: { cpp: '手动解析（无内置 Split）', csharp: 'Split(...)', python: 'split(...)' },
    },
    {
      aspect: { zh: '拼接 / 插值', en: 'Concatenation / interpolation' },
      rows: { cpp: '+ 或 std::ostringstream', csharp: '$"..." 插值 / StringBuilder', python: 'f-string' },
    },
    {
      aspect: { zh: '查找子串', en: 'Finding a substring' },
      rows: { cpp: 'find(...) 返回位置', csharp: 'Contains / IndexOf', python: 'in / find(...)' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '循环内用 += 拼接导致 O(n²)', en: 'Using += in a loop causes O(n²)' },
      detail: {
        zh: '每次 += 都分配一个新字符串并拷贝全部旧内容，循环里拼接是 O(n²)。大量拼接应改用 StringBuilder。',
        en: 'Each += allocates a new string and copies the whole old content, so concatenating in a loop is O(n²). Use StringBuilder for heavy concatenation.',
      },
      code: `string s = "";
for (int i = 0; i < 10000; i++)
    s += i;              // O(n²)，应改用 StringBuilder`,
    },
    {
      title: { zh: '忽略字符串不可变：Replace 不修改原串', en: 'Forgetting immutability: Replace returns a new string' },
      detail: {
        zh: 's.Replace(...) 不会改变 s，而是返回新字符串。不接收返回值就等于什么都没做。',
        en: 's.Replace(...) does not change s; it returns a new string. Ignoring the return value does nothing.',
      },
      code: `string s = "hello";
s.Replace("h", "H");      // 原串没变，结果被丢弃
Console.WriteLine(s);     // 仍是 "hello"
s = s.Replace("h", "H");  // 正确：接收返回值`,
    },
    {
      title: { zh: 'Split 产生空字符串项', en: 'Split produces empty-string entries' },
      detail: {
        zh: '连续分隔符或首尾分隔符会让 Split 产生空字符串项。可用 Split(..., StringSplitOptions.RemoveEmptyEntries) 过滤掉它们。',
        en: 'Consecutive or leading/trailing separators make Split produce empty entries. Pass StringSplitOptions.RemoveEmptyEntries to drop them.',
      },
      code: `string s = "a,,b";
string[] parts = s.Split(',');           // ["a", "", "b"]，含空项
string[] ok = s.Split(',', StringSplitOptions.RemoveEmptyEntries); // ["a", "b"]`,
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个方法 Reverse(string s)，返回反转后的字符串。例如 Reverse("hello") 返回 "olleh"。请用 StringBuilder（或字符数组）实现。',
      en: 'Write a method Reverse(string s) that returns the reversed string. For example Reverse("hello") returns "olleh". Implement it with StringBuilder (or a char array).',
    },
    hints: ['用 StringBuilder 从后往前逐字符 Append，最后 ToString()', '或者 s.ToCharArray() 得到字符数组，再用 Array.Reverse 反转后 new string(chars)', '字符串不可变，不要用 s = s + c 逐字符拼接（效率低）'],
    answer: `string Reverse(string s)
{
    var sb = new StringBuilder(s.Length);
    for (int i = s.Length - 1; i >= 0; i--)
        sb.Append(s[i]);
    return sb.ToString();
}

// 更简洁：用字符数组
string ReverseWithArray(string s)
{
    char[] chars = s.ToCharArray();
    Array.Reverse(chars);
    return new string(chars);
}`,
  },
};
