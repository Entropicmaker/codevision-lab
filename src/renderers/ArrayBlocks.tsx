import { memo } from 'react';
import type { AlgorithmStep, DisplayItem } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { PointerLabelGroup, RangeBracket } from './PointerLabels';
import { useI18n } from '../hooks/useI18n';

/**
 * 数组方块渲染器（搜索 / 双指针 / 滑动窗口 / 字符串匹配通用）：
 * - 支持多容器：每个容器渲染一行（行首标注容器名），如 KMP 的文本行 + 模式行
 * - 等高方块 + 值 + 索引
 * - 指针胶囊标签（target 格式 `<container>:<index>`，如 t:0、p:2）
 * - 第一行容器的成对区间指针自动绘制底部括号 + 区间底条
 */
interface ArrayBlocksProps {
  step: AlgorithmStep | null;
  containerId?: string;
}

const RANGE_PAIRS: Array<[string, string]> = [
  ['lo', 'hi'],
  ['left', 'right'],
];

const ROW_H = 104; // 每容器一行的高度（指针区 + 方块 + 索引 + 间距）

export const ArrayBlocks = memo(function ArrayBlocks({ step, containerId }: ArrayBlocksProps) {
  const { t, locale } = useI18n();
  const entries: Array<[string, DisplayItem[]]> = step
    ? Object.entries(step.containers).filter(
        ([name, items]) =>
          (!containerId || name === containerId) && items.length > 0,
      )
    : [];

  if (entries.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        {t.panels.empty}
      </div>
    );
  }

  const maxN = Math.max(...entries.map(([, items]) => items.length));
  const W = Math.max(340, maxN * 56 + 64);
  const H = entries.length * ROW_H + 30;
  const padX = 30;
  const slot = (W - padX * 2) / maxN;
  const cellW = Math.min(44, slot * 0.76);
  const cellH = 46;

  const pointers = step?.pointers ?? [];
  const pointerFor = (container: string, index: number) =>
    pointers.filter((p) => p.target === `${container}:${index}`);

  // 区间（仅第一行容器）
  const range = (() => {
    const first = entries[0]?.[0];
    for (const [a, b] of RANGE_PAIRS) {
      const pa = pointers.find((p) => p.name === a);
      const pb = pointers.find((p) => p.name === b);
      if (!pa || !pb) continue;
      const ma = pa.target.split(':');
      const mb = pb.target.split(':');
      if (ma[0] !== first || mb[0] !== first) continue;
      const ia = Number(ma[1]);
      const ib = Number(mb[1]);
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
      {entries.map(([name, items], row) => {
        const baseY = row * ROW_H;
        const labelY = baseY + 16;
        const topArea = baseY + 30;
        const cellsY = topArea + 56;
        const indexY = cellsY + cellH + 16;

        return (
          <g key={name}>
            {/* 容器名 */}
            <text x={padX} y={labelY} fontSize={11} fontWeight={600} fill="var(--cv-muted)">
              {name}
            </text>

            {/* 区间底条（仅第一行） */}
            {row === 0 && range && (
              <rect
                className="viz-transition"
                x={padX + range.from * slot + (slot - cellW) / 2 - 4}
                y={cellsY + cellH + 6}
                width={(range.to - range.from) * slot + cellW + 8}
                height={4}
                rx={2}
                fill="var(--cv-accent)"
                opacity={0.4}
              />
            )}

            {items.map((el, i) => {
              const cx = padX + i * slot + slot / 2;
              const x = cx - cellW / 2;
              const fill = stateColorVar(el.state);
              return (
                <g key={el.id}>
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
                  <text x={cx} y={indexY} textAnchor="middle" fontSize={11} fill="var(--cv-muted)">
                    {i}
                  </text>
                  <PointerLabelGroup
                    pointers={pointerFor(name, i)}
                    cx={cx}
                    topY={cellsY}
                  />
                </g>
              );
            })}

            {/* 区间括号（仅第一行） */}
            {row === 0 && range && (
              <RangeBracket
                fromX={padX + range.from * slot + (slot - cellW) / 2}
                toX={padX + range.to * slot + (slot + cellW) / 2}
                y={indexY + 10}
                label={range.label}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
});
