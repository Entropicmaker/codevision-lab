import { memo } from 'react';
import type { AlgorithmStep, GraphSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 图渲染器：节点（可带显式坐标，缺省时圆形布局）+ 边（权重标注、方向、状态）。
 */
export const GraphRenderer = memo(function GraphRenderer({ step }: { step: AlgorithmStep | null }) {
  const { t } = useI18n();
  const structure = step?.structures.find((s): s is GraphSnapshot => s.kind === 'graph');

  const nodes = structure?.nodes ?? [];
  const edges = structure?.edges ?? [];

  if (nodes.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        {t.panels.empty}
      </div>
    );
  }

  const R = 24;
  const W = 460;
  const H = 320;
  const cx0 = W / 2;
  const cy0 = H / 2;

  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    if (node.x !== undefined && node.y !== undefined) {
      positions.set(node.id, { x: node.x, y: node.y });
    } else {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      positions.set(node.id, {
        x: cx0 + Math.cos(angle) * Math.min(W, H) * 0.36,
        y: cy0 + Math.sin(angle) * Math.min(W, H) * 0.36,
      });
    }
  });

  const edgeColor = (state?: string): string =>
    state ? stateColorVar(state as never) : 'var(--cv-muted)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="graph">
      <defs>
        <marker
          id="graph-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cv-muted)" />
        </marker>
      </defs>

      {/* 边 */}
      {edges.map((edge) => {
        const from = positions.get(edge.from);
        const to = positions.get(edge.to);
        if (!from || !to) return null;
        const color = edgeColor(edge.state);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len;
        const uy = dy / len;
        const sx = from.x + ux * (R + 2);
        const sy = from.y + uy * (R + 2);
        const tx = to.x - ux * (R + 2);
        const ty = to.y - uy * (R + 2);
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const highlight =
          edge.state === 'active' || edge.state === 'comparing' || edge.state === 'done';
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line
              className="viz-transition"
              x1={sx}
              y1={sy}
              x2={tx}
              y2={ty}
              stroke={color}
              strokeWidth={highlight ? 3 : 1.6}
              markerEnd={edge.directed ? 'url(#graph-arrow)' : undefined}
            />
            {edge.label && (
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fill={highlight ? 'var(--cv-text)' : 'var(--cv-muted)'}
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* 节点 */}
      {nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const fill = stateColorVar(node.state);
        return (
          <g key={node.id}>
            <circle
              className="viz-transition"
              cx={pos.x}
              cy={pos.y}
              r={R}
              fill={fill}
              fillOpacity={node.state === 'idle' ? 0.25 : 1}
              stroke={fill}
              strokeWidth={node.state === 'active' ? 3.5 : 1.5}
            />
            <text
              className="viz-transition"
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={600}
              fill="var(--cv-text)"
            >
              {String(node.value)}
            </text>
            {node.label && (
              <text x={pos.x} y={pos.y + R + 14} textAnchor="middle" fontSize={10} fill="var(--cv-muted)">
                {node.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
});
