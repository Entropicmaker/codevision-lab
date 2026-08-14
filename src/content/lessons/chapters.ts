import type { CodeLang, LocalizedText } from '../../engine/types/step';

/** 课程章节结构（真实内容骨架，知识点随迭代填充） */
export interface LessonChapter {
  id: string;
  title: LocalizedText;
  /** 该章节包含的知识点标题 */
  topics: string[];
}

export interface LessonChapterGroup {
  id: string;
  title: LocalizedText;
  chapters: LessonChapter[];
}

export const lessonChapters: Record<CodeLang, LessonChapterGroup[]> = {
  cpp: [
    {
      id: 'cpp-basics',
      title: { zh: '基础部分', en: 'Basics' },
      chapters: [
        { id: 'hello', title: { zh: 'Hello World 与程序结构', en: 'Hello World & program structure' }, topics: ['程序结构', '编译与运行'] },
        { id: 'vars', title: { zh: '变量、常量和基本类型', en: 'Variables, constants & basic types' }, topics: ['基本类型', 'const', '类型转换'] },
        { id: 'operators', title: { zh: '运算符', en: 'Operators' }, topics: ['算术', '关系', '逻辑', '位运算'] },
        { id: 'io', title: { zh: '输入输出', en: 'Input & output' }, topics: ['cin', 'cout'] },
        { id: 'conditionals', title: { zh: '条件判断', en: 'Conditionals' }, topics: ['if/else', 'switch'] },
        { id: 'loops', title: { zh: 'for、while、do-while', en: 'for, while, do-while' }, topics: ['for', 'while', 'do-while', 'break/continue'] },
        { id: 'functions', title: { zh: '函数与参数', en: 'Functions & parameters' }, topics: ['定义与调用', '传值/传引用', '默认参数'] },
        { id: 'scope', title: { zh: '作用域', en: 'Scope' }, topics: ['局部/全局', '命名空间'] },
        { id: 'arrays', title: { zh: '数组与多维数组', en: 'Arrays & multidimensional arrays' }, topics: ['一维数组', '二维数组'] },
        { id: 'strings', title: { zh: '字符串', en: 'Strings' }, topics: ['std::string', '常用操作'] },
        { id: 'structs', title: { zh: '结构体', en: 'Structs' }, topics: ['定义与使用', '成员访问'] },
        { id: 'enums', title: { zh: '枚举', en: 'Enums' }, topics: ['enum', 'enum class'] },
      ],
    },
    {
      id: 'cpp-advanced',
      title: { zh: '进阶部分', en: 'Advanced' },
      chapters: [
        { id: 'pointers', title: { zh: '指针与内存地址', en: 'Pointers & memory addresses' }, topics: ['地址', '解引用', '指针运算', '内存图可视化'] },
        { id: 'references', title: { zh: '引用', en: 'References' }, topics: ['左值引用', '与指针的区别'] },
        { id: 'dynamic-memory', title: { zh: '动态内存', en: 'Dynamic memory' }, topics: ['new/delete', '内存泄漏'] },
        { id: 'stack-heap', title: { zh: '栈内存与堆内存', en: 'Stack vs heap' }, topics: ['生命周期', '内存布局图'] },
        { id: 'classes', title: { zh: '类与对象', en: 'Classes & objects' }, topics: ['成员', '访问控制'] },
        { id: 'oop', title: { zh: '封装、继承、多态', en: 'Encapsulation, inheritance, polymorphism' }, topics: ['封装', '继承', '虚函数多态'] },
        { id: 'ctor-dtor', title: { zh: '构造函数与析构函数', en: 'Constructors & destructors' }, topics: ['构造', '析构', '初始化列表'] },
        { id: 'overloading', title: { zh: '函数重载与运算符重载', en: 'Function & operator overloading' }, topics: ['函数重载', '运算符重载'] },
        { id: 'templates', title: { zh: '模板', en: 'Templates' }, topics: ['函数模板', '类模板'] },
        { id: 'exceptions', title: { zh: '异常处理', en: 'Exception handling' }, topics: ['try/catch', 'throw'] },
        { id: 'lambda', title: { zh: 'Lambda', en: 'Lambda expressions' }, topics: ['捕获', '参数'] },
        { id: 'stl', title: { zh: 'STL', en: 'STL' }, topics: ['容器', '算法', '迭代器'] },
        { id: 'containers', title: { zh: 'vector、list、deque、stack、queue、priority_queue、set、map、unordered_map', en: 'Containers' }, topics: ['vector', 'list', 'deque', 'stack', 'queue', 'priority_queue', 'set', 'map', 'unordered_map'] },
        { id: 'iterators', title: { zh: '迭代器', en: 'Iterators' }, topics: ['种类', '失效'] },
        { id: 'smart-pointers', title: { zh: '智能指针', en: 'Smart pointers' }, topics: ['unique_ptr', 'shared_ptr', 'weak_ptr'] },
        { id: 'raii', title: { zh: 'RAII', en: 'RAII' }, topics: ['资源管理', '与 GC 对比'] },
        { id: 'move', title: { zh: '移动语义', en: 'Move semantics' }, topics: ['右值引用', 'std::move', '移动构造'] },
        { id: 'concurrency', title: { zh: '基础并发', en: 'Basic concurrency' }, topics: ['std::thread', 'mutex', 'async'] },
      ],
    },
  ],
  csharp: [
    {
      id: 'csharp-basics',
      title: { zh: '基础部分', en: 'Basics' },
      chapters: [
        { id: 'structure', title: { zh: '程序结构', en: 'Program structure' }, topics: ['Main', '命名空间', 'using'] },
        { id: 'vars-types', title: { zh: '变量与类型', en: 'Variables & types' }, topics: ['内置类型', 'var', '常量'] },
        { id: 'operators', title: { zh: '运算符', en: 'Operators' }, topics: ['算术', '关系', '逻辑'] },
        { id: 'conditionals-loops', title: { zh: '条件与循环', en: 'Conditionals & loops' }, topics: ['if/switch', 'for/while/foreach'] },
        { id: 'methods', title: { zh: '方法', en: 'Methods' }, topics: ['定义', '参数', '返回值', '重载'] },
        { id: 'arrays', title: { zh: '数组', en: 'Arrays' }, topics: ['一维/多维', '锯齿数组'] },
        { id: 'strings', title: { zh: '字符串', en: 'Strings' }, topics: ['不可变性', '常用方法', 'StringBuilder'] },
        { id: 'collections', title: { zh: '集合', en: 'Collections' }, topics: ['List', 'Dictionary', 'HashSet'] },
        { id: 'enums', title: { zh: '枚举', en: 'Enums' }, topics: ['enum', 'Flags'] },
        { id: 'value-vs-reference', title: { zh: '值类型与引用类型', en: 'Value vs reference types' }, topics: ['struct', 'class', '对象关系图'] },
      ],
    },
    {
      id: 'csharp-advanced',
      title: { zh: '进阶部分', en: 'Advanced' },
      chapters: [
        { id: 'classes', title: { zh: '类与对象', en: 'Classes & objects' }, topics: ['成员', '访问修饰符', 'static'] },
        { id: 'oop', title: { zh: '封装、继承、多态', en: 'Encapsulation, inheritance, polymorphism' }, topics: ['封装', '继承', 'virtual/override'] },
        { id: 'interfaces', title: { zh: '接口与抽象类', en: 'Interfaces & abstract classes' }, topics: ['interface', 'abstract'] },
        { id: 'generics', title: { zh: '泛型', en: 'Generics' }, topics: ['泛型方法', '泛型约束'] },
        { id: 'delegates', title: { zh: '委托', en: 'Delegates' }, topics: ['delegate', 'Func/Action', '动态流程图'] },
        { id: 'events', title: { zh: '事件', en: 'Events' }, topics: ['event', '订阅与发布'] },
        { id: 'lambda', title: { zh: 'Lambda 表达式', en: 'Lambda expressions' }, topics: ['语法', '捕获'] },
        { id: 'linq', title: { zh: 'LINQ', en: 'LINQ' }, topics: ['查询语法', '方法语法', '延迟执行流程图'] },
        { id: 'exceptions', title: { zh: '异常处理', en: 'Exception handling' }, topics: ['try/catch/finally', 'throw'] },
        { id: 'properties', title: { zh: '属性', en: 'Properties' }, topics: ['get/set', '自动属性'] },
        { id: 'indexers', title: { zh: '索引器', en: 'Indexers' }, topics: ['this[]'] },
        { id: 'extensions', title: { zh: '扩展方法', en: 'Extension methods' }, topics: ['this 参数'] },
        { id: 'nullable', title: { zh: '可空类型', en: 'Nullable types' }, topics: ['?', '??', '?.'] },
        { id: 'records', title: { zh: '记录类型', en: 'Records' }, topics: ['record', 'with 表达式'] },
        { id: 'async', title: { zh: 'async/await', en: 'async/await' }, topics: ['异步方法', '执行流程图'] },
        { id: 'task', title: { zh: 'Task', en: 'Task' }, topics: ['Task.Run', 'WhenAll', '取消'] },
        { id: 'reflection', title: { zh: '基础反射', en: 'Basic reflection' }, topics: ['Type', 'GetMethods'] },
        { id: 'gc', title: { zh: '垃圾回收基本原理', en: 'Garbage collection basics' }, topics: ['托管堆', '代', '对象生命周期图'] },
      ],
    },
  ],
  python: [
    {
      id: 'python-basics',
      title: { zh: '基础部分', en: 'Basics' },
      chapters: [
        { id: 'structure', title: { zh: '程序结构', en: 'Program structure' }, topics: ['缩进', '入口'] },
        { id: 'vars', title: { zh: '变量与动态类型', en: 'Variables & dynamic typing' }, topics: ['赋值', '动态类型', '引用模型'] },
        { id: 'primitives', title: { zh: '数字、字符串和布尔值', en: 'Numbers, strings & booleans' }, topics: ['int/float', 'str', 'bool'] },
        { id: 'conditionals-loops', title: { zh: '条件与循环', en: 'Conditionals & loops' }, topics: ['if/elif/else', 'for/while'] },
        { id: 'functions', title: { zh: '函数', en: 'Functions' }, topics: ['def', '返回值', '作用域'] },
        { id: 'params', title: { zh: '参数', en: 'Parameters' }, topics: ['位置/关键字', '默认值', '*args/**kwargs'] },
        { id: 'containers', title: { zh: '列表、元组、集合、字典', en: 'Lists, tuples, sets, dicts' }, topics: ['list', 'tuple', 'set', 'dict'] },
        { id: 'slicing', title: { zh: '切片', en: 'Slicing' }, topics: ['start:stop:step', '负索引'] },
        { id: 'comprehensions', title: { zh: '推导式', en: 'Comprehensions' }, topics: ['列表', '字典', '集合'] },
        { id: 'modules', title: { zh: '模块与包', en: 'Modules & packages' }, topics: ['import', '包'] },
        { id: 'files', title: { zh: '文件读写', en: 'File I/O' }, topics: ['open', 'with'] },
        { id: 'exceptions', title: { zh: '异常处理', en: 'Exception handling' }, topics: ['try/except', 'raise', 'finally'] },
      ],
    },
    {
      id: 'python-advanced',
      title: { zh: '进阶部分', en: 'Advanced' },
      chapters: [
        { id: 'classes', title: { zh: '类与对象', en: 'Classes & objects' }, topics: ['class', '__init__', 'self'] },
        { id: 'oop', title: { zh: '继承与多态', en: 'Inheritance & polymorphism' }, topics: ['继承', 'super', '多态'] },
        { id: 'magic', title: { zh: '魔术方法', en: 'Magic methods' }, topics: ['__str__', '__eq__', '__len__'] },
        { id: 'iterators', title: { zh: '迭代器', en: 'Iterators' }, topics: ['__iter__', '__next__'] },
        { id: 'generators', title: { zh: '生成器', en: 'Generators' }, topics: ['yield', '执行流程图解'] },
        { id: 'decorators', title: { zh: '装饰器', en: 'Decorators' }, topics: ['闭包基础', '@语法', '图解'] },
        { id: 'closures', title: { zh: '闭包', en: 'Closures' }, topics: ['捕获', 'nonlocal', '图解'] },
        { id: 'context-managers', title: { zh: '上下文管理器', en: 'Context managers' }, topics: ['with', '__enter__/__exit__'] },
        { id: 'typing', title: { zh: '类型标注', en: 'Type hints' }, topics: ['标注', 'Optional', '泛型'] },
        { id: 'dataclass', title: { zh: 'dataclass', en: 'dataclass' }, topics: ['装饰器', '字段'] },
        { id: 'copy', title: { zh: '深拷贝与浅拷贝', en: 'Deep vs shallow copy' }, topics: ['copy', 'deepcopy', '对象引用图'] },
        { id: 'lambda', title: { zh: 'Lambda', en: 'Lambda' }, topics: ['语法', '限制'] },
        { id: 'hof', title: { zh: '高阶函数', en: 'Higher-order functions' }, topics: ['map', 'filter', 'reduce'] },
        { id: 'async', title: { zh: 'async/await', en: 'async/await' }, topics: ['协程', '事件循环图解'] },
        { id: 'concurrency', title: { zh: '基础并发', en: 'Basic concurrency' }, topics: ['threading', 'GIL'] },
        { id: 'refs-gc', title: { zh: 'Python 对象引用与垃圾回收概念', en: 'Object references & GC concepts' }, topics: ['引用计数', '循环引用', '对象引用图'] },
      ],
    },
  ],
};

export const lessonLanguages: CodeLang[] = ['cpp', 'csharp', 'python'];
