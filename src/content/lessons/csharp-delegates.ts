import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
#include <functional>
using namespace std;

// C++：函数指针 / std::function 扮演"委托"角色
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }

int main() {
    std::function<int(int, int)> op = add;
    cout << op(3, 4) << endl;   // 7
    op = sub;                   // 重新绑定另一个函数
    cout << op(3, 4) << endl;   // -1
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    delegate int BinaryOp(int a, int b);  // 定义委托类型

    static int Add(int a, int b) => a + b;
    static int Sub(int a, int b) => a - b;

    static void Main()
    {
        BinaryOp op = Add;      // 把方法"打包"成对象
        Console.WriteLine(op(3, 4)); // 7
        op = Sub;               // 委托可重新绑定
        Console.WriteLine(op(3, 4)); // -1

        // 多播：+= 组合多个方法
        op += Add;
        Console.WriteLine(op(3, 4)); // 3（返回最后一个方法的返回值）
    }
}`;

const pythonSource = `# Python：函数本身就是一等对象，直接赋值即"委托"
def add(a, b):
    return a + b

def sub(a, b):
    return a - b

op = add
print(op(3, 4))   # 7
op = sub
print(op(3, 4))   # -1`;

export const csharpDelegatesLesson: LessonMeta = {
  id: 'csharp-delegates',
  language: 'csharp',
  chapterId: 'delegates',
  title: { zh: '委托（delegate）', en: 'Delegates' },
  difficulty: 'medium',
  prerequisites: ['csharp-types'],
  concept: [
    '委托是"方法的类型"：它把方法打包成可以赋值、传参、返回的对象。delegate int BinaryOp(int a, int b); 声明了一个"接受两个 int、返回 int"的方法签名类型。',
    '委托让代码把"做什么"推迟到运行时决定：排序比较器、回调、事件处理器都建立在其上。C# 内置了泛型委托 Func<T> 与 Action<T>，大多数场景无需自定义委托类型。',
    '委托支持多播：用 += 把多个方法挂到同一个委托上，调用时依次执行（返回值为最后一个方法的结果）；事件（event）就是对多播委托的封装与访问控制。',
    '执行流程：调用委托 → 遍历其方法列表逐个调用。本知识点是理解"事件、Lambda 表达式、LINQ"的前置。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '一等函数', en: 'First-class functions' },
      rows: { cpp: 'std::function / 函数指针', csharp: 'delegate / Func / Action', python: '函数即对象' },
    },
    {
      aspect: { zh: '多播', en: 'Multicast' },
      rows: { cpp: '无内建（需容器组合）', csharp: '+= / -= 内建支持', python: '无内建（列表组合）' },
    },
    {
      aspect: { zh: '类型安全', en: 'Type safety' },
      rows: { cpp: 'std::function 编译期检查', csharp: '编译期检查签名', python: '运行期检查' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '忘记委托是引用类型', en: 'Forgetting delegates are reference types' },
      detail: {
        zh: '把一个委托赋给另一个只是共享引用；把 null 赋给事件订阅者会导致 NullReferenceException，调用前应判空或用 ?.Invoke。',
        en: 'Assigning one delegate to another shares the reference; invoking a null delegate throws. Use ?.Invoke or null checks.',
      },
    },
    {
      title: { zh: '混淆多播返回值', en: 'Misreading multicast return values' },
      detail: {
        zh: '多播委托调用多个方法但只返回最后一个的返回值。需要收集所有结果时应手动遍历 GetInvocationList()。',
        en: 'A multicast delegate calls every method but returns only the last result. Iterate GetInvocationList() to collect all results.',
      },
    },
  ],
  exercise: {
    prompt: {
      zh: '用委托实现一个"计算器"：定义 delegate double Op(double, double)，把 +、-、*、/ 分别打包，根据用户输入选择执行。',
      en: 'Build a calculator with delegates: define delegate double Op(double, double) and bind +,-,*,/ to it.',
    },
    hints: ['switch 语句选择委托实例', '注意除零检查'],
    answer: `delegate double Op(double a, double b);
static double Div(double a, double b) => a / b;

Op op = Div;
Console.WriteLine(op(10, 2)); // 5`,
  },
};
