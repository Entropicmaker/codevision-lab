import { memo } from 'react';
import type { AlgorithmStep, DisplayItem } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 数组柱状图渲染器：柱高 = 值，颜色 = 元素状态，支持索引与指针标注。
 * 纯 SVG，几何属性通过 CSS 过渡动画（viz-transition）。
 */
interface ArrayBarsProps {
  step: AlgorithmStep | null;
  containerId?: string;
}

export const ArrayBars = memo(function ArrayBars({ step, containerId }: ArrayBarsProps) {
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
  const maxValue = Math.max(1, ...items.map((el) => Number(el.value)));
  const W = Math.max(320, n * 48 + 56);
  const H = 250;
  const padX = 28;
  const slot = (W - padX * 2) / n;
  const barW = Math.min(34, slot * 0.62);
  const topArea = 44; // 指针区
  const bottomArea = 26; // 索引区
  const barMaxH = H - topArea - bottomArea - 8;

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
        const value = Number(el.value);
        const barH = Math.max(4, (value / maxValue) * barMaxH);
        const cx = padX + i * slot + slot / 2;
        const x = cx - barW / 2;
        const y = H - bottomArea - barH;
        const fill = stateColorVar(el.state);
        const myPointers = pointerFor(i);
        return (
          <g key={el.id}>
            {/* 柱体 */}
            <rect
              className="viz-transition"
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={5}
              fill={fill}
              opacity={el.state === 'idle' ? 0.55 : 1}
            />
            {/* 柱顶值 */}
            <text
              className="viz-transition"
              x={cx}
              y={y - 6}
              textAnchor="middle"
              fontSize={11}
              fill="var(--cv-text)"
            >
              {value}
            </text>
            {/* 索引 */}
            <text
              x={cx}
              y={H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--cv-muted)"
            >
              {i}
            </text>
            {/* 指针箭头 */}
            {myPointers.map((p, pi) => {
              const arrowY = topArea - 6 - pi * 18;
              const lineY = topArea - pi * 18;
              return (
                <g key={p.id}>
                  <line
                    x1={cx}
                    y1={lineY}
                    x2={cx}
                    y2={y + 4}
                    stroke="var(--cv-accent)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <path
                    d={`M ${cx} ${arrowY} l -5 -9 h 10 Z`}
                    fill="var(--cv-accent)"
                  />
                  <text
                    x={cx + 9}
                    y={lineY - 2}
                    fontSize={12}
                    fontWeight={700}
                    fill="var(--cv-accent)"
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
});
