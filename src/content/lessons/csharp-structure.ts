import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {                              //>entry
    int myAge = 20, friendAge = 24;
    int diff = friendAge - myAge;         //>diff
    cout << "Hello, C++!" << endl;        //>print
    cout << diff << endl;
    return 0;
}`;

const csharpSource = `using System;                              //>using

namespace Greeting                         //>ns
{
    class Program
    {
        static void Main(string[] args)    //>entry
        {
            int myAge = 20;
            int friendAge = 24;
            int diff = friendAge - myAge;  //>diff
            Console.WriteLine("Hello, C#!"); //>print
            Console.WriteLine(diff);
        }
    }
}`;

const pythonSource = `# Python：没有命名空间与 Main，脚本自上而下执行
my_age = 20
friend_age = 24
diff = friend_age - my_age    #>diff
print("Hello, Python!")       #>print
print(diff)`;

export const csharpStructureLesson: LessonMeta = {
  id: 'csharp-structure',
  language: 'csharp',
  chapterId: 'structure',
  title: { zh: '程序结构', en: 'Program Structure' },
  difficulty: 'easy',
  prerequisites: [],
  concept: [
    '每个 C# 程序都有一个入口点（entry point）。传统写法是 static void Main(string[] args)：程序启动时，运行时（CLR）会自动找到 Main 并从这一行开始逐行执行。它是整段代码的"起点"，就像一本书翻开的第一页。',
    'namespace（命名空间）用来组织代码、避免不同库里的类重名，可以类比成文件系统的文件夹；using 指令则把某个命名空间"引入"当前文件，于是写 Console.WriteLine 时不必写全名 System.Console.WriteLine。',
    '从 C# 9 开始支持顶级语句（top-level statements）：可以省掉命名空间、类和 Main，直接在文件顶部写语句，编译器会隐式生成入口。它适合脚本式小工具，但一个项目里只能有一个文件这样写。',
    '语句以分号 ; 结尾，代码块用花括号 {} 包裹。看懂"入口点 + 命名空间 + using"这三件事，就拿到了读懂任何 C# 程序的地图。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '入口点', en: 'Entry point' },
      rows: { cpp: 'int main()', csharp: 'static void Main()（或顶级语句）', python: '脚本自上而下执行，无固定入口' },
    },
    {
      aspect: { zh: '命名空间 / 模块', en: 'Namespace / module' },
      rows: { cpp: 'namespace + using namespace', csharp: 'namespace + using', python: 'import 模块' },
    },
    {
      aspect: { zh: '输出语句', en: 'Output statement' },
      rows: { cpp: 'std::cout << ...', csharp: 'Console.WriteLine(...)', python: 'print(...)' },
    },
    {
      aspect: { zh: '语句结束符', en: 'Statement terminator' },
      rows: { cpp: '分号 ;', csharp: '分号 ;', python: '换行（无分号）' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '类名与文件名不必一致，但约定应一致', en: 'Class name need not match the file, but the convention should' },
      detail: {
        zh: '编译器不要求类名等于文件名，但把 Program 类放进 Program.cs 是社区约定，便于定位与维护。',
        en: 'The compiler does not require the class name to match the file, but putting Program in Program.cs is the community convention.',
      },
      code: `// 文件名 Hello.cs 里类名不必是 Hello，但保持一致更易维护
class Hello { static void Main() { } }`,
    },
    {
      title: { zh: '顶级语句与显式 Main 不能共存', en: 'Top-level statements cannot coexist with an explicit Main' },
      detail: {
        zh: '一个文件要么写顶级语句，要么写显式 Main，不能两者都写，否则会报"只有一个入口点"的编译错误。',
        en: 'A file uses either top-level statements or an explicit Main, never both, or the compiler reports a single-entry-point error.',
      },
      code: `Console.WriteLine("hi");
static void Main() { } // 编译错误：一个文件只能有一个入口点`,
    },
    {
      title: { zh: '忘记 using System', en: 'Forgetting using System' },
      detail: {
        zh: 'Console 定义在 System 命名空间中，缺少 using System 时直接写 Console 会编译失败（除非写全名 System.Console）。',
        en: 'Console lives in the System namespace; without using System, a bare Console fails to compile unless fully qualified as System.Console.',
      },
      code: `// 缺少 using System 时 Console 未定义
Console.WriteLine("hi"); // 编译错误，或改写 System.Console.WriteLine("hi")`,
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个程序：输出一句问候语，并计算你（20 岁）和朋友（24 岁）的年龄差，最后打印差值。',
      en: 'Write a program that prints a greeting and the age difference between you (20) and your friend (24).',
    },
    hints: ['用 static void Main 作为程序入口', '用 Console.WriteLine 输出文本', '年龄差 = friendAge - myAge（大减小）'],
    answer: `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, friend!");
        int myAge = 20;
        int friendAge = 24;
        int diff = friendAge - myAge;
        Console.WriteLine(diff); // 4
    }
}`,
  },
};
