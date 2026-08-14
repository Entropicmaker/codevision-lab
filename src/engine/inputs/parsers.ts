import type { InputFieldSpec } from '../types/algorithm';

export interface InputError {
  key: 'invalidArray' | 'emptyInput' | 'tooManyItems' | 'outOfRange';
  params?: Record<string, number>;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: InputError };

/** 解析附加标量整数（如二分搜索的目标值） */
export function parseIntAux(
  raw: string,
  aux: NonNullable<InputFieldSpec['aux']>,
): ParseResult<number> {
  const trimmed = raw.trim();
  if (!/^[+-]?\d+$/.test(trimmed)) {
    return { ok: false, error: { key: 'invalidArray' } };
  }
  const num = Number(trimmed);
  if (!Number.isSafeInteger(num)) {
    return { ok: false, error: { key: 'invalidArray' } };
  }
  if (num < aux.min || num > aux.max) {
    return { ok: false, error: { key: 'outOfRange', params: { min: aux.min, max: aux.max } } };
  }
  return { ok: true, value: num };
}

export type EdgePair = [number, number];

/** 层序树数组：数字或 null（空节点），如 1, 2, 3, null, 4, 5 */
export function parseTreeArray(raw: string, spec: InputFieldSpec): ParseResult<(number | null)[]> {
  const trimmed = raw.trim();
  if (trimmed === '') {
    if (spec.allowEmpty) return { ok: true, value: [] };
    return { ok: false, error: { key: 'emptyInput' } };
  }
  const tokens = trimmed.split(',');
  const values: (number | null)[] = [];
  for (const token of tokens) {
    const t = token.trim().toLowerCase();
    if (t === 'null' || t === '#' || t === '') {
      values.push(null);
      continue;
    }
    if (!/^[+-]?\d+$/.test(t)) {
      return { ok: false, error: { key: 'invalidArray' } };
    }
    const num = Number(t);
    if (!Number.isSafeInteger(num)) {
      return { ok: false, error: { key: 'invalidArray' } };
    }
    values.push(num);
  }
  if (values[0] === null) {
    return { ok: false, error: { key: 'invalidArray' } };
  }
  if (spec.maxLen !== undefined && values.length > spec.maxLen) {
    return { ok: false, error: { key: 'tooManyItems', params: { max: spec.maxLen } } };
  }
  return { ok: true, value: values };
}

/** 边列表：0-1, 0-2, 1-3 → [[0,1],[0,2],[1,3]]；校验节点编号从 0 连续编号 */
export function parseEdgeList(raw: string, spec: InputFieldSpec): ParseResult<EdgePair[]> {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: { key: 'emptyInput' } };
  }
  const edges: EdgePair[] = [];
  const tokens = trimmed.split(',');
  for (const token of tokens) {
    const t = token.trim();
    const match = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (!match) {
      return { ok: false, error: { key: 'invalidArray' } };
    }
    const from = Number(match[1]);
    const to = Number(match[2]);
    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to) || from === to) {
      return { ok: false, error: { key: 'invalidArray' } };
    }
    edges.push([from, to]);
  }
  // 校验节点编号连续（0..max 无空洞）
  const nodes = new Set<number>();
  for (const [a, b] of edges) {
    nodes.add(a);
    nodes.add(b);
  }
  const max = nodes.size > 0 ? Math.max(...nodes) : 0;
  for (let i = 0; i <= max; i += 1) {
    if (!nodes.has(i)) {
      return { ok: false, error: { key: 'invalidArray' } };
    }
  }
  if (spec.maxLen !== undefined && edges.length > spec.maxLen) {
    return { ok: false, error: { key: 'tooManyItems', params: { max: spec.maxLen } } };
  }
  return { ok: true, value: edges };
}

export type AnyInputValue = number[] | (number | null)[] | EdgePair[];

/** 按 inputSpec.kind 分派解析 */
export function parseInputByKind(raw: string, spec: InputFieldSpec): ParseResult<AnyInputValue> {
  switch (spec.kind) {
    case 'tree-array':
      return parseTreeArray(raw, spec);
    case 'edge-list':
      return parseEdgeList(raw, spec);
    case 'int-array':
    default:
      return parseIntArray(raw, spec);
  }
}

/** 解析 aux 或返回默认值 */
export function parseAuxOrDefault(
  raw: string,
  aux: NonNullable<InputFieldSpec['aux']> | undefined,
): ParseResult<number> {
  if (!aux) return { ok: true, value: 0 };
  if (raw.trim() === '') return { ok: true, value: aux.default };
  return parseIntAux(raw, aux);
}

/**
 * 解析逗号分隔的整数数组。严格校验：
 * - 空输入 → emptyInput（除非 allowEmpty）
 * - 非法 token（含小数/非数字/空白不完整）→ invalidArray
 * - 数量超出 maxLen → tooManyItems
 * - 数值超出 [valueMin, valueMax] → outOfRange
 */
export function parseIntArray(raw: string, spec: InputFieldSpec): ParseResult<number[]> {  const trimmed = raw.trim();
  if (trimmed === '') {
    if (spec.allowEmpty) return { ok: true, value: [] };
    return { ok: false, error: { key: 'emptyInput' } };
  }
  const tokens = trimmed.split(',');
  const values: number[] = [];
  for (const token of tokens) {
    const t = token.trim();
    // 仅接受可带正负号的纯整数
    if (!/^[+-]?\d+$/.test(t)) {
      return { ok: false, error: { key: 'invalidArray' } };
    }
    const num = Number(t);
    if (!Number.isSafeInteger(num)) {
      return { ok: false, error: { key: 'invalidArray' } };
    }
    if (spec.valueMin !== undefined && num < spec.valueMin) {
      return { ok: false, error: { key: 'outOfRange', params: { min: spec.valueMin, max: spec.valueMax ?? 0 } } };
    }
    if (spec.valueMax !== undefined && num > spec.valueMax) {
      return { ok: false, error: { key: 'outOfRange', params: { min: spec.valueMin ?? 0, max: spec.valueMax } } };
    }
    values.push(num);
  }
  if (spec.minLen !== undefined && values.length < spec.minLen) {
    return { ok: false, error: { key: 'tooManyItems', params: { max: spec.maxLen ?? 0 } } };
  }
  if (spec.maxLen !== undefined && values.length > spec.maxLen) {
    return { ok: false, error: { key: 'tooManyItems', params: { max: spec.maxLen } } };
  }
  return { ok: true, value: values };
}
