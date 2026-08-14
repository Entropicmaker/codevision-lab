import { memo } from 'react';
import type { AlgorithmStep, DisplayItem, TreeSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 堆渲染器：树结构 + 数组结构同步展示（左树右数组）。
 * - 树节点按完全二叉树数组索引布局（id `n:<i>` 或与容器索引对应的 id）
 * - 数组方块与树节点同色同步高亮，下方标注索引
 * - 比较/交换的节点在两侧同时高亮
 */
export const HeapRenderer = memo(function HeapRenderer({ step }: { step: AlgorithmStep | null }) {
  const { t } = useI18n();
  const structure = step?.structures.find((s): s is TreeSnapshot => s.kind === 'tree');
  const array = step ? (step.containers[Object.keys(step.containers)[0] ?? ''] ?? []) : [];

  const nodes = structure?.nodes ?? [];
  const edges = structure?.edges ?? [];

  if (nodes.length === 0 && array.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        {t.panels.empty}
      </div>
    );
  }

  const R = 20;
  const treeW = 400;
  const arrayH = 64;
  const H = Math.max(250, (Math.ceil(Math.log2(nodes.length + 1)) + 1) * 64 + 30 + arrayH);
  const W = 660;

  const posFor = (id: string): { x: number; y: number } | null => {
    const match = id.match(/n:(\d+)/) ?? id.match(/(\d+)/);
    if (!match) return null;
    const index = Number(match[1]);
    const level = Math.floor(Math.log2(index + 1));
    const first = Math.pow(2, level) - 1;
    const count = Math.pow(2, level);
    const slot = index - first;
    const levelWidth = treeW - 60;
    return { x: 30 + ((slot + 0.5) / count) * levelWidth, y: 40 + level * 62 };
  };

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const pos = posFor(node.id);
    if (pos) positions.set(node.id, pos);
  }

  const arrayY = H - arrayH + 22;
  const arrN = array.length;
  const slot = Math.min(46, (W - 80) / Math.max(1, arrN));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="heap">
      {/* 树边 */}
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
            strokeWidth={edge.state === 'active' ? 2.5 : 1.4}
            opacity={0.8}
          />
        );
      })}

      {/* 树节点 */}
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
              strokeWidth={node.state === 'active' || node.state === 'comparing' ? 2.5 : 1.4}
            />
            <text
              className="viz-transition"
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="var(--cv-text)"
            >
              {String(node.value)}
            </text>
            {node.label && (
              <text x={pos.x} y={pos.y + R + 12} textAnchor="middle" fontSize={9.5} fill="var(--cv-muted)">
                {node.label}
              </text>
            )}
          </g>
        );
      })}

      {/* 数组视图 */}
      <text x={30} y={arrayY - 14} fontSize={11} fill="var(--cv-muted)">
        {t.panels.containers}
      </text>
      {array.map((el: DisplayItem, i: number) => {
        const x = 30 + i * slot;
        const fill = stateColorVar(el.state);
        return (
          <g key={el.id} className="viz-transition">
            <rect
              x={x}
              y={arrayY}
              width={Math.max(24, slot - 5)}
              height={34}
              rx={6}
              fill={fill}
              fillOpacity={el.state === 'idle' ? 0.22 : 1}
              stroke={fill}
              strokeWidth={1.2}
            />
            <text
              x={x + slot / 2}
              y={arrayY + 21}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="var(--cv-text)"
            >
              {String(el.value)}
            </text>
            <text x={x + slot / 2} y={arrayY + 46} textAnchor="middle" fontSize={9.5} fill="var(--cv-muted)">
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
});
