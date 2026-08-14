import type { AlgorithmStep } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';

const KEYS = ['comparisons', 'swaps', 'accesses', 'writes'] as const;

/** 操作统计面板：比较 / 交换 / 访问 / 写入次数 */
export function StatsPanel({ current }: { current: AlgorithmStep | null }) {
  const { t } = useI18n();
  const stats = current?.stats;
  return (
    <div className="grid grid-cols-2 gap-2">
      {KEYS.map((key) => (
        <div key={key} className="rounded-lg bg-surface2 px-2.5 py-2">
          <div className="text-[10px] text-muted">{t.stats[key]}</div>
          <div className="font-mono text-lg font-semibold tabular-nums text-text">
            {stats?.[key] ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}
