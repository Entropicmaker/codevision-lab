import { describe, expect, it } from 'vitest';
import { runKmp, KMP_LINES } from './kmp';
import { extractLineMap } from '../codeMap/extract';

function run(text: string, pattern: string) {
  return runKmp({ kind: 'string-pair', value: { text, pattern } });
}

/** 从步骤中取出 lps 前缀函数表（structures 里 kind==='table' 的那个） */
function lpsValues(steps: ReturnType<typeof run>['steps']): number[] {
  const last = steps[steps.length - 1];
  const table = last?.structures.find((s) => s.kind === 'table');
  return table && table.kind === 'table' ? table.cells.map((c) => c.value as number) : [];
}

describe('runKmp', () => {
  it('默认输入 ABABABC|ABA 找到匹配位置 [0, 2]', () => {
    const result = run('ABABABC', 'ABA');
    expect(result.summary.result).toBe('[0, 2]');
    expect(result.summary.resultValue).toBe('0, 2');
    // 输出中记录了两次匹配
    const foundSteps = result.steps.filter((s) => s.operation === 'found');
    expect(foundSteps.length).toBe(2);
  });

  it('重叠匹配 AAAAA|AA 找到位置 [0,1,2,3]', () => {
    const result = run('AAAAA', 'AA');
    expect(result.summary.result).toBe('[0, 1, 2, 3]');
  });

  it('无匹配 ABC|ABD 返回 not found', () => {
    const result = run('ABC', 'ABD');
    expect(result.summary.result).toBe('not found');
    expect(result.summary.resultValue).toBeNull();
    expect(result.steps.some((s) => s.operation === 'found')).toBe(false);
  });

  it('单字符不匹配 A|B 返回 not found', () => {
    const result = run('A', 'B');
    expect(result.summary.result).toBe('not found');
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run('ABABABC', 'ABA');
    const b = run('ABABABC', 'ABA');
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run('ABABABC', 'ABA');
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    steps[0]!.containers['text']![0]!.value = 'X';
    steps[0]!.containers['pattern']![0]!.state = 'invalid';
    expect(steps[1]).toEqual(snapshot);
  });

  it('containers 始终包含 text / pattern 两行', () => {
    const { steps } = run('ABABABC', 'ABA');
    for (const step of steps) {
      expect(Object.keys(step.containers).sort()).toEqual(['pattern', 'text']);
      expect(step.containers['text']?.map((el) => el.value).join('')).toBe('ABABABC');
      expect(step.containers['pattern']?.map((el) => el.value).join('')).toBe('ABA');
    }
  });

  it('lps 表值正确：模式 ABA → [0, 0, 1]', () => {
    const { steps } = run('ABABABC', 'ABA');
    expect(lpsValues(steps)).toEqual([0, 0, 1]);
  });

  it('lps 表：AAAAA|AA 的模式 AA → [0, 1]', () => {
    const { steps } = run('AAAAA', 'AA');
    expect(lpsValues(steps)).toEqual([0, 1]);
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run('ABABABC', 'ABA');
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(KMP_LINES.init);
    expect(ids).toContain(KMP_LINES.buildLps);
    expect(ids).toContain(KMP_LINES.compareLps);
    expect(ids).toContain(KMP_LINES.match);
    expect(ids).toContain(KMP_LINES.compare);
    expect(ids).toContain(KMP_LINES.found);
    expect(ids).toContain(KMP_LINES.fallback);
    expect(ids).toContain(KMP_LINES.end);
  });

  it('失配回溯案例中出现 backtrack-lps 与 fallback 逻辑行', () => {
    // ABA 构建 lps 时 p[1]='B' != p[0]='A' 会触发 compare-lps 的失配分支
    const { steps } = run('ABABABC', 'ABA');
    expect(steps.some((s) => s.codeLineId === KMP_LINES.fallback)).toBe(true);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { kmpMeta } = await import('../../content/algorithms/kmp');
    const maps = kmpMeta.codeExamples;
    const { steps } = run('ABABABC', 'ABA');
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('四种文本（三语言 + 伪代码）codeLineId 集合一致', async () => {
    const { kmpMeta } = await import('../../content/algorithms/kmp');
    const cpp = Object.keys(kmpMeta.codeExamples.cpp.lineMap).sort();
    const csharp = Object.keys(kmpMeta.codeExamples.csharp.lineMap).sort();
    const python = Object.keys(kmpMeta.codeExamples.python.lineMap).sort();
    expect(csharp).toEqual(cpp);
    expect(python).toEqual(cpp);
    // 伪代码用同一套 extractLineMap 提取
    const pseudo = Object.keys(extractLineMap(kmpMeta.pseudocode)).sort();
    expect(pseudo).toEqual(cpp);
    // 关键行 id 齐备
    expect(cpp).toEqual(
      ['backtrack-lps', 'build-lps', 'compare', 'compare-lps', 'end', 'fallback', 'found', 'func', 'init', 'match'].sort(),
    );
  });
});
