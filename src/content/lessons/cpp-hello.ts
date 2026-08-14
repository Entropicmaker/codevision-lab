import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>           //>include  引入输入输出流库
#include <string>             // 引入字符串类型
using namespace std;          // 展开 std 命名空间

int main() {                  //>main     程序从这里开始执行
    cout << "Hello, World!" << endl;      //>output  输出一行文字
    cout << "欢迎来到 C++ 世界" << endl;   // 再输出一行

    string name = "Lin";      //>var     定义一个字符串变量
    int age = 17;             // 定义一个整型变量
    cout << name << " 今年 " << age << " 岁" << endl;  // 拼接输出多个值

    return 0;                 //>return  返回 0 表示正常退出
}`;

const csharpSource = `using System;

class Program
{
    static void Main()                        // 程序入口
    {
        Console.WriteLine("Hello, World!");   // 输出一行
        string name = "Lin";                  // 变量
        int age = 17;
        Console.WriteLine($"{name} 今年 {age} 岁");
    }
}`;

const pythonSource = `print("Hello, World!")   # 输出一行
name = "Lin"             # 变量
age = 17
print(f"{name} 今年 {age} 岁")`;

export const cppHelloLesson: LessonMeta = {
  id: 'cpp-hello',
  language: 'cpp',
  chapterId: 'hello',
  title: { zh: 'Hello World 与程序结构', en: 'Hello World & Program Structure' },
  difficulty: 'easy',
  prerequisites: [],
  concept: [
    '每个 C++ 程序都从一个 main 函数开始：操作系统启动程序时调用 main，并把它返回的整数当作"退出状态码"。return 0 表示正常结束，返回非 0 通常表示出错了。',
    '#include <iostream> 把标准输入输出库的头文件"粘贴"进源文件，让我们能用 cout 把内容打印到屏幕。头文件只声明库提供了哪些功能，真正的实现由编译器在链接阶段接上。',
    'using namespace std; 把标准库里的名字（cout、string 等）引入当前作用域，省去每次写 std::cout。教学阶段用它方便，但大型项目里更推荐显式写 std:: 前缀，避免命名冲突。',
    '"编译"和"运行"是两步：先用编译器（如 g++）把 .cpp 源码翻译成机器码、生成可执行文件，再运行它。源代码是写给人读的，机器码是给 CPU 执行的，编译器就是两者之间的桥梁。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '入口函数', en: 'Entry point' },
      rows: { cpp: 'int main() { ... }', csharp: 'static void Main() { ... }', python: '顶层代码（无显式入口）' },
    },
    {
      aspect: { zh: '输出语句', en: 'Output statement' },
      rows: { cpp: 'cout << x << endl;', csharp: 'Console.WriteLine(x);', python: 'print(x)' },
    },
    {
      aspect: { zh: '行结束符', en: 'Line ending' },
      rows: { cpp: "endl 或 '\\n'", csharp: 'WriteLine 自动换行', python: 'print 自动换行' },
    },
    {
      aspect: { zh: '编译方式', en: 'Build process' },
      rows: { cpp: '先编译为机器码（g++）', csharp: '编译为 IL，由 CLR 运行', python: '解释执行，无需编译' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '忘记写 return 0', en: 'Forgetting return 0' },
      detail: {
        zh: 'main 是唯一可以省略 return 的函数：标准规定它缺省时隐式返回 0。但显式写 return 0 更清晰，也能避免旧编译器告警。',
        en: 'main is the one function that may omit return; the standard makes it implicitly return 0. Writing return 0 explicitly is clearer and avoids old-compiler warnings.',
      },
      code: 'int main() { ... }  // 缺省隐式返回 0，但建议显式写 return 0;',
    },
    {
      title: { zh: '滥用 using namespace std', en: 'Overusing `using namespace std`' },
      detail: {
        zh: '它把整个 std 命名空间引入当前作用域，大型项目里可能和你的函数重名引发冲突。教学阶段可用，工程实践推荐显式写 std::cout。',
        en: 'It pulls the whole std namespace into scope, which can collide with your own names in large projects. Fine for learning; prefer explicit std::cout in real code.',
      },
      code: 'using namespace std;    // 便捷，但可能名字冲突\nstd::cout << "hi";       // 显式前缀，更稳妥',
    },
    {
      title: { zh: '中文引号导致编译错误', en: 'Full-width quotes break compilation' },
      detail: {
        zh: '代码里的引号必须是英文半角的 " 与 \'。从文档、网页或聊天里复制来的“中文引号”会让编译器报 unknown character 错误。',
        en: 'Quotes must be ASCII half-width " and \'. Copying “full-width quotes” from documents or chats makes the compiler report unknown character errors.',
      },
      code: 'cout << "你好" << endl;  // 正确：英文半角双引号',
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个程序：定义字符串 name 存你的名字，输出"你好，<名字>"；再计算 1+2+3 并输出结果。',
      en: 'Write a program that stores your name in a string, prints "Hello, <name>", then computes and prints 1+2+3.',
    },
    hints: ['用 cout << "你好，" << name << endl; 输出问候语', '用 int sum = 1 + 2 + 3; 计算总和，再 cout << sum; 输出'],
    answer: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Lin";
    cout << "你好，" << name << endl;
    int sum = 1 + 2 + 3;
    cout << "1+2+3 = " << sum << endl;
    return 0;
}`,
  },
};
