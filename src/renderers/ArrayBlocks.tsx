import { memo } from 'react';
import type { AlgorithmStep, DisplayItem } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 数组方块渲染器：等高方块 + 值 + 索引 + 指针（搜索 / 双指针 / 滑动窗口通用）。
 */
interface ArrayBlocksProps {
  step: AlgorithmStep | null;
  containerId?: string;
}

export const ArrayBlocks = memo(function ArrayBlocks({ step, containerId }: ArrayBlocksProps) {
  const { t } = useI18n();
  const items: DisplayItem[] = step
    ? (step.containers[containerId ?? Object.keys(step.containers)[0] ?? ''] ?? [])
    : [];

  if (items.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        {t.panels.empty}
      </div>
    );
  }

  const n = items.length;
  const W = Math.max(320, n * 56 + 56);
  const H = 220;
  const padX = 28;
  const slot = (W - padX * 2) / n;
  const cellW = Math.min(44, slot * 0.78);
  const cellH = 44;
  const topArea = 64; // 指针区（可容纳两层指针）
  const cellsY = topArea;
  const indexY = cellsY + cellH + 20;

  const pointers = step?.pointers ?? [];
  const pointerFor = (index: number) => pointers.filter((p) => p.target === `a:${index}`);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={t.panels.containers}
    >
      {items.map((el, i) => {
        const cx = padX + i * slot + slot / 2;
        const x = cx - cellW / 2;
        const fill = stateColorVar(el.state);
        const myPointers = pointerFor(i);
        return (
          <g key={el.id}>
            {/* 方块 */}
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
              strokeWidth={el.state === 'idle' ? 1 : 0}
              strokeDasharray={el.state === 'idle' ? '4 3' : undefined}
            />
            {/* 值 */}
            <text
              className="viz-transition"
              x={cx}
              y={cellsY + cellH / 2 + 4}
              textAnchor="middle"
              fontSize={14}
              fontWeight={600}
              fill={el.state === 'idle' ? 'var(--cv-muted)' : 'var(--cv-text)'}
            >
              {String(el.value)}
            </text>
            {/* 索引 */}
            <text x={cx} y={indexY} textAnchor="middle" fontSize={11} fill="var(--cv-muted)">
              {i}
            </text>
            {/* 指针箭头 */}
            {myPointers.map((p, pi) => {
              const arrowY = topArea - 8 - pi * 22;
              const lineY = topArea - pi * 22;
              return (
                <g key={p.id}>
                  <line
                    x1={cx}
                    y1={lineY}
                    x2={cx}
                    y2={cellsY - 2}
                    stroke="var(--cv-accent)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <path d={`M ${cx} ${arrowY} l -5 -9 h 10 Z`} fill="var(--cv-accent)" />
                  <text
                    x={cx + 9}
                    y={lineY - 2}
                    fontSize={12}
                    fontWeight={700}
                    fill="var(--cv-accent)"
                  >
                    {p.name}
                  </text>
                  {p.note && (
                    <text x={cx} y={lineY + 12} textAnchor="middle" fontSize={9} fill="var(--cv-muted)">
                      {p.note.zh}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
});
