import { memo } from 'react';
import type { AlgorithmStep, LinearStructureSnapshot } from '../engine/types/step';
import { stateColorVar } from './stateColor';
import { useI18n } from '../hooks/useI18n';

/**
 * 链表渲染器：节点 + next 指针连线 + head 指针 + 当前节点高亮。
 * items 顺序即链序；label='detached' 的元素渲染为游离节点（虚线框，不参与连线）。
 */
export const LinkedListRenderer = memo(function LinkedListRenderer({
  step,
}: {
  step: AlgorithmStep | null;
}) {
  const { t } = useI18n();
  const structure = step?.structures.find(
    (s): s is LinearStructureSnapshot => s.kind === 'linked-list',
  );

  const items = structure?.items ?? [];
  const chained = items.filter((el) => el.label !== 'detached');
  const detached = items.filter((el) => el.label === 'detached');

  const W = Math.max(320, chained.length * 130 + 140);
  const H = 210;
  const nodeW = 76;
  const nodeH = 48;
  const y = 80;

  return (
    <div className="flex justify-center py-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="linked list">
        {chained.length === 0 && (
          <text x={W / 2} y={y + nodeH / 2} textAnchor="middle" fontSize={12} fill="var(--cv-muted)">
            {t.panels.empty}
          </text>
        )}

        {/* head 指针 */}
        {chained.length > 0 && (
          <g>
            <line x1={60} y1={30} x2={60} y2={y - 8} stroke="var(--cv-accent)" strokeWidth={1.5} strokeDasharray="4 3" />
            <path d="M 60 22 l -5 -9 h 10 Z" fill="var(--cv-accent)" />
            <text x={69} y={20} fontSize={12} fontWeight={700} fill="var(--cv-accent)">
              head
            </text>
          </g>
        )}

        {chained.map((el, i) => {
          const x = 60 + i * 130;
          const fill = stateColorVar(el.state);
          const isLast = i === chained.length - 1;
          return (
            <g key={el.id}>
              {/* next 连线 */}
              {!isLast && (
                <line
                  x1={x + nodeW}
                  y1={y + nodeH / 2}
                  x2={x + 130}
                  y2={y + nodeH / 2}
                  stroke="var(--cv-muted)"
                  strokeWidth={1.5}
                />
              )}
              {!isLast && (
                <path d={`M ${x + 130 - 5} ${y + nodeH / 2} l -8 -4 v 8 Z`} fill="var(--cv-muted)" />
              )}
              {isLast && (
                <text x={x + nodeW + 12} y={y + nodeH / 2 + 4} fontSize={11} fill="var(--cv-muted)">
                  null
                </text>
              )}
              {/* 节点：数据域 + next 域 */}
              <g className="viz-transition">
                <rect
                  x={x}
                  y={y}
                  width={nodeW}
                  height={nodeH}
                  rx={8}
                  fill={fill}
                  fillOpacity={el.state === 'idle' ? 0.28 : 1}
                  stroke={fill}
                  strokeWidth={el.state === 'idle' ? 1 : 0}
                />
                <line x1={x + 52} y1={y} x2={x + 52} y2={y + nodeH} stroke="var(--cv-border)" />
                <text x={x + 26} y={y + nodeH / 2 + 4} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--cv-text)">
                  {String(el.value)}
                </text>
                <text x={x + 64} y={y + nodeH / 2 + 4} textAnchor="middle" fontSize={10} fill="var(--cv-muted)">
                  next
                </text>
              </g>
              {el.label && el.label !== 'detached' && (
                <text x={x + nodeW / 2} y={y + nodeH + 16} textAnchor="middle" fontSize={10} fill="var(--cv-muted)">
                  {el.label}
                </text>
              )}
            </g>
          );
        })}

        {/* 游离节点 */}
        {detached.map((el, i) => {
          const x = 60 + i * 130;
          const dy = y + nodeH + 46;
          return (
            <g key={el.id} opacity={0.75}>
              <rect
                x={x}
                y={dy}
                width={nodeW}
                height={nodeH}
                rx={8}
                fill="var(--cv-surface-2)"
                stroke="var(--cv-muted)"
                strokeDasharray="4 3"
                className="viz-transition"
              />
              <text x={x + nodeW / 2} y={dy + nodeH / 2 + 4} textAnchor="middle" fontSize={14} fill="var(--cv-muted)">
                {String(el.value)}
              </text>
              <text x={x + nodeW / 2} y={dy - 6} textAnchor="middle" fontSize={10} fill="var(--cv-muted)">
                {t.common.close && 'detached'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
