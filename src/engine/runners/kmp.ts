import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  ElementState,
  OpStats,
  OperationType,
  ParsedInput,
  PointerState,
  Primitive,
  RunnerResult,
  TableCell,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** KMP 字符串匹配逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const KMP_LINES = {
  func: 'func',
  init: 'init',
  buildLps: 'build-lps',
  compareLps: 'compare-lps',
  backtrackLps: 'backtrack-lps',
  match: 'match',
  compare: 'compare',
  found: 'found',
  fallback: 'fallback',
  end: 'end',
} as const;

export interface KmpInput {
  text: string;
  pattern: string;
}

type Phase = 'init' | 'lps' | 'match' | 'end';

/**
 * KMP 字符串匹配执行器：先构建前缀函数 lps（模式自匹配），
 * 再在文本上滑动模式指针完成匹配（失配时不回溯文本指针 i）。
 * 纯函数、确定性；每一步为完整状态快照（深拷贝）。
 *
 * containers：{ text: t:<i>, pattern: p:<i> } 两行并排；
 * structures：lps 前缀函数表（rows=1, cols=m，colHeaders=模式各字符，cells=lps[i]）。
 */
export const runKmp: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { text, pattern } = input.value as KmpInput;
  const n = text.length;
  const m = pattern.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：两行字符 + lps 表单元格
  const textBase: DisplayItem[] = Array.from(text, (ch, i) => item(`t:${i}`, ch, 'idle'));
  const patternBase: DisplayItem[] = Array.from(pattern, (ch, i) => item(`p:${i}`, ch, 'idle'));
  const lps: number[] = new Array<number>(m).fill(0);
  const lpsCells: TableCell[] = Array.from({ length: m }, (_, col) => ({
    id: `lps:${col}`,
    value: 0,
    state: 'idle' as ElementState,
    row: 0,
    col,
  }));

  let i = 0;
  let j = 0;
  let phase: Phase = 'init';
  const matches: number[] = [];
  let output: string[] = [];

  const resetContainers = (): void => {
    for (const el of textBase) el.state = 'idle';
    for (const el of patternBase) el.state = 'idle';
  };

  /** 依据阶段刷新 lps 表单元格状态（init 全灰；lps 已计算格为绿；match/end 全绿） */
  const refreshLps = (activeCol: number | null = null): void => {
    for (let c = 0; c < m; c += 1) {
      if (c === activeCol) lpsCells[c]!.state = 'active';
      else if (phase === 'lps' && c < i) lpsCells[c]!.state = 'done';
      else if (phase === 'match' || phase === 'end') lpsCells[c]!.state = 'done';
      else lpsCells[c]!.state = 'idle';
    }
  };

  const variables = (): Record<string, Primitive> => ({
    i,
    j,
    m,
    n,
    'lps[j-1]': j - 1 >= 0 ? (lps[j - 1] ?? null) : null,
  });

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    if (phase === 'lps') {
      if (i >= 0 && i < m) list.push({ id: 'p-i', name: 'i', target: `p:${i}` });
    } else if (phase === 'match') {
      if (i >= 0 && i < n) list.push({ id: 'p-i', name: 'i', target: `t:${i}` });
    }
    if ((phase === 'lps' || phase === 'match') && j >= 0 && j < m) {
      list.push({ id: 'p-j', name: 'j', target: `p:${j}` });
    }
    return list;
  };

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    nextOutput?: string[],
  ): void => {
    if (nextOutput) output = nextOutput;
    const step: AlgorithmStep = {
      stepId: steps.length,
      codeLineId,
      operation,
      containers: {
        text: textBase.map((b) => ({ ...b })),
        pattern: patternBase.map((b) => ({ ...b })),
      },
      structures: [
        {
          kind: 'table',
          id: 'lps',
          rows: 1,
          cols: m,
          colHeaders: Array.from(pattern),
          rowHeaders: ['lps'],
          cells: lpsCells.map((c) => ({ ...c })),
          sourceEdges: [],
        },
      ],
      variables: variables(),
      pointers: pointers(),
      callStack: [],
      output,
      explanation,
      stats: { ...stats },
    };
    steps.push(step);
  };

  // 非法输入（模式为空或长于文本）：诚实报错，不假装执行
  if (m === 0 || n === 0 || m > n) {
    for (const el of textBase) el.state = 'invalid';
    for (const el of patternBase) el.state = 'invalid';
    push(KMP_LINES.init, 'init', {
      zh: '输入不合法：模式不能为空，且长度不能超过文本。',
      en: 'Invalid input: the pattern must be non-empty and no longer than the text.',
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 阶段 1：init —— 两行字符展示 + KMP 思想
  refreshLps();
  push(KMP_LINES.init, 'init', {
    zh: `开始 KMP 字符串匹配：文本 "${text}"（n=${n}）、模式 "${pattern}"（m=${m}）。核心思想：失配时不回退文本指针 i，而是用已匹配前缀的信息（前缀函数 lps）只回退模式指针 j，避免暴力回溯的 O(n·m)。`,
    en: `Start KMP string matching: text "${text}" (n=${n}), pattern "${pattern}" (m=${m}). Core idea: on mismatch we never move text pointer i backward — instead the prefix function lps lets us backtrack only pattern pointer j, avoiding the O(n·m) of brute force.`,
  });

  // 阶段 2：构建前缀函数 lps（模式自匹配）
  phase = 'lps';
  i = 1;
  j = 0;
  lps[0] = 0;
  resetContainers();
  patternBase[0]!.state = 'active';
  refreshLps();
  push(KMP_LINES.buildLps, 'assign', {
    zh: `构建前缀函数 lps：lps[0] = 0（单个字符没有真前后缀）。设 i = 1（从模式第 1 个字符起与自身比较）、j = 0（当前最长相等前后缀长度）。`,
    en: `Build the prefix function lps: lps[0] = 0 (a single character has no proper prefix-suffix). Set i = 1 (compare the pattern against itself from index 1) and j = 0 (length of the longest equal prefix-suffix so far).`,
  });

  while (i < m) {
    resetContainers();
    patternBase[i]!.state = 'comparing';
    patternBase[j]!.state = 'comparing';
    stats.comparisons += 1;
    stats.accesses += 2;
    push(KMP_LINES.compareLps, 'compare', {
      zh: `比较 p[${i}]='${pattern[i]}' 与 p[${j}]='${pattern[j]}'：判断能否延长相等前后缀。`,
      en: `Compare p[${i}]='${pattern[i]}' with p[${j}]='${pattern[j]}' to decide whether the prefix-suffix can be extended.`,
    });

    if (pattern[i] === pattern[j]) {
      const wroteI = i;
      const matchedJ = j;
      j += 1;
      lps[wroteI] = j;
      lpsCells[wroteI]!.value = j;
      i += 1;
      resetContainers();
      patternBase[wroteI]!.state = 'done';
      patternBase[matchedJ]!.state = 'done';
      refreshLps(wroteI);
      push(KMP_LINES.compareLps, 'assign', {
        zh: `相等：p[${wroteI}] == p[${matchedJ}]，相等前后缀延长 1，写入 lps[${wroteI}] = ${j}（表中当前格高亮），i → ${i}、j → ${j}。`,
        en: `Equal: p[${wroteI}] == p[${matchedJ}], the prefix-suffix grows by 1; write lps[${wroteI}] = ${j} (highlighted cell), i → ${i}, j → ${j}.`,
      });
    } else if (j !== 0) {
      const prevJ = j;
      j = lps[j - 1] ?? 0;
      resetContainers();
      patternBase[i]!.state = 'invalid';
      patternBase[prevJ]!.state = 'invalid';
      patternBase[j]!.state = 'active';
      refreshLps();
      push(KMP_LINES.backtrackLps, 'backtrack', {
        zh: `不相等且 j = ${prevJ} > 0：回退 j = lps[${prevJ - 1}] = ${j}（跳到更短的候选前后缀），i 保持不变继续比较。`,
        en: `Mismatch and j = ${prevJ} > 0: backtrack j = lps[${prevJ - 1}] = ${j} (fall back to a shorter candidate prefix-suffix); i stays for another comparison.`,
      });
    } else {
      const wroteI = i;
      lps[wroteI] = 0;
      i += 1;
      resetContainers();
      patternBase[wroteI]!.state = 'done';
      refreshLps(wroteI);
      push(KMP_LINES.compareLps, 'assign', {
        zh: `不相等且 j = 0：没有更短前后缀可回退，lps[${wroteI}] = 0，i → ${i}。`,
        en: `Mismatch and j = 0: no shorter prefix-suffix to fall back to; lps[${wroteI}] = 0, i → ${i}.`,
      });
    }
  }

  // 阶段 3：匹配阶段
  phase = 'match';
  i = 0;
  j = 0;
  resetContainers();
  refreshLps();
  push(KMP_LINES.match, 'assign', {
    zh: `前缀函数构建完成：lps = [${lps.join(', ')}]。进入匹配阶段：i = 0 扫描文本、j = 0 扫描模式。`,
    en: `Prefix function built: lps = [${lps.join(', ')}]. Enter matching: i = 0 scans the text, j = 0 scans the pattern.`,
  });

  while (i < n) {
    resetContainers();
    textBase[i]!.state = 'comparing';
    patternBase[j]!.state = 'comparing';
    stats.comparisons += 1;
    stats.accesses += 2;
    push(KMP_LINES.compare, 'compare', {
      zh: `比较 t[${i}]='${text[i]}' 与 p[${j}]='${pattern[j]}'。`,
      en: `Compare t[${i}]='${text[i]}' with p[${j}]='${pattern[j]}'.`,
    });

    if (text[i] === pattern[j]) {
      resetContainers();
      textBase[i]!.state = 'done';
      patternBase[j]!.state = 'done';
      i += 1;
      j += 1;
      push(KMP_LINES.compare, 'assign', {
        zh: `相等：t[${i - 1}] == p[${j - 1}]，两字符匹配（绿色），i → ${i}、j → ${j}。`,
        en: `Equal: t[${i - 1}] == p[${j - 1}], both match (green), i → ${i}, j → ${j}.`,
      });

      if (j === m) {
        const start = i - j;
        matches.push(start);
        j = lps[j - 1] ?? 0;
        resetContainers();
        for (let k = start; k < start + m; k += 1) textBase[k]!.state = 'done';
        for (let k = 0; k < m; k += 1) patternBase[k]!.state = 'done';
        output = [...output, `match at index ${start}`];
        push(KMP_LINES.found, 'found', {
          zh: `j == m：在文本位置 ${start} 找到完整匹配 "${pattern}"！记录起始下标 ${start}（绿色子串），并按 lps 回退 j = ${j} 继续寻找后续（重叠）匹配。`,
          en: `j == m: full match "${pattern}" found at text index ${start}! Record it (green substring), then j = lps[m-1] = ${j} to keep searching for later (overlapping) matches.`,
        });
      }
    } else if (j !== 0) {
      const prevJ = j;
      j = lps[j - 1] ?? 0;
      resetContainers();
      textBase[i]!.state = 'invalid';
      patternBase[prevJ]!.state = 'invalid';
      patternBase[j]!.state = 'active';
      push(KMP_LINES.fallback, 'backtrack', {
        zh: `失配：t[${i}]='${text[i]}' != p[${prevJ}]='${pattern[prevJ]}' 且 j = ${prevJ} > 0。跳过已匹配前缀，回退 j = lps[${prevJ - 1}] = ${j}；i 不变（不回溯文本）。`,
        en: `Mismatch: t[${i}]='${text[i]}' != p[${prevJ}]='${pattern[prevJ]}' and j = ${prevJ} > 0. Skip the matched prefix: j = lps[${prevJ - 1}] = ${j}; i stays (the text is never backtracked).`,
      });
    } else {
      resetContainers();
      textBase[i]!.state = 'invalid';
      patternBase[0]!.state = 'invalid';
      i += 1;
      push(KMP_LINES.fallback, 'shift', {
        zh: `失配且 j = 0：模式首字符就不匹配，无法回退，直接移动文本指针 i → ${i}。`,
        en: `Mismatch and j = 0: the pattern's first character does not match, so we simply advance the text pointer i → ${i}.`,
      });
    }
  }

  // 阶段 4：end —— 汇总所有匹配位置
  phase = 'end';
  resetContainers();
  for (const start of matches) {
    for (let k = start; k < start + m; k += 1) textBase[k]!.state = 'done';
  }
  for (let k = 0; k < m; k += 1) patternBase[k]!.state = 'done';
  refreshLps();
  const endExplanation =
    matches.length > 0
      ? {
          zh: `匹配结束：在位置 [${matches.join(', ')}] 找到 "${pattern}"（绿色为所有匹配子串）。共比较 ${stats.comparisons} 次，时间复杂度 O(n+m)。`,
          en: `Matching complete: "${pattern}" found at [${matches.join(', ')}] (green marks all matches). ${stats.comparisons} comparisons in total; O(n+m) time.`,
        }
      : {
          zh: `匹配结束：文本中未找到 "${pattern}"。共比较 ${stats.comparisons} 次，时间复杂度 O(n+m)。`,
          en: `Matching complete: "${pattern}" was not found in the text. ${stats.comparisons} comparisons in total; O(n+m) time.`,
        };
  push(
    KMP_LINES.end,
    'finalize',
    endExplanation,
    matches.length > 0 ? [...output, `matches: [${matches.join(', ')}]`] : [...output, 'matches: none'],
  );

  return {
    steps,
    summary: {
      result: matches.length > 0 ? `[${matches.join(', ')}]` : 'not found',
      resultValue: matches.length > 0 ? matches.join(', ') : null,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
