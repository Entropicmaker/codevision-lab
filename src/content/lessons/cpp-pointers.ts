import type { LessonMeta } from './registry';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <iostream>
using namespace std;

int main() {
    int value = 42;        // 栈上的整型变量
    int* p = &value;       // 指针 p 保存 value 的内存地址
    int& ref = value;      // 引用 ref 是 value 的别名

    cout << "value = " << value << endl;   // 42
    *p = 100;              // 通过指针间接修改 value
    cout << "value = " << value << endl;   // 100
    ref = 7;               // 通过引用修改
    cout << "value = " << value << endl;   // 7

    int* heap = new int(5);  // 堆上动态分配
    cout << *heap << endl;   // 5
    delete heap;             // 释放，防止内存泄漏
    heap = nullptr;          // 避免悬垂指针
    return 0;
}`;

const csharpSource = `using System;

class Program
{
    static void Main()
    {
        int value = 42;        // 值类型：直接存放数据
        int[] heap = new int[] { 5 };  // 引用类型：堆上分配
        int first = heap[0];   // 拷贝出值

        unsafe
        {
            // C# 默认不允许指针，需要 unsafe 块与 /unsafe 编译选项
            int* p = &value;
            *p = 100;
        }
        Console.WriteLine(value); // 100
    }
}`;

const pythonSource = `value = 42      # Python 没有指针：一切名字都是"引用"
lst = [5]       # lst 引用堆上的列表对象
alias = lst     # alias 与 lst 指向同一个对象
alias[0] = 100
print(lst)      # [100] —— 通过别名修改了同一对象

a = 42
b = a           # 整数不可变：b = 42 是"重新绑定"，与 a 无关
b = 7
print(a, b)     # 42 7`;

export const cppPointersLesson: LessonMeta = {
  id: 'cpp-pointers',
  language: 'cpp',
  chapterId: 'pointers',
  title: { zh: '指针与内存地址', en: 'Pointers & Memory Addresses' },
  difficulty: 'medium',
  prerequisites: ['cpp-vars'],
  concept: [
    '内存中的每个存储单元都有地址。指针是"保存地址的变量"：int* p = &value; 让 p 保存 value 的地址，*p 则通过地址间接读写 value（解引用）。',
    '指针是 C++ 的核心抽象：数组、动态内存、链表、多态、函数参数传递都依赖它。理解"值、变量、地址"三者关系是掌握指针的关键。',
    '引用（int& ref = value）是变量的别名：声明后不可重新绑定，使用时不需要解引用符号。可以把引用理解为"更安全的受限指针"。',
    'new 在堆上分配内存，必须用 delete 释放，否则内存泄漏；释放后指针成为悬垂指针，应置为 nullptr。本页与"栈内存与堆内存"知识点配合学习效果最好。',
  ],
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  comparison: [
    {
      aspect: { zh: '取地址', en: 'Address-of' },
      rows: { cpp: 'int* p = &value;', csharp: '仅 unsafe 块可用 &value', python: 'id(obj) 查看对象 id' },
    },
    {
      aspect: { zh: '间接访问', en: 'Indirection' },
      rows: { cpp: '*p', csharp: '*p（unsafe）', python: '无（一切皆引用）' },
    },
    {
      aspect: { zh: '别名机制', en: 'Alias' },
      rows: { cpp: 'int& ref = value;', csharp: 'ref 参数 / ref 局部变量', python: '赋值即共享引用' },
    },
    {
      aspect: { zh: '内存释放', en: 'Deallocation' },
      rows: { cpp: 'delete 手动管理', csharp: 'GC 自动回收', python: '引用计数 + GC' },
    },
  ],
  commonMistakes: [
    {
      title: { zh: '解引用空指针 / 悬垂指针', en: 'Dereferencing null or dangling pointers' },
      detail: {
        zh: '对 nullptr 或已 delete 的地址解引用是未定义行为，可能崩溃或读到垃圾数据。解引用前检查非空，释放后置 nullptr。',
        en: 'Dereferencing nullptr or freed memory is undefined behavior. Check for null before dereferencing and null out freed pointers.',
      },
    },
    {
      title: { zh: '把指针与它指向的值混淆', en: 'Confusing the pointer with the pointee' },
      detail: {
        zh: 'p 与 *p 不是一回事：p 是地址，*p 是地址处的值。修改 p 改变指向，修改 *p 改变数据。',
        en: 'p is an address, *p is the value at that address. Changing p repoints; changing *p mutates data.',
      },
    },
  ],
  exercise: {
    prompt: {
      zh: '写一个函数 void square(int* p)，把 p 指向的整数变为它的平方；在主函数中验证调用前后值的变化。',
      en: 'Write void square(int* p) that replaces the pointed-to int with its square, and verify in main.',
    },
    hints: ['在函数内用 *p = (*p) * (*p);', '调用时传地址：square(&x);'],
    answer: `void square(int* p) {
    *p = (*p) * (*p);
}
// 调用：
int x = 6;
square(&x);
cout << x << endl; // 36`,
  },
};
