import { useRef, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { algorithmMetas, getAlgorithmMeta } from '../content/algorithms/registry';
import { lessonMetas, getLessonMeta } from '../content/lessons/registry';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { IconCheck, IconChart, IconPlay, IconStar } from '../components/ui/Icons';

export function ProgressPage() {
  const { t, localize, locale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const completedLessons = useProgress((s) => s.completedLessons);
  const favorites = useProgress((s) => s.favorites);
  const replaceProgress = useProgress((s) => s.replaceProgress);
  const resetProgress = useProgress((s) => s.resetProgress);

  const completedEntries = Object.entries(completedAlgorithms).sort((a, b) => b[1].doneAt - a[1].doneAt);
  const favoriteMetas = favorites
    .map((id) => getAlgorithmMeta(id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const totalAlgorithms = algorithmMetas.length;
  const totalItems = totalAlgorithms + lessonMetas.length;
  const doneItems = completedEntries.length + Object.keys(completedLessons).length;
  const overall = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const isEmpty = completedEntries.length === 0 && Object.keys(completedLessons).length === 0 && favoriteMetas.length === 0;
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyCount = [...completedEntries.map(([, record]) => record.doneAt), ...Object.values(completedLessons).map((record) => record.doneAt)].filter((timestamp) => timestamp >= weekStart).length;
  const nextAlgorithm = algorithmMetas.find((meta) => completedAlgorithms[meta.id] === undefined) ?? algorithmMetas[0];
  const recent = [
    ...completedEntries.map(([id, record]) => ({ kind: 'algorithm' as const, id, doneAt: record.doneAt })),
    ...Object.entries(completedLessons).map(([id, record]) => ({ kind: 'lesson' as const, id, doneAt: record.doneAt })),
  ].sort((a, b) => b.doneAt - a.doneAt).slice(0, 5);

  const exportProgress = (): void => {
    const payload = JSON.stringify({ version: 1, completedAlgorithms, completedLessons, favorites }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `codevision-progress-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as Partial<{ completedAlgorithms: typeof completedAlgorithms; completedLessons: typeof completedLessons; favorites: string[] }>;
      if (!data.completedAlgorithms || !data.completedLessons || !Array.isArray(data.favorites)) throw new Error('invalid');
      replaceProgress({ completedAlgorithms: data.completedAlgorithms, completedLessons: data.completedLessons, favorites: data.favorites });
    } catch {
      window.alert(locale === 'zh' ? '无法导入：文件格式不正确。' : 'Import failed: invalid file format.');
    } finally {
      event.target.value = '';
    }
  };

  const confirmReset = (): void => {
    if (window.confirm(locale === 'zh' ? '确定清空全部本地学习进度吗？此操作无法撤销。' : 'Clear all local learning progress? This cannot be undone.')) resetProgress();
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-7">
      <header className="coordinate-frame surface-panel p-5 sm:p-7">
        <p className="micro-label text-accent">Personal archive / local</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{t.progress.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t.progress.subtitle}</p>
      </header>

      {isEmpty ? (
        <section className="surface-panel p-5 sm:p-7">
          <div className="flex items-center gap-3"><IconChart size={30} className="text-accent" /><div><h2 className="text-lg font-semibold">{t.progress.empty}</h2><p className="mt-1 text-xs text-muted">{locale === 'zh' ? '所有记录只保存在当前浏览器中，你可以随时导出备份。' : 'Records stay in this browser only; you can export a backup at any time.'}</p></div></div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [locale === 'zh' ? '选择路线' : 'Pick a route', locale === 'zh' ? '从技能树找到适合的起点' : 'Find a starting point in the roadmap'],
              [locale === 'zh' ? '播放与练习' : 'Play and practise', locale === 'zh' ? '完成动画或课程小练习' : 'Finish a visualization or lesson exercise'],
              [locale === 'zh' ? '自动记录' : 'Track automatically', locale === 'zh' ? '完成状态和收藏会出现在这里' : 'Completions and favorites appear here'],
            ].map(([title, description], index) => <li key={title} className="rounded-2xl bg-surface2/55 p-4"><span className="font-mono text-xs text-accent">0{index + 1}</span><h3 className="mt-2 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-muted">{description}</p></li>)}
          </ol>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row"><Link to="/roadmap" className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white">{t.nav.roadmap}</Link><Link to="/algorithms/bubble-sort" className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-text">{locale === 'zh' ? '先体验冒泡排序' : 'Try bubble sort first'}</Link></div>
        </section>
      ) : (
        <>
          {/* 总体进度 */}
          <section className="surface-panel p-4 sm:p-5">
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

          <section className="grid gap-3 sm:grid-cols-3">
            <div className="surface-panel p-4"><span className="micro-label text-muted">7 days</span><strong className="mt-2 block text-3xl text-accent">{weeklyCount}</strong><span className="text-xs text-muted">{locale === 'zh' ? '本周完成项目' : 'items completed this week'}</span></div>
            <div className="surface-panel p-4"><span className="micro-label text-muted">Saved</span><strong className="mt-2 block text-3xl text-text">{favoriteMetas.length}</strong><span className="text-xs text-muted">{t.progress.favorites}</span></div>
            {nextAlgorithm && <Link to={`/algorithms/${nextAlgorithm.id}`} className="interactive-card surface-panel flex flex-col p-4"><span className="micro-label text-muted">Next</span><strong className="mt-2 text-base">{localize(nextAlgorithm.name)}</strong><span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-accent"><IconPlay size={12} />{locale === 'zh' ? '继续路线' : 'Continue route'}</span></Link>}
          </section>

          {recent.length > 0 && <section><h2 className="mb-2 text-sm font-semibold">{t.progress.recentTitle}</h2><div className="surface-panel divide-y divide-border">{recent.map((item) => {
            if (item.kind === 'algorithm') {
              const meta = getAlgorithmMeta(item.id);
              if (!meta) return null;
              return <Link key={`algorithm-${item.id}`} to={`/algorithms/${item.id}`} className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm hover:bg-surface2"><span className="font-medium">{localize(meta.name)}</span><span className="ml-auto text-[10px] text-muted">{new Date(item.doneAt).toLocaleString()}</span></Link>;
            }
            const lesson = getLessonMeta(item.id);
            if (!lesson) return null;
            return <Link key={`lesson-${item.id}`} to={`/learn/${lesson.language}/${item.id}`} className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm hover:bg-surface2"><span className="font-medium">{localize(lesson.title)}</span><span className="ml-auto text-[10px] text-muted">{new Date(item.doneAt).toLocaleString()}</span></Link>;
          })}</div></section>}

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
                      className="interactive-card surface-panel flex flex-col items-start gap-2.5 px-4 py-3 sm:flex-row sm:items-center"
                    >
                      <span className="font-medium text-text">{localize(meta.name)}</span>
                      <DifficultyBadge difficulty={meta.difficulty} />
                      <span className="flex max-w-full flex-col items-start text-[10px] text-muted sm:ml-auto sm:items-end">
                        <span className="max-w-full truncate">{t.algorithms.lastInput}: {record.lastInput || '—'}</span>
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
                    className="interactive-card surface-panel flex flex-wrap items-center gap-2.5 px-4 py-3"
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

      <section className="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-sm font-semibold">{locale === 'zh' ? '本地数据管理' : 'Local data controls'}</h2><p className="mt-1 text-xs leading-relaxed text-muted">{locale === 'zh' ? '本站没有账户系统；更换浏览器或清除缓存前请导出备份。' : 'There is no account sync; export a backup before switching browsers or clearing storage.'}</p></div>
        <div className="flex flex-wrap gap-2"><Button size="sm" onClick={exportProgress}>{locale === 'zh' ? '导出' : 'Export'}</Button><Button size="sm" onClick={() => fileInputRef.current?.click()}>{locale === 'zh' ? '导入' : 'Import'}</Button><Button size="sm" variant="danger" onClick={confirmReset}>{locale === 'zh' ? '清空' : 'Clear'}</Button><input ref={fileInputRef} type="file" accept="application/json" className="sr-only" onChange={(event) => void importProgress(event)} /></div>
      </section>
    </div>
  );
}
