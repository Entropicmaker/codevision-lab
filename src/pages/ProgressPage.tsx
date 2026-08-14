import { Link } from 'react-router-dom';
import { algorithmMetas, getAlgorithmMeta } from '../content/algorithms/registry';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { IconCheck, IconChart, IconStar } from '../components/ui/Icons';

export function ProgressPage() {
  const { t, localize } = useI18n();
  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const completedLessons = useProgress((s) => s.completedLessons);
  const favorites = useProgress((s) => s.favorites);

  const completedEntries = Object.entries(completedAlgorithms).sort((a, b) => b[1].doneAt - a[1].doneAt);
  const favoriteMetas = favorites
    .map((id) => getAlgorithmMeta(id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const totalAlgorithms = algorithmMetas.length;
  const totalItems = totalAlgorithms + Object.keys(completedLessons).length;
  const doneItems = completedEntries.length + Object.keys(completedLessons).length;
  const overall = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const isEmpty = completedEntries.length === 0 && favoriteMetas.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold">{t.progress.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.progress.subtitle}</p>
      </header>

      {isEmpty ? (
        <EmptyState
          icon={<IconChart size={30} />}
          title={t.progress.empty}
          action={
            <Link to="/algorithms">
              <Button variant="primary">{t.nav.algorithms}</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* 总体进度 */}
          <section className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-text">{t.progress.overall}</span>
              <span className="font-mono text-muted">
                {doneItems} / {totalItems} · {overall}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-surface2"
              role="progressbar"
              aria-valuenow={overall}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${overall}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
              <Badge tone="done">
                <IconCheck size={11} />
                {t.progress.algorithmsDone}: {completedEntries.length}
              </Badge>
              <Badge tone="neutral">
                {t.progress.lessonsDone}: {Object.keys(completedLessons).length}
              </Badge>
            </div>
          </section>

          {/* 已完成算法 */}
          {completedEntries.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
                <IconCheck size={15} className="text-emerald-500" />
                {t.progress.algorithmsDone}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {completedEntries.map(([id, record]) => {
                  const meta = getAlgorithmMeta(id);
                  if (!meta) return null;
                  return (
                    <Link
                      key={id}
                      to={`/algorithms/${id}`}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 transition hover:border-borderstrong"
                    >
                      <span className="font-medium text-text">{localize(meta.name)}</span>
                      <DifficultyBadge difficulty={meta.difficulty} />
                      <span className="ml-auto flex flex-col items-end text-[10px] text-muted">
                        <span>{t.algorithms.lastInput}: {record.lastInput || '—'}</span>
                        <span>{new Date(record.doneAt).toLocaleString()}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 收藏 */}
          {favoriteMetas.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
                <IconStar size={15} className="text-amber-500" />
                {t.progress.favorites}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {favoriteMetas.map((meta) => (
                  <Link
                    key={meta.id}
                    to={`/algorithms/${meta.id}`}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 transition hover:border-borderstrong"
                  >
                    <span className="font-medium text-text">{localize(meta.name)}</span>
                    <Badge tone="accent">{t.algorithms.categories[meta.category]}</Badge>
                    <DifficultyBadge difficulty={meta.difficulty} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
