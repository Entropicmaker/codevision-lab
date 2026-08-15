import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <string>
using namespace std;

string greet(string name = "world") {   // 默认参数
    return "Hello, " + name;
}

int main() {
    cout << greet("Python") << endl;    // Hello, Python
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static string Greet(string name = "world")  // 默认参数
    {
        return "Hello, " + name;
    }

    static void Main()
    {
        Console.WriteLine(Greet("Python"));
    }
}`;

const pythonSource = `def greet(name="world"):          #>def     # 默认参数
    return "Hello, " + name        #>return

def stats(nums):                   #>multi
    return min(nums), max(nums)    # 多返回值 = 打包成元组

if __name__ == "__main__":         #>entry
    print(greet("Python"))         #>call
    lo, hi = stats([3, 1, 4])      # 解包元组
    print(lo, hi)                  # 1 4`;

export const pythonFunctionsLesson: LessonMeta = {
  id: 'python-functions',
  language: 'python',
  chapterId: 'functions',
  title: { zh: '函数', en: 'Functions' },
  difficulty: 'easy',
  prerequisites: ['python-structure'],
  concept: [
    '用 def 定义函数：def name(args): 下面是缩进的函数体。Python 函数不声明返回类型，任何值都可返回；不写 return 或只写 return 时，函数返回 None。',
    '多返回值：return a, b 实际是把多个值打包成一个元组，调用方可一次性解包 x, y = f()。这是 Python 交换两个变量 a, b = b, a 的底层机制。',
    '参数形式：位置参数按顺序绑定，关键字参数按名字绑定 f(b=2, a=1)，默认参数让实参可省略。默认参数在"定义时"只求值一次，因此绝不能用可变对象（列表、字典）作默认值。',
    '作用域遵循 LEGB 顺序查找名字：Local（函数内）→ Enclosing（外层嵌套函数）→ Global（模块全局）→ Builtin（内置）。函数内赋值默认创建局部变量，要修改外层变量需 global / nonlocal 声明。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '函数定义', en: 'Define a function' },
      rows: { cpp: '返回类型 + 参数类型', csharp: '返回类型 + 参数类型', python: 'def，无类型声明' },
    },
    {
      aspect: { zh: '默认参数', en: 'Default arguments' },
      rows: { cpp: '函数声明处给默认值', csharp: '参数声明处给默认值', python: 'arg=value（注意可变陷阱）' },
    },
    {
      aspect: { zh: '多返回值', en: 'Multiple return values' },
      rows: { cpp: '引用参数 / struct / tuple', csharp: 'out / Tuple / 元组', python: '直接返回元组' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '可变默认参数陷阱', en: 'Mutable default argument trap' },
      detail: {
        zh: 'def f(x=[]): 的默认列表在定义时创建一次，所有调用共享同一对象，状态会累积。正确做法是 x=None 并在函数体内初始化。',
        en: 'A default [] is created once at definition time and shared across calls, accumulating state. Use x=None and initialize inside the function.',
      },
      code: `def f(x=[]):
    x.append(1)
    return x

print(f())  # [1]
print(f())  # [1, 1] —— 不是 [1]！`,
    },
    {
      title: { zh: '默认参数在定义时求值', en: 'Default evaluated at definition time' },
      detail: {
        zh: '默认值表达式在 def 语句执行时就求值并"冻结"，之后每次调用用的是同一个已求值的对象，而非每次重新求值。',
        en: 'The default expression is evaluated once when def runs, then frozen; later calls reuse that same evaluated object rather than re-evaluating.',
      },
      code: `import time

def now(t=time.time()):   # time.time() 只在定义时执行一次
    return t`,
    },
    {
      title: { zh: '忘记 return 返回 None', en: 'Forgetting return yields None' },
      detail: {
        zh: '没有 return 的函数默认返回 None。把这种函数的返回值直接用于后续计算，会得到 NoneType 相关报错。',
        en: 'A function without an explicit return returns None. Using that result in later computation causes NoneType errors.',
      },
      code: `def add(a, b):
    print(a + b)   # 只打印，没返回

total = add(2, 3)  # total 是 None
print(total + 1)   # TypeError`,
    },
  ],
  exercise: {
    prompt: {
      zh: '写函数 count_words(text)，返回一个字典统计每个单词出现的次数（用 split() 分词）。',
      en: 'Write count_words(text) returning a dict counting each word, using split() to tokenize.',
    },
    hints: ['text.split() 把句子拆成单词列表', '用 counts.get(word, 0) 累加计数'],
    answer: `def count_words(text):
    counts = {}
    for word in text.split():
        counts[word] = counts.get(word, 0) + 1
    return counts

print(count_words("a cat and a dog"))
# {'a': 2, 'cat': 1, 'and': 1, 'dog': 1}`,
  },
};
