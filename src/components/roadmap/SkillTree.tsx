import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryId, Difficulty } from '../../engine/types/algorithm';
import type { AlgorithmProgressRecord } from '../../stores/progressStore';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../lib/cn';
import { IconCheck } from '../ui/Icons';

export interface RoadmapItem {
  id: string;
  name: { zh: string; en: string };
  category: CategoryId;
  difficulty: Difficulty;
  prerequisites: string[];
}

/** 分组列：与需求中的技能树结构对应 */
export const GROUP_COLS: Array<{ title: { zh: string; en: string }; categories: CategoryId[] }> = [
  { title: { zh: '数组操作', en: 'Array Ops' }, categories: ['array'] },
  {
    title: { zh: '双指针技巧', en: 'Two Pointers' },
    categories: ['two-pointers', 'sliding-window', 'searching'],
  },
  {
    title: { zh: '基础数据结构', en: 'Basic Structures' },
    categories: ['basic-structure', 'stack', 'queue'],
  },
  { title: { zh: '链表', en: 'Linked List' }, categories: ['linked-list'] },
  { title: { zh: '二叉树', en: 'Binary Tree' }, categories: ['tree'] },
  { title: { zh: '图', en: 'Graph' }, categories: ['graph'] },
  { title: { zh: '排序与动态规划', en: 'Sorting & DP' }, categories: ['sorting', 'dp'] },
];

const NODE_W = 208;
const NODE_H = 60;
const COL_GAP = 300;
const ROW_GAP = 130;
const MARGIN = 70;

const DIFFICULTY_BORDER: Record<Difficulty, string> = {
  easy: 'border-emerald-500/50',
  medium: 'border-amber-500/50',
  hard: 'border-red-500/50',
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-red-500',
};

export interface SkillTreeLayout {
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
  colIndex: Record<string, number>;
}

export function computeLayout(items: RoadmapItem[]): SkillTreeLayout {
  const positions: SkillTreeLayout['positions'] = {};
  const colIndex: Record<string, number> = {};
  const colHeights = GROUP_COLS.map(() => 0);

  for (const item of items) {
    const col = GROUP_COLS.findIndex((g) => g.categories.includes(item.category));
    if (col < 0) continue;
    const row = colHeights[col] ?? 0;
    colHeights[col] = row + 1;
    colIndex[item.id] = col;
    positions[item.id] = {
      x: MARGIN + col * COL_GAP,
      y: MARGIN + row * ROW_GAP,
    };
  }

  const width = MARGIN * 2 + Math.max(1, GROUP_COLS.length) * COL_GAP - (COL_GAP - NODE_W);
  const height = MARGIN * 2 + Math.max(1, ...colHeights) * ROW_GAP - (ROW_GAP - NODE_H);

  return { positions, width, height, colIndex };
}

export function SkillTree({
  items,
  completed,
  searchQuery,
}: {
  items: RoadmapItem[];
  completed: Record<string, AlgorithmProgressRecord>;
  searchQuery: string;
}) {
  const { locale } = useI18n();
  const layout = useMemo(() => computeLayout(items), [items]);
  const q = searchQuery.trim().toLowerCase();
  const matches = new Set(
    items.filter((i) => `${i.name.zh} ${i.name.en} ${i.id}`.toLowerCase().includes(q)).map((i) => i.id),
  );

  const edges = items.flatMap((item) =>
    item.prerequisites
      .filter((p) => layout.positions[p] && layout.positions[item.id])
      .map((p) => {
        const from = layout.positions[p];
        const to = layout.positions[item.id];
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const mx = (x1 + x2) / 2;
        return {
          id: `${p}->${item.id}`,
          d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
        };
      }),
  );

  return (
    <div
      className="relative"
      style={{ width: layout.width, height: layout.height }}
      role="img"
      aria-label="skill tree"
    >
      {/* 依赖边 */}
      <svg className="absolute inset-0" width={layout.width} height={layout.height} aria-hidden>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cv-muted)" />
          </marker>
        </defs>
        {edges.map((edge) => (
          <path
            key={edge.id}
            d={edge.d}
            fill="none"
            stroke="var(--cv-muted)"
            strokeWidth={1.5}
            strokeOpacity={0.55}
            markerEnd="url(#arrow)"
          />
        ))}
      </svg>

      {/* 列标题 */}
      {GROUP_COLS.map((group, col) => (
        <div
          key={col}
          className="absolute text-xs font-semibold uppercase tracking-wider text-muted"
          style={{ left: MARGIN + col * COL_GAP, top: 8, width: NODE_W }}
        >
          {group.title[locale]}
        </div>
      ))}

      {/* 节点 */}
      {items.map((item) => {
        const pos = layout.positions[item.id];
        if (!pos) return null;
        const isDone = completed[item.id] !== undefined;
        const isMatch = q !== '' && matches.has(item.id);
        return (
          <Link
            key={item.id}
            to={`/algorithms/${item.id}`}
            className={cn(
              'absolute flex flex-col justify-center gap-1 rounded-xl border bg-surface px-3 py-2 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg',
              DIFFICULTY_BORDER[item.difficulty],
              isMatch && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
            )}
            style={{ left: pos.x, top: pos.y, width: NODE_W, height: NODE_H }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={cn('h-2 w-2 shrink-0 rounded-full', DIFFICULTY_DOT[item.difficulty])}
                aria-hidden
              />
              <span className="truncate text-sm font-semibold text-text">{item.name[locale]}</span>
              {isDone && (
                <IconCheck size={14} className="ml-auto shrink-0 text-emerald-500" aria-label="done" />
              )}
            </div>
            <span className="truncate text-[11px] text-muted">
              {item.prerequisites.length > 0
                ? `${locale === 'zh' ? '前置' : 'Requires'}: ${item.prerequisites.join(', ')}`
                : locale === 'zh'
                  ? '无前置要求 · 可直接开始'
                  : 'No prerequisites · start here'}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
