import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaybackController } from './PlaybackController';
import type { AlgorithmStep } from '../types/step';

function makeSteps(n: number): AlgorithmStep[] {
  return Array.from({ length: n }, (_, i) => ({
    stepId: i,
    codeLineId: `line-${i}`,
    operation: 'no-op',
    containers: { a: [{ id: `a:0`, value: i, state: 'idle' as const }] },
    structures: [],
    variables: { i },
    pointers: [],
    callStack: [],
    output: [],
    explanation: { zh: `步骤 ${i}`, en: `step ${i}` },
    stats: { comparisons: 0, swaps: 0, accesses: 0, writes: 0 },
  }));
}

describe('PlaybackController', () => {
  let rafCallback: ((t: number) => void) | null = null;

  beforeEach(() => {
    rafCallback = null;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb as (t: number) => void;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('load 后处于 paused，index=0', () => {
    const c = new PlaybackController();
    c.load(makeSteps(3));
    const s = c.getSnapshot();
    expect(s.status).toBe('paused');
    expect(s.index).toBe(0);
    expect(s.total).toBe(3);
    expect(s.currentStep?.stepId).toBe(0);
  });

  it('next 前进、prev 恢复上一快照（快照恢复而非反向执行）', () => {
    const c = new PlaybackController();
    c.load(makeSteps(3));
    c.next();
    expect(c.getSnapshot().index).toBe(1);
    expect(c.getSnapshot().currentStep?.stepId).toBe(1);
    c.prev();
    expect(c.getSnapshot().index).toBe(0);
    expect(c.getSnapshot().currentStep?.stepId).toBe(0);
    // 开头再 prev 无效
    c.prev();
    expect(c.getSnapshot().index).toBe(0);
  });

  it('到达末尾进入 finished；末尾 next 不再前进', () => {
    const c = new PlaybackController();
    c.load(makeSteps(2));
    c.next();
    expect(c.getSnapshot().status).toBe('finished');
    expect(c.getSnapshot().index).toBe(1);
    c.next();
    expect(c.getSnapshot().index).toBe(1);
  });

  it('jumpTo 与 reset 行为正确', () => {
    const c = new PlaybackController();
    c.load(makeSteps(5));
    c.jumpTo(3);
    expect(c.getSnapshot().index).toBe(3);
    c.reset();
    expect(c.getSnapshot().index).toBe(0);
    expect(c.getSnapshot().status).toBe('paused');
    c.jumpTo(4);
    expect(c.getSnapshot().status).toBe('finished');
  });

  it('play 启动 rAF 节拍器，按速度推进', () => {
    const c = new PlaybackController();
    c.load(makeSteps(3));
    c.setSpeed(2); // 每 500ms 一步
    c.play();
    expect(c.getSnapshot().status).toBe('playing');
    // 模拟一帧：时间推进 500ms → 前进一步
    rafCallback?.(performance.now() + 500);
    expect(c.getSnapshot().index).toBe(1);
    rafCallback?.(performance.now() + 1000);
    expect(c.getSnapshot().index).toBe(2);
    expect(c.getSnapshot().status).toBe('finished');
  });

  it('pause 停止节拍器', () => {
    const c = new PlaybackController();
    c.load(makeSteps(4));
    c.play();
    c.pause();
    expect(c.getSnapshot().status).toBe('paused');
  });

  it('loop 模式：末尾自动回到开头继续播放', () => {
    const c = new PlaybackController();
    c.load(makeSteps(3));
    c.setLoop(true);
    c.setSpeed(1);
    c.play();
    rafCallback?.(performance.now() + 1000); // step 1
    rafCallback?.(performance.now() + 2000); // step 2（末尾，loop → 回 0）
    const s = c.getSnapshot();
    expect(s.index).toBe(0);
    expect(s.status).toBe('playing');
  });

  it('setSpeed 钳制到 0.25–4 范围', () => {
    const c = new PlaybackController();
    c.setSpeed(100);
    expect(c.getSnapshot().speed).toBe(4);
    c.setSpeed(0.01);
    expect(c.getSnapshot().speed).toBe(0.25);
  });

  it('加载新步骤序列会重置播放状态', () => {
    const c = new PlaybackController();
    c.load(makeSteps(3));
    c.next();
    c.next();
    c.load(makeSteps(2));
    const s = c.getSnapshot();
    expect(s.index).toBe(0);
    expect(s.total).toBe(2);
    expect(s.status).toBe('paused');
  });

  it('空步骤序列：所有操作安全无副作用', () => {
    const c = new PlaybackController();
    c.load([]);
    expect(c.getSnapshot().status).toBe('idle');
    c.play();
    c.next();
    c.prev();
    c.jumpTo(5);
    expect(c.getSnapshot().index).toBe(0);
    expect(c.getSnapshot().total).toBe(0);
  });
});
