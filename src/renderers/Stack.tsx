import { memo } from 'react';
import type { AlgorithmStep, LinearStructureSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 栈渲染器：垂直容器，栈顶在上；入栈/出栈动画由快照过渡完成。
 * 结构快照 kind='stack'，items[0] 为栈底。
 */
export const StackRenderer = memo(function StackRenderer({ step }: { step: AlgorithmStep | null }) {
  const { t } = useI18n();
  const structure = step?.structures.find(
    (s): s is LinearStructureSnapshot => s.kind === 'stack',
  );

  const items = structure?.items ?? [];
  const W = 220;
  const cellH = 40;
  const gap = 6;
  const padTop = 56;
  const padBottom = 20;
  const H = Math.max(160, padTop + padBottom + items.length * (cellH + gap));

  return (
    <div className="flex justify-center py-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-60" role="img" aria-label="stack">
        {/* 容器 */}
        <path
          d={`M 45 ${padTop - 12} L 45 ${H - padBottom + 8} L 175 ${H - padBottom + 8} L 175 ${padTop - 12}`}
          fill="none"
          stroke="var(--cv-border-strong)"
          strokeWidth={2}
          opacity={0.9}
        />
        <text x={110} y={padTop - 22} textAnchor="middle" fontSize={11} fill="var(--cv-muted)">
          {t.panels.empty && items.length === 0 ? t.panels.empty : 'top ↑'}
        </text>
        {items.length === 0 && (
          <text x={110} y={(padTop + H - padBottom) / 2} textAnchor="middle" fontSize={12} fill="var(--cv-muted)">
            {t.panels.empty}
          </text>
        )}
        {/* 栈顶在上：items 逆序渲染 */}
        {items.map((el, i) => {
          const fromTop = i; // 0 = 栈顶
          const y = padTop + fromTop * (cellH + gap);
          const fill = stateColorVar(el.state);
          const isTop = fromTop === 0;
          return (
            <g key={el.id}>
              <rect
                className="viz-transition"
                x={55}
                y={y}
                width={100}
                height={cellH}
                rx={6}
                fill={fill}
                fillOpacity={el.state === 'idle' ? 0.28 : 1}
                stroke={fill}
                strokeWidth={isTop ? 2 : 1}
              />
              <text
                className="viz-transition"
                x={105}
                y={y + cellH / 2 + 4}
                textAnchor="middle"
                fontSize={14}
                fontWeight={600}
                fill="var(--cv-text)"
              >
                {String(el.value)}
              </text>
              {isTop && (
                <text x={163} y={y + cellH / 2 + 4} fontSize={10} fill="var(--cv-muted)">
                  top
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
});
