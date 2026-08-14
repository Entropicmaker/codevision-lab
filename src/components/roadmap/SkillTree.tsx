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

/** 分组（叙事顺序）：组内节点在树中聚拢排列 */
export const GROUP_COLS: Array<{ title: { zh: string; en: string }; categories: CategoryId[] }> = [
  { title: { zh: '数组与排序', en: 'Arrays & Sorting' }, categories: ['array', 'sorting'] },
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
  { title: { zh: '动态规划', en: 'Dynamic Programming' }, categories: ['dp'] },
];

const NODE_W = 224;
const NODE_H = 64;
const LEVEL_GAP = 150; // 层与层之间的垂直间距
const NODE_GAP = 60; // 组内节点间距
const GROUP_GAP = 96; // 组间间距
const MARGIN = 80;

const DIFFICULTY_ACCENT: Record<Difficulty, string> = {
  easy: 'border-l-emerald-500',
  medium: 'border-l-amber-500',
  hard: 'border-l-red-500',
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-red-500',
};

export interface SkillTreeLayout {
  positions: Record<string, { x: number; y: number; level: number }>;
  width: number;
  height: number;
  levels: number;
}

/** 拓扑分层：level = max(前置 level) + 1，无前置为 0（根层在顶部） */
function computeLevels(items: RoadmapItem[]): Map<string, number> {
  const levels = new Map<string, number>(items.map((i) => [i.id, 0]));
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of items) {
      const maxPrereq = item.prerequisites.reduce((max, p) => {
        const l = levels.get(p);
        return l === undefined ? max : Math.max(max, l);
      }, -1);
      const target = maxPrereq + 1;
      if (target !== levels.get(item.id)) {
        levels.set(item.id, target);
        changed = true;
      }
    }
  }
  return levels;
}

export function computeLayout(items: RoadmapItem[]): SkillTreeLayout {
  const levels = computeLevels(items);
  const maxLevel = Math.max(0, ...levels.values());
  const positions: SkillTreeLayout['positions'] = {};

  // 每层按分组聚拢：先按 GROUP_COLS 顺序收集组，再组内按注册顺序
  const levelGroups = new Map<
    number,
    Array<{ groupKey: string; nodes: RoadmapItem[]; width: number }>
  >();
  let maxLevelWidth = 0;
  for (let l = 0; l <= maxLevel; l += 1) {
    const nodes = (() => {
      const list: RoadmapItem[] = [];
      for (const item of items) {
        if ((levels.get(item.id) ?? 0) === l) list.push(item);
      }
      return list;
    })();
    const byGroup = new Map<string, RoadmapItem[]>();
    for (const node of nodes) {
      const key =
        GROUP_COLS.find((g) => g.categories.includes(node.category))?.title.zh ?? 'other';
      const list = byGroup.get(key) ?? [];
      list.push(node);
      byGroup.set(key, list);
    }
    const ordered = Array.from(byGroup.entries()).sort(
      (a, b) =>
        GROUP_COLS.findIndex((g) => g.title.zh === a[0]) -
        GROUP_COLS.findIndex((g) => g.title.zh === b[0]),
    );
    const groups = ordered.map(([groupKey, list]) => ({
      groupKey,
      nodes: list,
      width: list.length * NODE_W + Math.max(0, list.length - 1) * NODE_GAP,
    }));
    const totalW =
      groups.reduce((s, g) => s + g.width, 0) + Math.max(0, groups.length - 1) * GROUP_GAP;
    maxLevelWidth = Math.max(maxLevelWidth, totalW);
    levelGroups.set(l, groups);
  }

  const width = Math.max(900, maxLevelWidth + MARGIN * 2);

  // 第二遍：整体居中排位置
  for (let l = 0; l <= maxLevel; l += 1) {
    const groups = levelGroups.get(l) ?? [];
    const totalW =
      groups.reduce((s, g) => s + g.width, 0) + Math.max(0, groups.length - 1) * GROUP_GAP;
    let cursor = (width - totalW) / 2;
    const y = MARGIN + l * (NODE_H + LEVEL_GAP);
    for (const group of groups) {
      for (const node of group.nodes) {
        positions[node.id] = { x: cursor, y, level: l };
        cursor += NODE_W + NODE_GAP;
      }
      cursor += GROUP_GAP - NODE_GAP;
    }
  }

  const height = MARGIN * 2 + maxLevel * (NODE_H + LEVEL_GAP) + NODE_H;
  return { positions, width, height, levels: maxLevel + 1 };
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

  const prereqName = (id: string): string => {
    const item = items.find((i) => i.id === id);
    return item ? item.name[locale] : id;
  };

  // 依赖边：父节点底部 → 子节点顶部（贝塞尔曲线，箭头向下）
  const edges = items.flatMap((item) =>
    item.prerequisites
      .filter((p) => layout.positions[p] && layout.positions[item.id])
      .map((p) => {
        const from = layout.positions[p];
        const to = layout.positions[item.id];
        const x1 = from.x + NODE_W / 2;
        const y1 = from.y + NODE_H;
        const x2 = to.x + NODE_W / 2;
        const y2 = to.y;
        const my = (y1 + y2) / 2;
        const isMatchEdge = q !== '' && matches.has(item.id);
        return {
          id: `${p}->${item.id}`,
          d: `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`,
          highlight: isMatchEdge,
        };
      }),
  );

  // 组标签：仅在最上层的该组节点上方显示
  const groupLabels: Array<{ label: string; x: number; y: number }> = [];
  {
    const seen = new Set<string>();
    for (const item of items) {
      const group = GROUP_COLS.find((g) => g.categories.includes(item.category));
      if (!group || seen.has(group.title.zh)) continue;
      const pos = layout.positions[item.id];
      if (!pos) continue;
      seen.add(group.title.zh);
      groupLabels.push({ label: group.title[locale], x: pos.x + NODE_W / 2, y: pos.y - 26 });
    }
  }

  return (
    <div
      className="relative"
      style={{ width: layout.width, height: layout.height }}
      role="img"
      aria-label="skill tree"
    >
      {/* 点阵背景 + 依赖边 */}
      <svg className="absolute inset-0" width={layout.width} height={layout.height} aria-hidden>
        <defs>
          <pattern id="dot-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="var(--cv-border)" opacity="0.55" />
          </pattern>
          <marker
            id="tree-arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="9"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto"
          >
            <path d="M 0 0 L 10 0 L 5 10 Z" fill="var(--cv-muted)" />
          </marker>
        </defs>
        <rect width={layout.width} height={layout.height} fill="url(#dot-grid)" opacity={0.6} />
        {edges.map((edge) => (
          <path
            key={edge.id}
            d={edge.d}
            fill="none"
            stroke={edge.highlight ? 'var(--cv-accent)' : 'var(--cv-muted)'}
            strokeWidth={edge.highlight ? 2.5 : 1.6}
            strokeOpacity={edge.highlight ? 0.9 : 0.5}
            markerEnd="url(#tree-arrow)"
          />
        ))}
      </svg>

      {/* 组标签 */}
      {groupLabels.map((g) => (
        <div
          key={g.label}
          className="absolute -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-muted"
          style={{ left: g.x, top: g.y }}
        >
          {g.label}
        </div>
      ))}

      {/* 节点 */}
      {items.map((item) => {
        const pos = layout.positions[item.id];
        if (!pos) return null;
        const isDone = completed[item.id] !== undefined;
        const isMatch = q !== '' && matches.has(item.id);
        const isRoot = item.prerequisites.length === 0;
        return (
          <Link
            key={item.id}
            to={`/algorithms/${item.id}`}
            className={cn(
              'absolute flex flex-col justify-center gap-1 rounded-2xl border border-border border-l-4 bg-surface px-4 py-2 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg',
              DIFFICULTY_ACCENT[item.difficulty],
              isMatch && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
            )}
            style={{ left: pos.x, top: pos.y, width: NODE_W, height: NODE_H }}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn('h-2.5 w-2.5 shrink-0 rounded-full', DIFFICULTY_DOT[item.difficulty])}
                aria-hidden
              />
              <span className="truncate text-sm font-semibold text-text">{item.name[locale]}</span>
              {isDone && (
                <IconCheck size={15} className="ml-auto shrink-0 text-emerald-500" aria-label="done" />
              )}
              {!isDone && isRoot && (
                <span className="ml-auto shrink-0 text-[10px] text-muted/70">
                  {locale === 'zh' ? '基础' : 'basic'}
                </span>
              )}
            </div>
            <span className="truncate text-[11px] text-muted">
              {item.prerequisites.length > 0
                ? `${locale === 'zh' ? '前置' : 'Req'}: ${item.prerequisites.map(prereqName).join(' · ')}`
                : locale === 'zh'
                  ? '无前置 · 可直接开始'
                  : 'No prerequisites · start here'}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
