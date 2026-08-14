/**
 * 引擎核心类型 —— 统一步骤协议（Step Schema）
 * 所有算法 Runner 与渲染器共用；课程知识点演示复用同一协议。
 */

/** 支持的三门语言 */
export type CodeLang = 'cpp' | 'csharp' | 'python';

/** 界面语言 */
export type Locale = 'zh' | 'en';

/** 中英双语文本 */
export interface LocalizedText {
  zh: string;
  en: string;
}

export type Primitive = string | number | boolean | null;

/**
 * 元素状态 → 统一配色语义：
 * idle 灰=未访问；active 蓝=当前访问；comparing 黄=正在比较；
 * done 绿=已完成/已访问/已排序；invalid 红=冲突/错误/无效路径；call 紫=函数调用/递归。
 */
export type ElementState =
  | 'idle'
  | 'active'
  | 'comparing'
  | 'done'
  | 'invalid'
  | 'call';

/** 画布上一个可显示的元素（数组元素、栈项、树节点、图节点等） */
export interface DisplayItem {
  /** 步骤内唯一 id，如 a:0、stack:2、node:3 */
  id: string;
  value: Primitive;
  state: ElementState;
  /** 附加标注（如权重、键名） */
  label?: string;
  /** 可选的显式画布坐标（图节点用）；缺省时由渲染器自动布局 */
  x?: number;
  y?: number;
}

/** 指针 / 索引标注（i、j、mid、front、rear、top …） */
export interface PointerState {
  id: string;
  /** 显示名 */
  name: string;
  /** 指向的 DisplayItem id 或容器 id */
  target: string;
  note?: LocalizedText;
}

/** 函数调用栈帧 */
export interface CallFrame {
  id: string;
  function: string;
  args: Record<string, Primitive>;
  locals: Record<string, Primitive>;
  returnValue?: Primitive;
  /** 递归层数（从 1 开始） */
  depth: number;
}

/** 累计操作统计 */
export interface OpStats {
  comparisons: number;
  swaps: number;
  accesses: number;
  writes: number;
}

export interface TreeEdge {
  from: string;
  to: string;
  label?: string;
  state?: ElementState;
}

export interface TreeSnapshot {
  kind: 'tree';
  id: string;
  nodes: DisplayItem[];
  edges: TreeEdge[];
  rootId: string | null;
}

export interface GraphEdge {
  from: string;
  to: string;
  /** 权重等标注 */
  label?: string;
  directed?: boolean;
  state?: ElementState;
}

export interface GraphSnapshot {
  kind: 'graph';
  id: string;
  nodes: DisplayItem[];
  edges: GraphEdge[];
}

export interface TableCell extends DisplayItem {
  /** 该格的行/列（供转移来源箭头使用） */
  row: number;
  col: number;
}

export interface TableSnapshot {
  kind: 'table';
  id: string;
  rows: number;
  cols: number;
  /** 列标题（如背包容量 0..W 或斐波那契 n） */
  colHeaders: string[];
  rowHeaders: string[];
  cells: TableCell[];
  /** 转移来源箭头：from → to */
  sourceEdges: Array<{ from: { row: number; col: number }; to: { row: number; col: number }; state?: ElementState }>;
}

/** 栈 / 队列：items[0] 为底 / 队首方向由渲染器约定（栈 items 末尾为栈顶；队列 items[0] 为队首） */
export interface LinearStructureSnapshot {
  kind: 'stack' | 'queue' | 'linked-list';
  id: string;
  items: DisplayItem[];
  /** 链表节点间的连接是否完整（false 时渲染"断裂"提示） */
  linked?: boolean;
  capacity?: number;
}

export type StructureSnapshot =
  | LinearStructureSnapshot
  | TreeSnapshot
  | GraphSnapshot
  | TableSnapshot;

/** 算法操作类型（用于步骤说明图标/文案） */
export type OperationType =
  | 'init'
  | 'compare'
  | 'swap'
  | 'assign'
  | 'push'
  | 'pop'
  | 'enqueue'
  | 'dequeue'
  | 'visit'
  | 'backtrack'
  | 'shift'
  | 'return'
  | 'found'
  | 'not-found'
  | 'finalize'
  | 'no-op';

/** 统一步骤协议：一步 = 一份不可变状态快照 */
export interface AlgorithmStep {
  /** 从 0 开始的步骤序号 */
  stepId: number;
  /** 当前执行的逻辑代码行 id（跨语言共享，经 CodeMap 映射到各语言行号） */
  codeLineId: string | null;
  operation: OperationType;
  /** 容器快照：数组 / 字符串 / 行向量等，值为显示元素列表 */
  containers: Record<string, DisplayItem[]>;
  /** 结构快照：栈/队列/链表/树/图/表格 */
  structures: StructureSnapshot[];
  /** 变量表快照 */
  variables: Record<string, Primitive>;
  pointers: PointerState[];
  callStack: CallFrame[];
  /** 标准输出（累积） */
  output: string[];
  /** 本步骤中文/英文说明 */
  explanation: LocalizedText;
  /** 累计操作统计 */
  stats: OpStats;
}

/** Runner 执行结果 */
export interface RunnerResult {
  steps: AlgorithmStep[];
  summary: {
    /** 最终结果描述 */
    result: string;
    resultValue?: Primitive;
    totalSteps: number;
    stats: OpStats;
  };
}

/** 算法执行器：纯函数、确定性（同输入必同输出），禁止内部使用随机数与时间 */
export type AlgorithmRunner = (input: ParsedInput) => RunnerResult;

/** 解析/校验后的统一输入 */
export interface ParsedInput {
  kind: string;
  value: unknown;
}

/** 单步函数：便于测试断言与调试 */
export interface StepContext {
  nextStepId: number;
}

/** 便捷构造器：空统计 */
export function emptyStats(): OpStats {
  return { comparisons: 0, swaps: 0, accesses: 0, writes: 0 };
}

/** 便捷构造器：空步骤 */
export function createStep(
  stepId: number,
  codeLineId: string | null,
  operation: OperationType,
  explanation: LocalizedText,
  stats: OpStats,
): AlgorithmStep {
  return {
    stepId,
    codeLineId,
    operation,
    containers: {},
    structures: [],
    variables: {},
    pointers: [],
    callStack: [],
    output: [],
    explanation,
    stats: { ...stats },
  };
}

/** 便捷构造器：显示元素 */
export function item(id: string, value: Primitive, state: ElementState = 'idle', label?: string): DisplayItem {
  return { id, value, state, label };
}
