import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { algorithmMetas, filterAlgorithms, getCategories } from '../content/algorithms/registry';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/cn';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { IconCheck, IconPlay, IconSearch, IconStar } from '../components/ui/Icons';

type CategoryFilter = string; // CategoryId | 'all'
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export function AlgorithmsPage() {
  const { t, localize } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const favorites = useProgress((s) => s.favorites);

  const categories = useMemo(() => getCategories(), []);
  const filtered = useMemo(
    () =>
      filterAlgorithms({
        query,
        category: category === 'all' ? undefined : (category as never),
        difficulty: difficulty === 'all' ? undefined : difficulty,
      }),
    [query, category, difficulty],
  );

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold">{t.algorithms.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.algorithms.subtitle}</p>
      </header>

      {/* 筛选 */}
      <div className="flex flex-col gap-2">
        <div className="relative max-w-sm">
          <IconSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.algorithms.searchPlaceholder}
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              category === 'all'
                ? 'border-accent/60 bg-accentsoft font-medium text-accent'
                : 'border-border text-muted hover:text-text',
            )}
          >
            {t.algorithms.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(category === cat.id ? 'all' : cat.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                category === cat.id
                  ? 'border-accent/60 bg-accentsoft font-medium text-accent'
                  : 'border-border text-muted hover:text-text',
              )}
            >
              {t.algorithms.categories[cat.id]} ({cat.count})
            </button>
          ))}
          <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(difficulty === d ? 'all' : d)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                difficulty === d
                  ? 'border-accent/60 bg-accentsoft font-medium text-accent'
                  : 'border-border text-muted hover:text-text',
              )}
            >
              {t.common.difficulty[d]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<IconSearch size={28} />} title={t.roadmap.noResult} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((meta) => {
            const done = completedAlgorithms[meta.id] !== undefined;
            const fav = favorites.includes(meta.id);
            return (
              <Link
                key={meta.id}
                to={`/algorithms/${meta.id}`}
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface cv-card p-4 transition hover:border-borderstrong hover:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-text">{localize(meta.name)}</h2>
                  <DifficultyBadge difficulty={meta.difficulty} />
                  <span className="ml-auto flex items-center gap-1">
                    {fav && <IconStar size={14} className="text-amber-500" />}
                    {done && <IconCheck size={15} className="text-emerald-500" />}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                  {localize(meta.description)}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge tone="accent">{t.algorithms.categories[meta.category]}</Badge>
                    <Badge tone="neutral">{meta.complexity.time.average}</Badge>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                    <IconPlay size={13} />
                    {t.algorithms.startDemo}
                  </span>
                </div>
                {done && completedAlgorithms[meta.id]?.lastInput && (
                  <div className="border-t border-border pt-1.5 text-[11px] text-muted">
                    {t.algorithms.lastInput}:{' '}
                    <span className="font-mono">{completedAlgorithms[meta.id]?.lastInput || '—'}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted">
        {algorithmMetas.length} / 11
      </p>
    </div>
  );
}
