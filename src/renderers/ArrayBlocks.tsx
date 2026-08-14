import { memo } from 'react';
import type { AlgorithmStep, DisplayItem } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { PointerLabelGroup, RangeBracket } from './PointerLabels';
import { useI18n } from '../hooks/useI18n';

/**
 * 数组方块渲染器（搜索 / 双指针 / 滑动窗口通用）：
 * - 等高方块 + 值 + 索引
 * - 指针胶囊标签（lo / mid / hi / left / right）
 * - 成对区间指针自动绘制底部括号（搜索区间 / 窗口范围）+ 半透明区间底条
 */
interface ArrayBlocksProps {
  step: AlgorithmStep | null;
  containerId?: string;
}

const RANGE_PAIRS: Array<[string, string]> = [
  ['lo', 'hi'],
  ['left', 'right'],
];

export const ArrayBlocks = memo(function ArrayBlocks({ step, containerId }: ArrayBlocksProps) {
  const { t, locale } = useI18n();
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
  const W = Math.max(340, n * 56 + 64);
  const H = 250;
  const padX = 30;
  const slot = (W - padX * 2) / n;
  const cellW = Math.min(44, slot * 0.76);
  const cellH = 46;
  const topArea = 92; // 指针胶囊区
  const cellsY = topArea;
  const indexY = cellsY + cellH + 16;
  const bracketY = indexY + 14;

  const cxOf = (i: number): number => padX + i * slot + slot / 2;

  const pointers = step?.pointers ?? [];
  const pointerFor = (index: number) => pointers.filter((p) => p.target === `a:${index}`);

  // 成对区间指针 → 底部括号
  const range = (() => {
    for (const [a, b] of RANGE_PAIRS) {
      const pa = pointers.find((p) => p.name === a);
      const pb = pointers.find((p) => p.name === b);
      if (!pa || !pb) continue;
      const ia = Number(pa.target.split(':')[1]);
      const ib = Number(pb.target.split(':')[1]);
      if (!Number.isNaN(ia) && !Number.isNaN(ib)) {
        const label =
          a === 'left'
            ? locale === 'zh'
              ? '窗口'
              : 'window'
            : locale === 'zh'
              ? '搜索区间'
              : 'search range';
        return { from: Math.min(ia, ib), to: Math.max(ia, ib), label };
      }
    }
    return null;
  })();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={t.panels.containers}
    >
      {/* 区间底条（滑动窗口 / 搜索范围高亮） */}
      {range && (
        <rect
          className="viz-transition"
          x={cxOf(range.from) - cellW / 2 - 4}
          y={cellsY + cellH + 6}
          width={(range.to - range.from) * slot + cellW + 8}
          height={4}
          rx={2}
          fill="var(--cv-accent)"
          opacity={0.4}
        />
      )}

      {items.map((el, i) => {
        const cx = cxOf(i);
        const x = cx - cellW / 2;
        const fill = stateColorVar(el.state);
        return (
          <g key={el.id}>
            {/* 方块 */}
            <rect
              className="viz-transition"
              x={x}
              y={cellsY}
              width={cellW}
              height={cellH}
              rx={9}
              fill={fill}
              fillOpacity={el.state === 'idle' ? 0.24 : 1}
              stroke={fill}
              strokeWidth={el.state === 'idle' ? 1 : 1.5}
              strokeDasharray={el.state === 'idle' ? '4 3' : undefined}
            />
            {/* 值 */}
            <text
              className="viz-transition"
              x={cx}
              y={cellsY + cellH / 2 + 5}
              textAnchor="middle"
              fontSize={14.5}
              fontWeight={600}
              fill={el.state === 'idle' ? 'var(--cv-muted)' : 'var(--cv-text)'}
            >
              {String(el.value)}
            </text>
            {/* 索引 */}
            <text x={cx} y={indexY} textAnchor="middle" fontSize={11} fill="var(--cv-muted)">
              {i}
            </text>
            {/* 指针胶囊 */}
            <PointerLabelGroup pointers={pointerFor(i)} cx={cx} topY={cellsY} />
          </g>
        );
      })}

      {/* 区间括号 */}
      {range && (
        <RangeBracket
          fromX={cxOf(range.from) - cellW / 2}
          toX={cxOf(range.to) + cellW / 2}
          y={bracketY}
          label={range.label}
        />
      )}
    </svg>
  );
});
