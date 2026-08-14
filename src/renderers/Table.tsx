import { memo } from 'react';
import type { AlgorithmStep, TableSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 动态规划状态表渲染器：网格单元 + 表头 + 转移来源箭头 + 计算顺序高亮。
 */
export const TableRenderer = memo(function TableRenderer({ step }: { step: AlgorithmStep | null }) {
  const { t } = useI18n();
  const structure = step?.structures.find((s): s is TableSnapshot => s.kind === 'table');

  const cells = structure?.cells ?? [];
  if (!structure || cells.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        {t.panels.empty}
      </div>
    );
  }

  const cellW = 62;
  const cellH = 44;
  const headerH = 34;
  const headerW = 64;
  const rows = structure.rows;
  const cols = structure.cols;
  const W = headerW + cols * cellW + 16;
  const H = headerH + rows * cellH + 16;

  const cellAt = (row: number, col: number) =>
    cells.find((c) => c.row === row && c.col === col);

  const cellCenter = (row: number, col: number) => ({
    x: headerW + col * cellW + cellW / 2,
    y: headerH + row * cellH + cellH / 2,
  });

  return (
    <div className="overflow-x-auto py-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto"
        style={{ minWidth: 320 }}
        role="img"
        aria-label="dp table"
      >
        {/* 转移来源箭头（画在网格下层） */}
        {structure.sourceEdges.map((edge, i) => {
          const from = cellCenter(edge.from.row, edge.from.col);
          const to = cellCenter(edge.to.row, edge.to.col);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          const ux = dx / len;
          const uy = dy / len;
          return (
            <g key={`edge-${i}`}>
              <line
                x1={from.x + ux * 20}
                y1={from.y + uy * 16}
                x2={to.x - ux * 20}
                y2={to.y - uy * 16}
                stroke="var(--cv-accent)"
                strokeWidth={2}
                strokeDasharray="5 4"
                opacity={0.8}
              />
              <path
                d={`M ${to.x - ux * 22} ${to.y - uy * 18} l ${-uy * 4 - ux * 8} ${ux * 4 - uy * 8} l ${uy * 4 - ux * 8} ${-ux * 4 - uy * 8} Z`}
                fill="var(--cv-accent)"
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* 网格 */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const cell = cellAt(r, c);
            if (!cell) return null;
            const fill = stateColorVar(cell.state);
            return (
              <g key={cell.id}>
                <rect
                  className="viz-transition"
                  x={headerW + c * cellW + 2}
                  y={headerH + r * cellH + 2}
                  width={cellW - 4}
                  height={cellH - 4}
                  rx={6}
                  fill={fill}
                  fillOpacity={cell.state === 'idle' ? 0.22 : 1}
                  stroke={fill}
                  strokeWidth={cell.state === 'active' ? 2.5 : 1}
                />
                <text
                  className="viz-transition"
                  x={headerW + c * cellW + cellW / 2}
                  y={headerH + r * cellH + cellH / 2 + 5}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={cell.state === 'active' ? 700 : 500}
                  fill="var(--cv-text)"
                >
                  {String(cell.value)}
                </text>
              </g>
            );
          }),
        )}

        {/* 表头 */}
        {structure.colHeaders.map((header, c) => (
          <text
            key={`col-${c}`}
            x={headerW + c * cellW + cellW / 2}
            y={headerH - 10}
            textAnchor="middle"
            fontSize={11}
            fill="var(--cv-muted)"
          >
            {header}
          </text>
        ))}
        {structure.rowHeaders.map((header, r) => (
          <text
            key={`row-${r}`}
            x={headerW - 8}
            y={headerH + r * cellH + cellH / 2 + 4}
            textAnchor="end"
            fontSize={11}
            fill="var(--cv-muted)"
          >
            {header}
          </text>
        ))}
      </svg>
    </div>
  );
});
