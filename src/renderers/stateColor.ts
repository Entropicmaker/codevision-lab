import type { ElementState } from '../engine/types/step';

/**
 * 元素状态 → CSS 变量（颜色语义统一）：
 * idle 灰=未访问 · active 蓝=当前访问 · comparing 黄=正在比较
 * done 绿=已完成 · invalid 红=冲突/无效 · call 紫=函数调用/递归
 */
export function stateColorVar(state: ElementState): string {
  switch (state) {
    case 'active':
      return 'var(--cv-state-active)';
    case 'comparing':
      return 'var(--cv-state-comparing)';
    case 'done':
      return 'var(--cv-state-done)';
    case 'invalid':
      return 'var(--cv-state-invalid)';
    case 'call':
      return 'var(--cv-state-call)';
    case 'idle':
    default:
      return 'var(--cv-state-idle)';
  }
}

export const STATE_LEGEND: Array<{ state: ElementState; key: string }> = [
  { state: 'active', key: 'active' },
  { state: 'comparing', key: 'comparing' },
  { state: 'done', key: 'done' },
  { state: 'invalid', key: 'invalid' },
  { state: 'call', key: 'call' },
  { state: 'idle', key: 'idle' },
];

export const STATE_LABELS: Record<ElementState, { zh: string; en: string }> = {
  idle: { zh: '未访问 / 默认', en: 'Untouched' },
  active: { zh: '当前访问', en: 'Current' },
  comparing: { zh: '正在比较', en: 'Comparing' },
  done: { zh: '已完成 / 已访问', en: 'Done / visited' },
  invalid: { zh: '冲突 / 无效路径', en: 'Conflict / invalid' },
  call: { zh: '函数调用 / 递归', en: 'Call / recursion' },
};
