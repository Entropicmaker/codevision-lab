import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { algorithmMetas, filterAlgorithms, getCategories } from '../content/algorithms/registry';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { cn } from '../lib/cn';
import { BookPage, BookSection } from '../components/layout/BookPage';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { IconCheck, IconChevronRight, IconPlay, IconSearch, IconStar } from '../components/ui/Icons';

const DIFFICULTY_DOT: Record<string, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-red-500',
};

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
type StatusFilter = 'all' | 'favorites' | 'completed';

/** 算法可视化：书籍目录式排版 */
export function AlgorithmsPage() {
  const { t, locale, localize } = useI18n();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const isMobile = useMediaQuery('(max-width: 639px)');
  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const favorites = useProgress((s) => s.favorites);

  const categories = useMemo(() => getCategories(), []);
  const filtered = useMemo(() => {
    const matches = filterAlgorithms({
        query,
        difficulty: difficulty === 'all' ? undefined : difficulty,
      });
    if (statusFilter === 'favorites') return matches.filter((meta) => favorites.includes(meta.id));
    if (statusFilter === 'completed') return matches.filter((meta) => completedAlgorithms[meta.id] !== undefined);
    return matches;
  }, [query, difficulty, statusFilter, favorites, completedAlgorithms]);

  const toc = categories.map((cat) => ({
    id: cat.id,
    label: t.algorithms.categories[cat.id],
    count: filtered.filter((m) => m.category === cat.id).length,
  }));
  const firstVisibleCategory = categories.find((cat) => filtered.some((meta) => meta.category === cat.id))?.id;

  const toolbar = (
    <div className="flex flex-col gap-2">
      <div className="relative w-full max-w-xs">
        <IconSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.algorithms.searchPlaceholder}
          className="h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              difficulty === d
                ? 'border-accent/60 bg-accentsoft font-medium text-accent'
                : 'border-border text-muted hover:text-text',
            )}
          >
            {d === 'all' ? t.algorithms.allCategories : t.common.difficulty[d]}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
        {(['all', 'favorites', 'completed'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              statusFilter === value
                ? 'border-accent/60 bg-accentsoft font-medium text-accent'
                : 'border-border text-muted hover:text-text',
            )}
          >
            {value === 'all'
              ? (locale === 'zh' ? '全部状态' : 'All status')
              : value === 'favorites'
                ? (locale === 'zh' ? '已收藏' : 'Favorites')
                : t.common.completed}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <BookPage
      kicker={t.nav.algorithms}
      title={t.algorithms.title}
      subtitle={t.algorithms.subtitle}
      toc={toc}
      toolbar={toolbar}
    >
      {categories.map((cat, ci) => {
        const items = filtered.filter((m) => m.category === cat.id);
        if (items.length === 0) return null;
        const expanded = !isMobile || cat.id === firstVisibleCategory || query.trim() !== '' || expandedCategories.includes(cat.id);
        return (
          <BookSection
            key={cat.id}
            id={cat.id}
            index={ci + 1}
            title={t.algorithms.categories[cat.id]}
            right={isMobile ? (
              <button
                type="button"
                onClick={() => setExpandedCategories((current) => current.includes(cat.id) ? current.filter((id) => id !== cat.id) : [...current, cat.id])}
                className="rounded-full border border-border px-3 py-1 text-xs text-accent"
                aria-expanded={expanded}
              >
                {expanded ? (locale === 'zh' ? '收起' : 'Collapse') : `${items.length} · ${locale === 'zh' ? '展开' : 'Expand'}`}
              </button>
            ) : `${items.length} ${locale === 'zh' ? '个算法' : 'algorithms'}`}
          >
            {expanded && <div className="grid gap-3 sm:grid-cols-2">
              {items.map((meta, idx) => {
                const done = completedAlgorithms[meta.id] !== undefined;
                const fav = favorites.includes(meta.id);
                return (
                  <Link
                    key={meta.id}
                    to={`/algorithms/${meta.id}`}
                    className="interactive-card surface-panel group flex min-h-28 flex-col p-3 sm:min-h-48 sm:p-4"
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-muted/60">{ci + 1}.{idx + 1}</span>
                      <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', DIFFICULTY_DOT[meta.difficulty])} aria-hidden />
                      <h3 className="font-semibold leading-snug text-text">{localize(meta.name)}</h3>
                      <span className="ml-auto flex gap-1.5">
                        {fav && <IconStar size={13} className="text-amber-500" />}
                        {done && <IconCheck size={14} className="text-emerald-500" />}
                      </span>
                    </div>
                    <p className="mt-3 hidden line-clamp-2 text-xs leading-relaxed text-muted sm:block">{localize(meta.description)}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3 sm:pt-4">
                      <DifficultyBadge difficulty={meta.difficulty} />
                      <Badge tone="neutral" className="max-sm:hidden">T {meta.complexity.time.average}</Badge>
                      <Badge tone="neutral" className="max-sm:hidden">S {meta.complexity.space}</Badge>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-accent">
                        <IconPlay size={12} />{t.algorithms.startDemo}<IconChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>}
          </BookSection>
        );
      })}
      <p className="mt-2 text-[11px] text-muted/60">
        {algorithmMetas.length} {locale === 'zh' ? '个算法已上线，持续扩充中' : 'algorithms live, growing'}
      </p>
    </BookPage>
  );
}
