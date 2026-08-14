import { describe, expect, it } from 'vitest';
import { algorithmMetas } from './registry';
import { getRunner } from '../../engine/runners/registry';
import { extractLineMap, extractPseudocodeLines } from '../../engine/codeMap/extract';
import { parseInputByKind } from '../../engine/inputs/parsers';

/**
 * 内容注册表校验：任何新算法都必须通过这些不变量，
 * 保证三语言代码行映射一致、Runner 确定性、步骤协议合法。
 */
describe('算法内容注册表完整性', () => {
  it('算法 id 唯一', () => {
    const ids = algorithmMetas.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每个算法都有已注册的 runner', () => {
    for (const meta of algorithmMetas) {
      expect(getRunner(meta.runnerId), `runner ${meta.runnerId} 未注册`).toBeDefined();
    }
  });

  it('三种语言 lineMap 的 codeLineId 集合完全一致', () => {
    for (const meta of algorithmMetas) {
      const keys = (['cpp', 'csharp', 'python'] as const).map((lang) =>
        Object.keys(meta.codeExamples[lang].lineMap).sort(),
      );
      expect(keys[1], `${meta.id}: csharp 与 cpp 行标记不一致`).toEqual(keys[0]);
      expect(keys[2], `${meta.id}: python 与 cpp 行标记不一致`).toEqual(keys[0]);
    }
  });

  it('伪代码的 codeLineId 集合与三语言源码一致', () => {
    for (const meta of algorithmMetas) {
      const pseudoIds = extractPseudocodeLines(meta.pseudocode)
        .map((l) => l.codeLineId)
        .filter((id): id is string => id !== null)
        .sort();
      const sourceIds = Object.keys(meta.codeExamples.cpp.lineMap).sort();
      expect(pseudoIds, `${meta.id}: 伪代码行标记与源码不一致`).toEqual(sourceIds);
    }
  });

  it('Runner 对默认输入：确定性、步骤协议合法', () => {
    for (const meta of algorithmMetas) {
      const runner = getRunner(meta.runnerId);
      if (!runner) continue;
      const value = buildDefaultValue(meta);
      const first = runner({ kind: meta.inputSpec.kind, value });
      const second = runner({ kind: meta.inputSpec.kind, value });
      expect(first.steps, `${meta.id}: Runner 非确定性`).toEqual(second.steps);

      first.steps.forEach((step, i) => {
        expect(step.stepId, `${meta.id}: stepId 不连续`).toBe(i);
        expect(step.explanation.zh.length, `${meta.id}: 步骤缺中文说明`).toBeGreaterThan(0);
        expect(step.explanation.en.length, `${meta.id}: 步骤缺英文说明`).toBeGreaterThan(0);
      });

      // 统计单调不减
      for (let i = 1; i < first.steps.length; i += 1) {
        const prev = first.steps[i - 1]!.stats;
        const cur = first.steps[i]!.stats;
        expect(cur.comparisons, `${meta.id}: comparisons 回退`).toBeGreaterThanOrEqual(prev.comparisons);
        expect(cur.swaps, `${meta.id}: swaps 回退`).toBeGreaterThanOrEqual(prev.swaps);
        expect(cur.accesses, `${meta.id}: accesses 回退`).toBeGreaterThanOrEqual(prev.accesses);
      }
    }
  });

  it('Runner 引用的 codeLineId 均存在于三语言 lineMap', () => {
    for (const meta of algorithmMetas) {
      const runner = getRunner(meta.runnerId);
      if (!runner) continue;
      const { steps } = runner({ kind: meta.inputSpec.kind, value: buildDefaultValue(meta) });
      for (const step of steps) {
        if (step.codeLineId === null) continue;
        for (const lang of ['cpp', 'csharp', 'python'] as const) {
          expect(
            meta.codeExamples[lang].lineMap[step.codeLineId],
            `${meta.id}: codeLineId "${step.codeLineId}" 在 ${lang} 中无映射`,
          ).toBeTypeOf('number');
        }
      }
    }
  });

  it('默认输入可通过 inputSpec 校验', () => {
    for (const meta of algorithmMetas) {
      const result = parseInputByKind(meta.defaultInput, meta.inputSpec);
      expect(result.ok, `${meta.id}: 默认输入非法`).toBe(true);
    }
  });
});

/** 按 inputSpec 构造默认输入值（数组或带 aux 的复合输入） */
function buildDefaultValue(meta: (typeof algorithmMetas)[number]): unknown {
  const parsed = parseInputByKind(meta.defaultInput, meta.inputSpec);
  if (!parsed.ok) throw new Error(`${meta.id}: 默认输入非法`);
  if (meta.inputSpec.aux) {
    return { array: parsed.value, aux: meta.inputSpec.aux.default };
  }
  return parsed.value;
}

describe('extractLineMap 对注册表内容可用', () => {
  it('冒泡排序三语言行标记完整', () => {
    const bubble = algorithmMetas.find((m) => m.id === 'bubble-sort');
    expect(bubble).toBeDefined();
    const map = extractLineMap(bubble!.codeExamples.cpp.source);
    expect(Object.keys(map).length).toBeGreaterThanOrEqual(6);
  });
});
