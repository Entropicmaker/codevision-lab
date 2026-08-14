import { memo } from 'react';
import type { AlgorithmStep, HashTableSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 哈希表渲染器：桶列 + 冲突链 + 哈希计算式标注。
 * - 每桶一个垂直槽，冲突元素纵向排列（拉链法）
 * - 顶部显示桶下标与哈希计算式（如 "23 % 7 = 2"）
 * - 最近操作的桶高亮
 */
export const HashTableRenderer = memo(function HashTableRenderer({
  step,
}: {
  step: AlgorithmStep | null;
}) {
  const { t } = useI18n();
  const structure = step?.structures.find((s): s is HashTableSnapshot => s.kind === 'hash-table');

  if (!structure) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        {t.panels.empty}
      </div>
    );
  }

  const size = structure.size;
  const W = Math.max(340, size * 74 + 90);
  const slotW = 64;
  const cellH = 34;
  const headerH = 58;
  const H = Math.max(
    190,
    headerH + Math.max(1, ...structure.buckets.map((b) => b.items.length)) * (cellH + 8) + 40,
  );
  const startX = 40;

  return (
    <div className="overflow-x-auto py-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto" style={{ minWidth: 320 }} role="img" aria-label="hash table">
        {structure.buckets.map((bucket) => {
          const x = startX + bucket.index * slotW;
          const isActive = structure.activeBucket === bucket.index;
          return (
            <g key={bucket.index}>
              {/* 桶槽背景 */}
              <rect
                x={x - 4}
                y={headerH - 14}
                width={slotW + 2}
                height={H - headerH}
                rx={8}
                fill="var(--cv-surface-2)"
                stroke={isActive ? 'var(--cv-accent)' : 'var(--cv-border)'}
                strokeWidth={isActive ? 2 : 1}
              />
              {/* 桶下标 */}
              <text x={x + slotW / 2} y={headerH - 22} textAnchor="middle" fontSize={11} fill="var(--cv-muted)">
                [{bucket.index}]
              </text>
              {/* 冲突链元素 */}
              {bucket.items.map((el, li) => {
                const fill = stateColorVar(el.state);
                const y = headerH + li * (cellH + 8);
                return (
                  <g key={el.id} className="viz-transition">
                    <rect
                      x={x + 2}
                      y={y}
                      width={slotW - 4}
                      height={cellH}
                      rx={6}
                      fill={fill}
                      fillOpacity={el.state === 'idle' ? 0.22 : 1}
                      stroke={fill}
                      strokeWidth={1.2}
                    />
                    <text
                      x={x + slotW / 2}
                      y={y + cellH / 2 + 4}
                      textAnchor="middle"
                      fontSize={12.5}
                      fontWeight={600}
                      fill="var(--cv-text)"
                    >
                      {String(el.value)}
                    </text>
                    {/* 哈希计算式标注 */}
                    {structure.hashNotes?.[el.id] && (
                      <text
                        x={x + slotW / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize={9.5}
                        fill="var(--cv-accent)"
                        fontFamily="ui-monospace, Menlo, monospace"
                      >
                        {structure.hashNotes[el.id]}
                      </text>
                    )}
                    {li > 0 && (
                      <path
                        d={`M ${x + slotW / 2} ${y - 8} L ${x + slotW / 2 - 4} ${y - 2} M ${x + slotW / 2} ${y - 8} L ${x + slotW / 2 + 4} ${y - 2}`}
                        stroke="var(--cv-muted)"
                        strokeWidth={1.2}
                        fill="none"
                      />
                    )}
                  </g>
                );
              })}
              {bucket.items.length === 0 && (
                <text x={x + slotW / 2} y={headerH + 22} textAnchor="middle" fontSize={11} fill="var(--cv-muted)" opacity={0.5}>
                  ∅
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
});
