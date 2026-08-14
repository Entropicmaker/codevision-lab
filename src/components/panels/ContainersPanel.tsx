import type { AlgorithmStep } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';
import { stateColorVar } from '../../renderers/stateColor';

/** 容器（数组等）文本状态：每个元素带状态色点 */
export function ContainersPanel({ current }: { current: AlgorithmStep | null }) {
  const { t } = useI18n();
  const containers = current ? Object.entries(current.containers) : [];
  if (containers.length === 0) {
    return <p className="text-xs text-muted">{t.panels.empty}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {containers.map(([name, items]) => (
        <div key={name}>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted">{name}</div>
          <div className="flex flex-wrap gap-1">
            {items.map((el) => (
              <span
                key={el.id}
                className="inline-flex items-center gap-1 rounded border border-border bg-surface2 px-1.5 py-0.5 font-mono text-[11px] text-text"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: stateColorVar(el.state) }}
                  aria-hidden
                />
                {String(el.value)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
