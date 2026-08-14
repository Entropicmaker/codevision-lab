import { memo } from 'react';
import type { AlgorithmStep, LinearStructureSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 队列渲染器：水平容器，队首在左、队尾在右；
 * front / rear 由步骤 pointers 提供（target 指向元素 id）。
 */
export const QueueRenderer = memo(function QueueRenderer({ step }: { step: AlgorithmStep | null }) {
  const { t } = useI18n();
  const structure = step?.structures.find(
    (s): s is LinearStructureSnapshot => s.kind === 'queue',
  );

  const items = structure?.items ?? [];
  const capacity = structure?.capacity ?? items.length;
  const slots = Math.max(capacity, items.length);
  const W = Math.max(300, slots * 64 + 80);
  const H = 170;
  const cellW = 52;
  const cellH = 46;
  const startX = 40;
  const cellsY = 62;

  const pointers = step?.pointers ?? [];

  return (
    <div className="flex justify-center py-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="queue">
        {/* 容器（虚线槽位） */}
        {Array.from({ length: slots }, (_, i) => (
          <rect
            key={`slot-${i}`}
            x={startX + i * (cellW + 10)}
            y={cellsY}
            width={cellW}
            height={cellH}
            rx={8}
            fill="var(--cv-surface-2)"
            stroke="var(--cv-border)"
            strokeDasharray="4 3"
            opacity={i < items.length ? 0 : 0.7}
          />
        ))}
        <text x={startX} y={cellsY - 34} fontSize={11} fill="var(--cv-muted)">
          front →
        </text>
        <text x={startX + (slots - 1) * (cellW + 10)} y={cellsY - 34} fontSize={11} fill="var(--cv-muted)" textAnchor="end">
          ← rear
        </text>

        {items.length === 0 && (
          <text x={W / 2} y={cellsY + cellH / 2 + 4} textAnchor="middle" fontSize={12} fill="var(--cv-muted)">
            {t.panels.empty}
          </text>
        )}

        {/* 队内元素 */}
        {items.map((el, i) => {
          const x = startX + i * (cellW + 10);
          const fill = stateColorVar(el.state);
          const isFront = i === 0;
          const isRear = i === items.length - 1;
          return (
            <g key={el.id}>
              <rect
                className="viz-transition"
                x={x}
                y={cellsY}
                width={cellW}
                height={cellH}
                rx={8}
                fill={fill}
                fillOpacity={el.state === 'idle' ? 0.28 : 1}
                stroke={fill}
                strokeWidth={(isFront || isRear) && el.state !== 'idle' ? 2 : 1}
              />
              <text
                className="viz-transition"
                x={x + cellW / 2}
                y={cellsY + cellH / 2 + 4}
                textAnchor="middle"
                fontSize={14}
                fontWeight={600}
                fill="var(--cv-text)"
              >
                {String(el.value)}
              </text>
              {isFront && (
                <text x={x + cellW / 2} y={cellsY + cellH + 16} textAnchor="middle" fontSize={10} fill="var(--cv-accent)">
                  front
                </text>
              )}
              {isRear && items.length > 1 && (
                <text x={x + cellW / 2} y={cellsY + cellH + 16} textAnchor="middle" fontSize={10} fill="var(--cv-accent)">
                  rear
                </text>
              )}
            </g>
          );
        })}

        {/* 入队/出队的指针标注（如 peek） */}
        {pointers.map((p, pi) => {
          const idx = Number(p.target.split(':')[1]);
          if (Number.isNaN(idx)) return null;
          const x = startX + idx * (cellW + 10) + cellW / 2;
          return (
            <g key={p.id}>
              <path d={`M ${x} ${cellsY - 8 - pi * 20} l -5 -9 h 10 Z`} fill="var(--cv-accent)" />
              <text x={x + 9} y={cellsY - 14 - pi * 20} fontSize={12} fontWeight={700} fill="var(--cv-accent)">
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
