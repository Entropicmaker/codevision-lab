import { memo } from 'react';
import type { AlgorithmStep, TreeSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 二叉树渲染器：完全二叉树按数组索引自动布局；
 * 节点状态驱动颜色（当前=蓝、已访问=绿），遍历路径边高亮。
 */
export const TreeRenderer = memo(function TreeRenderer({ step }: { step: AlgorithmStep | null }) {
  const { t } = useI18n();
  const structure = step?.structures.find((s): s is TreeSnapshot => s.kind === 'tree');

  const nodes = structure?.nodes ?? [];
  const edges = structure?.edges ?? [];
  const rootId = structure?.rootId ?? nodes[0]?.id ?? null;

  if (nodes.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        {t.panels.empty}
      </div>
    );
  }

  const R = 22;
  const W = Math.max(340, 120 * (Math.pow(2, Math.min(4, Math.ceil(Math.log2(nodes.length + 1)))) + 1));
  const H = Math.max(240, (Math.ceil(Math.log2(nodes.length + 1)) + 1) * 70 + 40);

  const posFor = (id: string): { x: number; y: number } | null => {
    const match = id.match(/n:(\d+)/);
    if (!match) return null;
    const index = Number(match[1]);
    const level = Math.floor(Math.log2(index + 1));
    const first = Math.pow(2, level) - 1;
    const count = Math.pow(2, level);
    const slot = index - first;
    const levelWidth = W - 80;
    const x = 40 + ((slot + 0.5) / count) * levelWidth;
    const y = 50 + level * 70;
    return { x, y };
  };

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const pos = posFor(node.id);
    if (pos) positions.set(node.id, pos);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="binary tree">
      {/* 边 */}
      {edges.map((edge) => {
        const from = positions.get(edge.from);
        const to = positions.get(edge.to);
        if (!from || !to) return null;
        const color = edge.state ? stateColorVar(edge.state) : 'var(--cv-muted)';
        return (
          <line
            key={`${edge.from}->${edge.to}`}
            className="viz-transition"
            x1={from.x}
            y1={from.y + R}
            x2={to.x}
            y2={to.y - R}
            stroke={color}
            strokeWidth={edge.state === 'active' || edge.state === 'comparing' ? 3 : 1.5}
            strokeDasharray={edge.state === 'active' ? '6 4' : undefined}
          />
        );
      })}

      {/* 节点 */}
      {nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const fill = stateColorVar(node.state);
        const isRoot = node.id === rootId;
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
              strokeWidth={node.state === 'active' ? 3 : 1.5}
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
              <text x={pos.x} y={pos.y - R - 6} textAnchor="middle" fontSize={10} fill="var(--cv-muted)">
                {node.label}
              </text>
            )}
            {isRoot && (
              <text x={pos.x} y={pos.y - R - 6} textAnchor="middle" fontSize={10} fill="var(--cv-accent)">
                root
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
});
