import { memo } from 'react';
import type { AlgorithmStep, DisplayItem } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { PointerLabelGroup } from './PointerLabels';
import { useI18n } from '../hooks/useI18n';

/**
 * 数组柱状图渲染器（排序类）：
 * - 柱高 = 值，颜色 = 元素状态，柱顶值标签（柱内或柱上方自适应）
 * - 底部基线 + 索引刻度
 * - 指针以胶囊标签标注（i / j 等），分层错开
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
  const W = Math.max(340, n * 52 + 64);
  const H = 276;
  const padX = 30;
  const slot = (W - padX * 2) / n;
  const barW = Math.min(36, slot * 0.6);
  const topArea = 96; // 指针胶囊区
  const baselineY = H - 36;
  const barMaxH = baselineY - topArea - 10;

  const pointers = step?.pointers ?? [];
  const pointerFor = (index: number) => pointers.filter((p) => p.target === `a:${index}`);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={t.panels.containers}
    >
      {/* 基线 */}
      <line
        x1={padX - 12}
        y1={baselineY}
        x2={W - padX + 12}
        y2={baselineY}
        stroke="var(--cv-border-strong)"
        strokeWidth={1.5}
      />

      {items.map((el, i) => {
        const value = Number(el.value);
        const barH = Math.max(5, (value / maxValue) * barMaxH);
        const cx = padX + i * slot + slot / 2;
        const x = cx - barW / 2;
        const y = baselineY - barH;
        const fill = stateColorVar(el.state);
        const showInnerValue = barH >= 24;
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
              opacity={el.state === 'idle' ? 0.45 : 1}
              stroke={fill}
              strokeWidth={el.state === 'idle' ? 0 : 1}
            />
            {/* 值标签：柱内（白字）或柱上方（正文色） */}
            {showInnerValue ? (
              <text
                className="viz-transition"
                x={cx}
                y={y + 15}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill="#ffffff"
              >
                {value}
              </text>
            ) : (
              <text
                className="viz-transition"
                x={cx}
                y={y - 6}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight={600}
                fill="var(--cv-text)"
              >
                {value}
              </text>
            )}
            {/* 索引刻度 */}
            <text x={cx} y={baselineY + 18} textAnchor="middle" fontSize={11} fill="var(--cv-muted)">
              {i}
            </text>
            {/* 指针胶囊 */}
            <PointerLabelGroup pointers={pointerFor(i)} cx={cx} topY={y} />
          </g>
        );
      })}
    </svg>
  );
});
