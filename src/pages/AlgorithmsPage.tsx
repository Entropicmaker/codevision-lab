import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { algorithmMetas, filterAlgorithms, getCategories } from '../content/algorithms/registry';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/cn';
import { BookPage, BookSection, BookEntry } from '../components/layout/BookPage';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { IconCheck, IconChevronRight, IconPlay, IconSearch, IconStar } from '../components/ui/Icons';

const DIFFICULTY_DOT: Record<string, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-red-500',
};

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

/** 算法可视化：书籍目录式排版 */
export function AlgorithmsPage() {
  const { t, locale, localize } = useI18n();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const favorites = useProgress((s) => s.favorites);

  const categories = useMemo(() => getCategories(), []);
  const filtered = useMemo(
    () =>
      filterAlgorithms({
        query,
        difficulty: difficulty === 'all' ? undefined : difficulty,
      }),
    [query, difficulty],
  );

  const toc = categories.map((cat) => ({
    id: cat.id,
    label: t.algorithms.categories[cat.id],
    count: filtered.filter((m) => m.category === cat.id).length,
  }));

  let entryNumber = 0;

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
        return (
          <BookSection
            key={cat.id}
            id={cat.id}
            index={ci + 1}
            title={t.algorithms.categories[cat.id]}
            right={`${items.length} ${locale === 'zh' ? '个算法' : 'algorithms'}`}
          >
            {items.map((meta) => {
              entryNumber += 1;
              const done = completedAlgorithms[meta.id] !== undefined;
              const fav = favorites.includes(meta.id);
              return (
                <BookEntry
                  key={meta.id}
                  number={String(entryNumber).padStart(2, '0')}
                  accentDot={undefined}
                  title={
                    <Link
                      to={`/algorithms/${meta.id}`}
                      className="group inline-flex items-center gap-2 hover:underline"
                    >
                      <span className={cn('h-2 w-2 rounded-full', DIFFICULTY_DOT[meta.difficulty])} aria-hidden />
                      <span>{localize(meta.name)}</span>
                      {fav && <IconStar size={13} className="text-amber-500" />}
                      {done && <IconCheck size={14} className="text-emerald-500" />}
                      <IconChevronRight
                        size={14}
                        className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  }
                  meta={
                    <>
                      <DifficultyBadge difficulty={meta.difficulty} />
                      <Badge tone="neutral">{meta.complexity.time.average}</Badge>
                      <Badge tone="neutral">{meta.complexity.space}</Badge>
                    </>
                  }
                  description={localize(meta.description)}
                  action={
                    <Link
                      to={`/algorithms/${meta.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <IconPlay size={12} />
                      {t.algorithms.startDemo}
                    </Link>
                  }
                />
              );
            })}
          </BookSection>
        );
      })}
      <p className="mt-2 text-[11px] text-muted/60">
        {algorithmMetas.length} {locale === 'zh' ? '个算法已上线，持续扩充中' : 'algorithms live, growing'}
      </p>
    </BookPage>
  );
}
