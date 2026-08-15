import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> squares;                    // 手写循环收集结果
    for (int x = 0; x < 6; ++x) squares.push_back(x * x);
    for (int v : squares) cout << v << " "; // 0 1 4 9 16 25
    return 0;
}`;

const csharpSource = `using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        var squares = Enumerable.Range(0, 6)   // LINQ 映射
            .Select(x => x * x).ToList();
        Console.WriteLine(string.Join(" ", squares));
    }
}`;

const pythonSource = `# 列表推导式：对每个元素执行表达式
squares = [x * x for x in range(6)]              #>list
evens   = [x for x in range(10) if x % 2 == 0]   #>filter

# 字典推导式：生成键值对
sq_map = {x: x * x for x in range(4)}            #>dict

# 集合推导式：自动去重
uniq = {x % 3 for x in range(9)}                 #>set

print(squares, evens, sq_map, uniq)`;

export const pythonComprehensionsLesson: LessonMeta = {
  id: 'python-comprehensions',
  language: 'python',
  chapterId: 'comprehensions',
  title: { zh: '推导式', en: 'Comprehensions' },
  difficulty: 'easy',
  prerequisites: ['python-containers'],
  concept: [
    '推导式是 Python 用一行表达式构建新容器的语法糖：列表 [expr for x in seq]、字典 {k: v for x in seq}、集合 {expr for x in seq}。它把"建空容器 → for 循环 → 逐项 append"压缩成一句，读起来更接近"意图"本身。',
    '条件过滤：在 for 之后追加 if 子句，等价于循环体内的 if 判断。例如 [x for x in range(10) if x % 2 == 0] 只保留偶数；if 中不能有 else（有分支判断应放在表达式侧，写成三元表达式）。',
    '嵌套推导式：多个 for 从左到右等价于嵌套循环，如 [(x, y) for x in "ab" for y in "12"] 会先固定 x 再遍历 y，得到笛卡尔积。可读性随嵌套层数快速下降，超过两层就该考虑拆成普通循环。',
    '推导式有自己的局部作用域，Python 3 中循环变量不会泄漏到外层。它强调"纯映射/过滤"，不应在表达式里塞副作用（print、修改外部状态），那会破坏可读性并埋下 bug。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '列表映射', en: 'Map to a list' },
      rows: { cpp: '手写 for + push_back', csharp: 'LINQ Select', python: '[expr for x in seq]' },
    },
    {
      aspect: { zh: '条件过滤', en: 'Filter' },
      rows: { cpp: '循环内 if 判断', csharp: 'LINQ Where', python: 'if 子句' },
    },
    {
      aspect: { zh: '键值映射', en: 'Build a map' },
      rows: { cpp: '循环插入 std::map', csharp: 'LINQ ToDictionary', python: '字典推导式 {k: v}' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '推导式过度嵌套', en: 'Over-nested comprehensions' },
      detail: {
        zh: '嵌套两层以上的推导式读起来要"从右往左拆"，可读性反而不如普通循环。经验法则：超过一层过滤 + 一层嵌套，就改写为 for 循环。',
        en: 'Comprehensions nested beyond one filter + one loop are hard to parse. Rule of thumb: rewrite to a plain loop once nesting gets deep.',
      },
      code: `# 难以阅读：双重循环 + 条件挤成一行
grid = [[x * y for x in range(4) if x % 2 == 0] for y in range(3)]`,
    },
    {
      title: { zh: '把副作用混进推导式', en: 'Mixing side effects into a comprehension' },
      detail: {
        zh: '在推导式表达式里调用 print、append 或修改外部变量，会悄悄改变程序状态，且意图被藏在一行里。推导式应是纯的映射/过滤。',
        en: 'Calling print/append or mutating outer state inside the expression hides side effects in one line. Keep comprehensions pure.',
      },
      code: `result = [print(x) or x for x in range(3)]  # 坏味道：print 是副作用`,
    },
    {
      title: { zh: '误以为循环变量会泄漏', en: 'Expecting the loop variable to leak' },
      detail: {
        zh: 'Python 2 中推导式的循环变量会泄漏到外层作用域，Python 3 已修复——变量只在推导式内部可见。不要依赖或担心这个历史遗留行为。',
        en: 'Python 2 leaked the loop variable into the enclosing scope; Python 3 fixed this — the variable stays local to the comprehension.',
      },
      code: `squares = [x * x for x in range(3)]
print(x)  # Python 3: NameError；Python 2 会打印 2`,
    },
  ],
  exercise: {
    prompt: {
      zh: '用一行列表推导式，生成 1 到 50（含）中所有能被 7 整除的数的平方列表。',
      en: 'In one list comprehension, produce the squares of every number from 1 to 50 (inclusive) divisible by 7.',
    },
    hints: ['范围：range(1, 51)', '能被 7 整除：x % 7 == 0', '平方：x * x'],
    answer: `result = [x * x for x in range(1, 51) if x % 7 == 0]
print(result)  # [49, 196, 441, 784, 1225, 1764, 2401]`,
  },
};
