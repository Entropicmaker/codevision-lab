import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterAlgorithms, getCategories } from '../../content/algorithms/registry';
import { useProgress } from '../../stores/progressStore';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../lib/cn';
import { IconCheck, IconChevronDown, IconSearch, IconStar } from '../ui/Icons';

const DIFFICULTY_DOT: Record<string, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-red-500',
};

/** 左侧算法分类导航：折叠 / 搜索 / 难度筛选 / 已学状态 / 收藏 */
export function LeftSidebar({ activeId }: { activeId: string }) {
  const { t, localize } = useI18n();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const favorites = useProgress((s) => s.favorites);

  const categories = getCategories();
  const filtered = useMemo(
    () => filterAlgorithms({ query, difficulty, category: 'all' }),
    [query, difficulty],
  );

  const toggleCategory = (id: string): void => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 搜索 */}
      <div className="relative">
        <IconSearch size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.algorithms.searchPlaceholder}
          className="h-8 w-full rounded-lg border border-border bg-surface pl-8 pr-2 text-xs text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>
      {/* 难度筛选 */}
      <div className="flex items-center gap-1">
        {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            className={cn(
              'flex-1 rounded-md border px-1 py-1 text-[11px] transition-colors',
              difficulty === d
                ? 'border-accent/60 bg-accentsoft font-medium text-accent'
                : 'border-border text-muted hover:text-text',
            )}
          >
            {d === 'all' ? t.algorithms.allCategories : t.common.difficulty[d]}
          </button>
        ))}
      </div>

      {/* 分类树 */}
      <nav className="flex flex-col gap-1" aria-label={t.nav.algorithms}>
        {categories.map((cat) => {
          const items = filtered.filter((m) => m.category === cat.id);
          if (items.length === 0) return null;
          const isCollapsed = collapsed.has(cat.id);
          return (
            <div key={cat.id}>
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-muted hover:bg-surface2 hover:text-text"
                aria-expanded={!isCollapsed}
              >
                <IconChevronDown
                  size={13}
                  className={cn('transition-transform', isCollapsed && '-rotate-90')}
                />
                {t.algorithms.categories[cat.id]}
                <span className="ml-auto text-[10px] font-normal text-muted/70">{cat.count}</span>
              </button>
              {!isCollapsed && (
                <div className="ml-2 flex flex-col gap-0.5 border-l border-border pl-2">
                  {items.map((m) => {
                    const done = completedAlgorithms[m.id] !== undefined;
                    const fav = favorites.includes(m.id);
                    return (
                      <Link
                        key={m.id}
                        to={`/algorithms/${m.id}`}
                        className={cn(
                          'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors',
                          m.id === activeId
                            ? 'bg-accentsoft font-medium text-accent'
                            : 'text-muted hover:bg-surface2 hover:text-text',
                        )}
                      >
                        <span
                          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DIFFICULTY_DOT[m.difficulty])}
                          aria-hidden
                        />
                        <span className="truncate">{localize(m.name)}</span>
                        {fav && <IconStar size={11} className="ml-auto shrink-0 text-amber-500" />}
                        {done && (
                          <IconCheck size={12} className={cn('shrink-0 text-emerald-500', !fav && 'ml-auto')} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {filtered.length === 0 && (
        <p className="px-2 text-xs text-muted">{t.roadmap.noResult}</p>
      )}
    </div>
  );
}
