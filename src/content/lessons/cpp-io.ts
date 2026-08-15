import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <string>
using namespace std;

int main() {
    int age;
    cout << "请输入年龄: ";   // 提示语不换行
    cin >> age;              //>read    从键盘读入整数

    string name;
    cout << "请输入名字: ";
    cin >> name;             // 读入一个"单词"，遇空格截断

    cout << "你好, " << name << "，你 " << age << " 岁" << endl; //>write 链式输出

    cout << "A\\n";           //>newline 只换行，不刷新缓冲区
    cout << "B" << endl;     //>endl    换行并刷新缓冲区

    int x, y;
    cin >> x >> y;           //>chain   一次读入两个数

    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        Console.Write("请输入年龄: ");
        int age = int.Parse(Console.ReadLine());  // 读一行转整数
        Console.Write("请输入名字: ");
        string name = Console.ReadLine();         // 读一整行
        Console.WriteLine($"你好, {name}，你 {age} 岁");
    }
}`;

const pythonSource = `age = int(input("请输入年龄: "))   # input 读一行，int 转整数
name = input("请输入名字: ")
print(f"你好, {name}，你 {age} 岁")`;

export const cppIoLesson: LessonMeta = {
  id: 'cpp-io',
  language: 'cpp',
  chapterId: 'io',
  title: { zh: '输入输出', en: 'Input & Output' },
  difficulty: 'easy',
  prerequisites: ['cpp-hello'],
  concept: [
    'cout（读作"see-out"）负责输出，cin（"see-in"）负责输入，两者都定义在 <iostream> 里。它们通过 <<（插入）与 >>（提取）运算符，把数据送进或送出程序。',
    'endl 与 \'\\n\' 都表示换行，但 endl 还会强制刷新缓冲区（把内容立刻写到终端）。高频输出时 endl 每次都刷新会拖慢速度，只想要换行时用 \'\\n\' 更快。',
    '链式输入 cin >> a >> b; 会从左到右依次读入，空白字符（空格、换行、制表符）作为分隔符被跳过。cin >> 按"词"读，遇到空白就停。',
    '输入最容易踩坑：cin >> 读单词会把空格截断，读整行要用 getline；二者混用时，缓冲区里残留的换行符会干扰紧接着的 getline。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '读入', en: 'Read input' },
      rows: { cpp: 'cin >> x;', csharp: 'int.Parse(Console.ReadLine())', python: 'int(input())' },
    },
    {
      aspect: { zh: '输出', en: 'Output' },
      rows: { cpp: 'cout << x << endl;', csharp: 'Console.WriteLine(x);', python: 'print(x)' },
    },
    {
      aspect: { zh: '换行', en: 'Newline' },
      rows: { cpp: "endl 或 '\\n'", csharp: 'WriteLine 自动换行', python: 'print 自动换行' },
    },
    {
      aspect: { zh: '读整行', en: 'Read a full line' },
      rows: { cpp: 'getline(cin, s)', csharp: 'Console.ReadLine()', python: 'input()' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: 'cin 遇到空格截断', en: 'cin stops at whitespace' },
      detail: {
        zh: 'cin >> 读到空白就停，读 "Li Ming" 只能拿到 "Li"。要读带空格的整行，改用 getline(cin, s)。',
        en: 'cin >> stops at whitespace, so "Li Ming" yields only "Li". Use getline(cin, s) to read a whole line with spaces.',
      },
      code: 'cin >> name;          // "Li Ming" 只读到 "Li"\ngetline(cin, name);   // 读到整行 "Li Ming"',
    },
    {
      title: { zh: '>> 与 getline 混用残留换行', en: 'Mixing >> and getline leaves a stray newline' },
      detail: {
        zh: 'cin >> 读完后缓冲区残留一个换行符，紧跟的 getline 会立刻读到空串。先 cin.ignore() 丢弃残留换行再 getline。',
        en: 'After cin >>, a stray newline remains in the buffer; a following getline reads an empty line. Call cin.ignore() first.',
      },
      code: 'cin >> age;\ncin.ignore();         // 丢弃残留换行\ngetline(cin, name);  // 才能正确读整行',
    },
    {
      title: { zh: 'endl 频繁刷新影响性能', en: 'endl flushing hurts performance' },
      detail: {
        zh: 'endl 每次都刷新缓冲区（触发系统调用），循环里高频输出会变慢。只想要换行时用 \'\\n\'。',
        en: 'endl flushes the buffer every time, triggering syscalls that slow down high-frequency output. Use \'\\n\' when you only need a newline.',
      },
      code: '// 慢：endl 每次都刷新缓冲区\nfor (int i = 0; i < 1e6; i++)\n    cout << i << endl;\n// 快：\'\\n\' 不刷新，由缓冲区批量输出\nfor (int i = 0; i < 1e6; i++)\n    cout << i << \'\\n\';',
    },
  ],
  exercise: {
    prompt: {
      zh: '从键盘读入两个整数，输出它们的和、差、积。',
      en: 'Read two integers from the keyboard and print their sum, difference, and product.',
    },
    hints: ['用 cin >> a >> b; 一次读入两个整数', '分别计算 a + b、a - b、a * b 并用 cout 输出'],
    answer: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "和: " << a + b << endl;
    cout << "差: " << a - b << endl;
    cout << "积: " << a * b << endl;
    return 0;
}`,
  },
};
