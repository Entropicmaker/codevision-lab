import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <string>
using namespace std;

void greet(string name) {           // 函数：花括号划分代码块
    cout << "Hello, " << name << endl;
}

int main() {                        // 入口固定为 main()
    greet("World");
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Greet(string name)  // 方法：花括号划分代码块
    {
        Console.WriteLine("Hello, " + name);
    }

    static void Main()              // 入口固定为 Main()
    {
        Greet("World");
    }
}`;

const pythonSource = `# Python 用缩进（推荐 4 空格）划分代码块，冒号引出块
def greet(name):              #>def
    print("Hello, " + name)   #>body

def main():                   #>main
    name = "World"
    greet(name)

if __name__ == "__main__":    #>entry
    main()                    #>run`;

export const pythonStructureLesson: LessonMeta = {
  id: 'python-structure',
  language: 'python',
  chapterId: 'structure',
  title: { zh: '程序结构（缩进与入口）', en: 'Program structure (indentation & entry point)' },
  difficulty: 'easy',
  prerequisites: [],
  concept: [
    'Python 的代码块不靠花括号 {}，而靠缩进：同一层级的语句必须缩进对齐，冒号（:）表示"下面要开始一个代码块"。这迫使代码天然整齐，但混用 Tab 与空格会直接报错。',
    '语句与表达式：表达式（如 1 + 2、"abc"）能求出一个值，语句（如 print(...)、x = 5）执行一个动作。Python 用换行分隔语句，不再需要 C++/C# 末尾的分号。',
    '注释用 # 开头，从 # 到行尾都是注释，Python 没有块注释（多行通常用连续的 # 或三引号字符串）。注释是写给人的，解释器会完全忽略。',
    '脚本入口：if __name__ == "__main__": 是 Python 的"主函数"约定——当文件被直接运行时才执行下面代码；当它被 import 时则跳过，从而把"定义"和"执行"分开，便于复用与测试。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '代码块表示', en: 'Block delimiters' },
      rows: { cpp: '{ } 花括号', csharp: '{ } 花括号', python: '缩进（冒号引出）' },
    },
    {
      aspect: { zh: '入口约定', en: 'Entry point' },
      rows: { cpp: 'int main()', csharp: 'static void Main()', python: 'if __name__ == "__main__"' },
    },
    {
      aspect: { zh: '注释语法', en: 'Comment syntax' },
      rows: { cpp: '// 单行，/* 块 */', csharp: '// 单行，/* 块 */', python: '# 单行（无块注释）' },
    },
    {
      aspect: { zh: '语句分隔', en: 'Statement separator' },
      rows: { cpp: '分号 ;', csharp: '分号 ;', python: '换行（分号极少用）' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: 'Tab 与空格混用缩进', en: 'Mixing tabs and spaces' },
      detail: {
        zh: '同一文件里既有 Tab 又有空格做缩进，即使视觉上对齐，Python 也会抛 IndentationError 或 TabError。统一使用 4 空格，并让编辑器把 Tab 转成空格。',
        en: 'Mixing tabs and spaces raises IndentationError/TabError even when visually aligned. Use 4 spaces consistently and enable "convert tabs to spaces".',
      },
      code: `def f():
    print("空格")
\tprint("Tab")   # 混用 Tab 与空格 → 报错`,
    },
    {
      title: { zh: '缩进层级不一致', en: 'Inconsistent indentation levels' },
      detail: {
        zh: '同一代码块内的语句缩进量必须完全相同，哪怕只差一个空格也会报错。复制粘贴代码时最容易引入这类问题。',
        en: 'Statements in the same block must share the exact same indentation; even one space of difference errors out.',
      },
      code: `if x > 0:
    print("正数")
  print("层级不对")   # 缩进量不一致 → 报错`,
    },
    {
      title: { zh: '忘记冒号', en: 'Forgetting the colon' },
      detail: {
        zh: 'if、for、while、def、class 等语句末尾都需要冒号引出代码块，漏写会直接抛 SyntaxError。',
        en: 'if/for/while/def/class all require a trailing colon; omitting it causes SyntaxError.',
      },
      code: `if x > 0    # 缺少冒号 → SyntaxError
    print("正数")`,
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个脚本：定义函数 greet(name) 打印问候语，再定义 main() 在其中调用 greet("Python")，最后用 if __name__ == "__main__": 调用 main()。',
      en: 'Write a script: define greet(name) printing a greeting, define main() that calls greet("Python"), and call main() under if __name__ == "__main__".',
    },
    hints: ['函数体缩进 4 空格', '入口写在文件末尾：if __name__ == "__main__":'],
    answer: `def greet(name):
    print("Hello, " + name + "!")

def main():
    greet("Python")

if __name__ == "__main__":
    main()`,
  },
};
