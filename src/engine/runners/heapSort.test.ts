import { describe, expect, it } from 'vitest';
import { runHeapSort, HEAP_SORT_LINES } from './heapSort';
import type { AlgorithmStep, TreeSnapshot } from '../types/step';

function run(values: number[]) {
  return runHeapSort({ kind: 'int-array', value: values });
}

function tree(step: AlgorithmStep): TreeSnapshot | undefined {
  return step.structures.find((s): s is TreeSnapshot => s.kind === 'tree');
}

describe('runHeapSort', () => {
  it('对乱序数组产生正确排序结果', () => {
    const result = run([4, 10, 3, 5, 1, 8, 2]);
    expect(result.summary.result).toBe('1, 2, 3, 4, 5, 8, 10');
    const last = result.steps[result.steps.length - 1];
    expect(last?.containers.a?.map((el) => el.value)).toEqual([1, 2, 3, 4, 5, 8, 10]);
  });

  it('边界情况排序结果正确', () => {
    expect(run([]).summary.result).toBe('');
    expect(run([7]).summary.result).toBe('7');
    expect(run([1, 2, 3, 4, 5]).summary.result).toBe('1, 2, 3, 4, 5');
    expect(run([5, 4, 3, 2, 1]).summary.result).toBe('1, 2, 3, 4, 5');
    expect(run([4, 4, 4, 4, 4]).summary.result).toBe('4, 4, 4, 4, 4');
  });

  it('空数组与单元素数组直接完成', () => {
    const empty = run([]);
    expect(empty.steps.length).toBe(2);
    expect(empty.summary.stats.comparisons).toBe(0);

    const single = run([7]);
    expect(single.steps.length).toBe(2);
    expect(single.summary.stats.comparisons).toBe(0);
    expect(single.summary.stats.swaps).toBe(0);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([4, 10, 3, 5, 1, 8, 2]);
    const b = run([4, 10, 3, 5, 1, 8, 2]);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步的容器与树结构不影响其他步骤', () => {
    const { steps } = run([4, 10, 3, 5, 1, 8, 2]);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));

    // 修改第一步的数组容器
    steps[0]!.containers['a']![0]!.value = 999;
    steps[0]!.containers['a']![1]!.state = 'done';
    // 修改第一步的树结构节点与边
    const t0 = tree(steps[0]!);
    t0!.nodes[0]!.value = 888;
    t0!.nodes[0]!.state = 'comparing';
    t0!.edges[0]!.state = 'active';

    expect(steps[1]).toEqual(snapshot);
  });

  it('每步树节点数等于数组长度、边数等于 n-1，且父子关系正确', () => {
    const { steps } = run([4, 10, 3, 5, 1, 8, 2]);
    const n = 7;
    for (const step of steps) {
      const t = tree(step);
      expect(t).toBeDefined();
      expect(t!.kind).toBe('tree');
      expect(t!.rootId).toBe('n:0');
      expect(t!.nodes.length).toBe(n);
      // 完全二叉树 n 个节点恰好 n-1 条边
      expect(t!.edges.length).toBe(n - 1);

      // 节点 id 为 n:<下标>，值与数组视图一致
      const arr = step.containers['a']!;
      for (let i = 0; i < n; i += 1) {
        expect(t!.nodes[i]!.id).toBe(`n:${i}`);
        expect(t!.nodes[i]!.value).toBe(arr[i]!.value);
        // 树节点与数组元素状态同步
        expect(t!.nodes[i]!.state).toBe(arr[i]!.state);
      }

      // 每条边都是父 → 子（2i+1 / 2i+2）
      for (const edge of t!.edges) {
        const from = Number(edge.from.slice(2));
        const to = Number(edge.to.slice(2));
        expect(to === 2 * from + 1 || to === 2 * from + 2).toBe(true);
      }
    }
  });

  it('提取阶段：done 元素位于数组末尾后缀且与就位最大值对应', () => {
    const { steps } = run([4, 10, 3, 5, 1, 8, 2]);
    const n = 7;

    // 找一个 place 步骤，验证交换后堆尾被标 done
    const placeStep = steps.find((s) => s.operation === 'swap' && s.codeLineId === HEAP_SORT_LINES.place);
    expect(placeStep).toBeDefined();

    // 最终步骤：全部 done 且数组升序
    const last = steps[steps.length - 1]!;
    expect(last.containers['a']!.every((el) => el.state === 'done')).toBe(true);
    expect(last.containers['a']!.map((el) => el.value)).toEqual([1, 2, 3, 4, 5, 8, 10]);

    // 任意中间步骤：done 元素必然构成数组末尾的一段后缀
    for (const step of steps) {
      const arr = step.containers['a']!;
      let seenDone = false;
      for (let i = 0; i < n; i += 1) {
        if (arr[i]!.state === 'done') {
          seenDone = true;
        } else {
          // done 之后不能再出现非 done（即 done 是后缀）
          expect(seenDone).toBe(false);
        }
      }
    }
  });

  it('关键逻辑行都出现过', () => {
    const { steps } = run([4, 10, 3, 5, 1, 8, 2]);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(HEAP_SORT_LINES.init);
    expect(ids).toContain(HEAP_SORT_LINES.buildHeap);
    expect(ids).toContain(HEAP_SORT_LINES.siftDown);
    expect(ids).toContain(HEAP_SORT_LINES.compare);
    expect(ids).toContain(HEAP_SORT_LINES.swap);
    expect(ids).toContain(HEAP_SORT_LINES.extract);
    expect(ids).toContain(HEAP_SORT_LINES.place);
    expect(ids[ids.length - 1]).toBe(HEAP_SORT_LINES.end);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { heapSortMeta } = await import('../../content/algorithms/heap-sort');
    const maps = heapSortMeta.codeExamples;
    const { steps } = run([4, 10, 3, 5, 1, 8, 2]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('建堆后根节点是全局最大值（大顶堆性质）', () => {
    const { steps } = run([4, 10, 3, 5, 1, 8, 2]);
    // 找到「大顶堆构建完成」步骤：提取阶段之前的最后一步
    const extractIdx = steps.findIndex((s) => s.codeLineId === HEAP_SORT_LINES.extract);
    expect(extractIdx).toBeGreaterThan(0);
    const afterBuild = steps[extractIdx - 1]!;
    // 建堆完成后，堆顶 a[0] 应为全局最大值 10
    expect(afterBuild.containers['a']![0]!.value).toBe(10);
  });
});
