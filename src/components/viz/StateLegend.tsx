import { useI18n } from '../../hooks/useI18n';
import { STATE_LEGEND, STATE_LABELS, stateColorVar } from '../../renderers/stateColor';

/** 统一颜色语义图例 */
export function StateLegend() {
  const { locale } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
      {STATE_LEGEND.map(({ state, key }) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: stateColorVar(state) }}
            aria-hidden
          />
          {STATE_LABELS[state][locale]}
        </span>
      ))}
    </div>
  );
}
