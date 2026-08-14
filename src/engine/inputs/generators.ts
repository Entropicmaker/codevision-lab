import type { InputFieldSpec } from '../types/algorithm';
import type { EdgePair } from './parsers';

/**
 * 随机整数数组生成。生成合法数据：
 * - 长度在 [minLen, maxLen]（默认 6–12）
 * - 值域 [valueMin, valueMax]（默认 1–99）
 * - 可选 seed 保证可复现（测试用）
 */
export function randomIntArray(spec: InputFieldSpec, length?: number, seed?: number): number[] {
  const minLen = spec.minLen ?? 6;
  const maxLen = spec.maxLen ?? 12;
  const valueMin = spec.valueMin ?? 1;
  const valueMax = spec.valueMax ?? 99;
  const target = length ?? minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
  const clampedLength = Math.max(minLen, Math.min(maxLen, target));

  let state = seed !== undefined ? seed : Math.floor(Math.random() * 0x7fffffff);
  const next = (): number => {
    // xorshift32：确定且廉价
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };

  const out: number[] = [];
  for (let i = 0; i < clampedLength; i += 1) {
    const v = Math.floor(valueMin + next() * (valueMax - valueMin + 1));
    out.push(Math.min(valueMax, v));
  }
  return out;
}

/** 把数组序列化为输入字符串 */
export function arrayToInput(values: number[]): string {
  return values.join(', ');
}

/** 随机完全/近似完全二叉树（层序，null 概率 ~20%） */
export function randomTreeArray(nodeCount = 11, valueMax = 99, seed?: number): (number | null)[] {
  let state = seed !== undefined ? seed : Math.floor(Math.random() * 0x7fffffff);
  const next = (): number => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
  const out: (number | null)[] = [];
  for (let i = 0; i < nodeCount; i += 1) {
    if (i > 0 && next() < 0.22) {
      out.push(null);
    } else {
      out.push(Math.floor(next() * valueMax) + 1);
    }
  }
  if (out[0] === null) out[0] = Math.floor(next() * valueMax) + 1;
  return out;
}

/** 随机连通图边列表（n 节点，先连生成树再加随机边） */
export function randomEdgeList(nodeCount = 6, extraEdges = 2, seed?: number): EdgePair[] {
  let state = seed !== undefined ? seed : Math.floor(Math.random() * 0x7fffffff);
  const next = (): number => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
  const edges: EdgePair[] = [];
  const connected = new Set<number>([0]);
  // 生成树保证连通
  for (let node = 1; node < nodeCount; node += 1) {
    const from = Math.floor(next() * connected.size);
    const pick = Array.from(connected)[from] ?? 0;
    edges.push([pick, node]);
    connected.add(node);
  }
  // 随机附加边
  for (let e = 0; e < extraEdges; e += 1) {
    const a = Math.floor(next() * nodeCount);
    const b = Math.floor(next() * nodeCount);
    if (a !== b && !edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
      edges.push([a, b]);
    }
  }
  return edges;
}

export function treeToInput(values: (number | null)[]): string {
  return values.map((v) => (v === null ? 'null' : String(v))).join(', ');
}

export function edgesToInput(edges: EdgePair[]): string {
  return edges.map(([a, b]) => `${a}-${b}`).join(', ');
}

/** 按 inputSpec.kind 生成随机输入字符串 */
export function randomInputForSpec(spec: InputFieldSpec): string {
  switch (spec.kind) {
    case 'tree-array':
      return treeToInput(randomTreeArray(11));
    case 'edge-list':
      return edgesToInput(randomEdgeList(6, 2));
    case 'int-array':
    default:
      return arrayToInput(randomIntArray(spec, 8));
  }
}
