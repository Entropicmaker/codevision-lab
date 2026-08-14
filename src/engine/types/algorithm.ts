import type { CodeLang, LocalizedText } from './step';

/** 算法分类 */
export type CategoryId =
  | 'array'
  | 'basic-structure'
  | 'sorting'
  | 'searching'
  | 'two-pointers'
  | 'sliding-window'
  | 'stack'
  | 'queue'
  | 'linked-list'
  | 'tree'
  | 'graph'
  | 'dp';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ComplexityInfo {
  time: { best: string; average: string; worst: string };
  space: string;
}

/** 单语言示例代码：源码 + codeLineId → 行号映射 */
export interface CodeExample {
  language: CodeLang;
  source: string;
  lineMap: Record<string, number>;
}

/** 常见错误 / 边界情况 */
export interface Mistake {
  title: LocalizedText;
  detail: LocalizedText;
  code?: string;
}

/** 输入字段规格：驱动校验器与随机生成器 */
export interface InputFieldSpec {
  name: string;
  kind: 'int-array' | 'tree-array' | 'edge-list' | 'string' | 'int-matrix';
  minLen?: number;
  maxLen?: number;
  valueMin?: number;
  valueMax?: number;
  allowEmpty?: boolean;
  /** 附加标量输入（如二分搜索的目标值、滑动窗口大小、图遍历起点） */
  aux?: {
    name: LocalizedText;
    kind: 'int';
    min: number;
    max: number;
    default: number;
  };
}

export interface BoundaryCase {
  name: LocalizedText;
  input: string;
}

/** 算法元数据（内容层，与执行逻辑分离） */
export interface AlgorithmMeta {
  id: string;
  name: LocalizedText;
  category: CategoryId;
  difficulty: Difficulty;
  description: LocalizedText;
  complexity: ComplexityInfo;
  /** 前置算法 id（技能树依赖） */
  prerequisites: string[];
  tags: string[];
  inputSpec: InputFieldSpec;
  /** 默认输入（可解析的字符串） */
  defaultInput: string;
  /** 预设案例（常规） */
  presets: BoundaryCase[];
  /** 边界测试案例 */
  boundaryCases: BoundaryCase[];
  /** Runner 注册 id */
  runnerId: string;
  /** 可视化形式 */
  visualKind: VisualKind;
  codeExamples: Record<CodeLang, CodeExample>;
  /** 伪代码（含 //>codeLineId 行标记） */
  pseudocode: string;
  commonMistakes: Mistake[];
}

/** 可视化形式（渲染器注册表 key） */
export type VisualKind =
  | 'array-bars'
  | 'array-blocks'
  | 'stack'
  | 'queue'
  | 'linked-list'
  | 'tree'
  | 'graph'
  | 'table';

/** 技能树节点（与算法/课程内容共用） */
export interface RoadmapNode {
  id: string;
  kind: 'algorithm';
  title: LocalizedText;
  category: CategoryId;
  difficulty: Difficulty;
  prerequisites: string[];
}
