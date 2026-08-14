import type { AlgorithmStep } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';
import { Badge } from '../ui/Badge';

const OPERATION_LABELS: Record<string, { zh: string; en: string }> = {
  init: { zh: '初始化', en: 'Init' },
  compare: { zh: '比较', en: 'Compare' },
  swap: { zh: '交换', en: 'Swap' },
  assign: { zh: '赋值', en: 'Assign' },
  push: { zh: '入栈', en: 'Push' },
  pop: { zh: '出栈', en: 'Pop' },
  enqueue: { zh: '入队', en: 'Enqueue' },
  dequeue: { zh: '出队', en: 'Dequeue' },
  visit: { zh: '访问', en: 'Visit' },
  backtrack: { zh: '回溯', en: 'Backtrack' },
  shift: { zh: '移位', en: 'Shift' },
  return: { zh: '返回', en: 'Return' },
  found: { zh: '找到', en: 'Found' },
  'not-found': { zh: '未找到', en: 'Not found' },
  finalize: { zh: '完成', en: 'Done' },
  'no-op': { zh: '推进', en: 'Advance' },
};

/** 当前步骤说明面板 */
export function ExplanationPanel({ current }: { current: AlgorithmStep | null }) {
  const { locale } = useI18n();
  if (!current) {
    return (
      <p className="text-sm text-muted">
        {locale === 'zh' ? '点击“播放”或“下一步”开始执行。' : 'Press Play or Next to start.'}
      </p>
    );
  }
  const op = OPERATION_LABELS[current.operation] ?? { zh: current.operation, en: current.operation };
  return (
    <div className="flex items-start gap-2.5">
      <Badge tone="accent" className="mt-0.5 shrink-0">
        {op[locale]}
      </Badge>
      <p className="text-sm leading-relaxed text-text">{current.explanation[locale]}</p>
    </div>
  );
}
