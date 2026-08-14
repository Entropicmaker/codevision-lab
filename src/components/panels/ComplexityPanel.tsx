import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { useI18n } from '../../hooks/useI18n';

/** 复杂度面板 */
export function ComplexityPanel({ meta }: { meta: AlgorithmMeta }) {
  const { t } = useI18n();
  const { time, space } = meta.complexity;
  const rows = [
    { label: t.complexity.best, value: time.best },
    { label: t.complexity.average, value: time.average },
    { label: t.complexity.worst, value: time.worst },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted">{t.complexity.time}</div>
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="text-muted">{row.label}</span>
            <span className="font-mono font-medium text-text">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 border-t border-border pt-1.5 text-[10px] uppercase tracking-wide text-muted">
        {t.complexity.space}
      </div>
      <div className="text-xs">
        <span className="font-mono font-medium text-text">{space}</span>
      </div>
    </div>
  );
}
