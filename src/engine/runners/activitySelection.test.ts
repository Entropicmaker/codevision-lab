import { describe, expect, it } from 'vitest';
import { runActivitySelection, ACTIVITY_LINES } from './activitySelection';
import { activitySelectionMeta } from '../../content/algorithms/activity-selection';
import { parseIntervalList } from '../inputs/parsers';

const DEFAULT: Array<[number, number]> = [
  [3, 5], [0, 6], [5, 9], [1, 4], [8, 12], [5, 7], [6, 10], [2, 13], [8, 11], [12, 14], [3, 8],
];
const SINGLE: Array<[number, number]> = [[1, 4]];
const TOUCHING: Array<[number, number]> = [[1, 3], [3, 5], [5, 7]];

function run(intervals: Array<[number, number]>) {
  return runActivitySelection({ kind: 'interval-list', value: intervals });
}

const compatible = (a: [number, number], b: [number, number]): boolean =>
  a[1] <= b[0] || b[1] <= a[0];

describe('runActivitySelection', () => {
  it('默认输入选中 4 个活动：1-4、5-7、8-11、12-14', () => {
    const { summary, steps } = run(DEFAULT);
    expect(summary.result).toBe('1-4, 5-7, 8-11, 12-14');
    expect(summary.resultValue).toBe(4);
    expect(summary.stats.comparisons).toBe(11); // 每个活动比较一次
    expect(summary.stats.writes).toBe(4); // 每次选中更新一次 lastEnd
    const last = steps[steps.length - 1];
    expect(last?.output).toContain('1-4, 5-7, 8-11, 12-14');
  });

  it('选中活动两两相容（互不重叠）', () => {
    const { summary } = run(DEFAULT);
    const selected = summary.result.split(', ').map((s) => s.split('-').map(Number) as [number, number]);
    expect(selected).toHaveLength(4);
    for (let i = 0; i < selected.length; i += 1) {
      for (let j = i + 1; j < selected.length; j += 1) {
        expect(compatible(selected[i]!, selected[j]!)).toBe(true);
      }
    }
  });

  it('选出的数量是全局最优（暴力枚举所有子集验证）', () => {
    const { summary } = run(DEFAULT);
    const n = DEFAULT.length;
    let best = 0;
    for (let mask = 0; mask < (1 << n); mask += 1) {
      const chosen: Array<[number, number]> = [];
      for (let i = 0; i < n; i += 1) {
        if (mask & (1 << i)) chosen.push(DEFAULT[i]!);
      }
      let ok = true;
      for (let i = 0; i < chosen.length && ok; i += 1) {
        for (let j = i + 1; j < chosen.length; j += 1) {
          if (!compatible(chosen[i]!, chosen[j]!)) {
            ok = false;
            break;
          }
        }
      }
      if (ok) best = Math.max(best, chosen.length);
    }
    expect(summary.resultValue).toBe(best);
  });

  it('确定性：同输入两次运行产生完全相同步骤', () => {
    const a = run(DEFAULT);
    const b = run(DEFAULT);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run(DEFAULT);
    const snapshot = JSON.parse(JSON.stringify(steps[4]));
    steps[3].containers['activities']![0]!.value = '999-999';
    steps[3].containers['activities']![0]!.state = 'done';
    expect(steps[4]).toEqual(snapshot);
  });

  it('选中的活动标记 done，冲突活动标记 invalid', () => {
    const { steps } = run(DEFAULT);
    const final = steps[steps.length - 1]!;
    const items = final.containers['activities']!;
    const done = items.filter((el) => el.state === 'done').map((el) => el.value);
    const invalid = items.filter((el) => el.state === 'invalid').map((el) => el.value);
    expect(done).toEqual(['1-4', '5-7', '8-11', '12-14']);
    expect(done.length + invalid.length).toBe(DEFAULT.length);
    expect(items.some((el) => el.state === 'idle')).toBe(false);
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run(DEFAULT);
    const ids = steps.map((s) => s.codeLineId);
    for (const id of Object.values(ACTIVITY_LINES)) {
      expect(ids).toContain(id);
    }
  });

  it('每步 codeLineId 都能映射到三种语言源码', () => {
    const { steps } = run(DEFAULT);
    const maps = activitySelectionMeta.codeExamples;
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('单一活动直接选中，count = 1', () => {
    const { summary } = run(SINGLE);
    expect(summary.result).toBe('1-4');
    expect(summary.resultValue).toBe(1);
    expect(summary.stats.comparisons).toBe(1);
  });

  it('端点相接的活动（s == lastEnd）相容，可全部选中', () => {
    const { summary } = run(TOUCHING);
    expect(summary.resultValue).toBe(3);
    expect(summary.result).toBe('1-3, 3-5, 5-7');
  });

  it('默认输入与 meta.defaultInput 一致且能通过解析', () => {
    const parsed = parseIntervalList(activitySelectionMeta.defaultInput, activitySelectionMeta.inputSpec);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toEqual(DEFAULT);
    }
  });
});
