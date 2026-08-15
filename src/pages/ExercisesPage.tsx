import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { lessonMetas } from '../content/lessons/registry';
import { useI18n } from '../hooks/useI18n';
import { useProgress } from '../stores/progressStore';
import { cn } from '../lib/cn';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { IconCheck, IconChevronRight, IconListCheck, IconShuffle } from '../components/ui/Icons';

type ExerciseLanguage = 'all' | 'cpp' | 'csharp' | 'python';
type ExerciseDifficulty = 'all' | 'easy' | 'medium' | 'hard';
type ExerciseStatus = 'all' | 'open' | 'completed';

export function ExercisesPage() {
  const { t, locale, localize } = useI18n();
  const navigate = useNavigate();
  const completedLessons = useProgress((state) => state.completedLessons);
  const [language, setLanguage] = useState<ExerciseLanguage>('all');
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('all');
  const [status, setStatus] = useState<ExerciseStatus>('all');
  const [visibleCount, setVisibleCount] = useState(9);

  const filtered = useMemo(() => lessonMetas.filter((lesson) => {
    if (language !== 'all' && lesson.language !== language) return false;
    if (difficulty !== 'all' && lesson.difficulty !== difficulty) return false;
    const done = completedLessons[lesson.id] !== undefined;
    if (status === 'completed' && !done) return false;
    if (status === 'open' && done) return false;
    return true;
  }), [language, difficulty, status, completedLessons]);

  useEffect(() => setVisibleCount(9), [language, difficulty, status]);
  const visibleExercises = filtered.slice(0, visibleCount);

  const pickRandom = (): void => {
    const pool = filtered.length > 0 ? filtered : lessonMetas;
    const lesson = pool[Math.floor(Math.random() * pool.length)];
    if (lesson) navigate(`/learn/${lesson.language}/${lesson.id}#exercise`);
  };

  const filterClass = (active: boolean) => cn('min-h-9 rounded-full border px-3 text-xs transition', active ? 'border-accent/50 bg-accentsoft font-semibold text-accent' : 'border-border text-muted hover:text-text');

  return (
    <div className="flex flex-col gap-5">
      <header className="coordinate-frame surface-panel p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="micro-label text-accent">Practice deck / active recall</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{t.exercises.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t.exercises.subtitle}</p>
          </div>
          <button type="button" onClick={pickRandom} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white">
            <IconShuffle size={15} />{locale === 'zh' ? '随机练习一题' : 'Random exercise'}
          </button>
        </div>
      </header>

      <section className="surface-panel flex flex-col gap-3 p-3" aria-label={locale === 'zh' ? '练习筛选' : 'Exercise filters'}>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'cpp', 'csharp', 'python'] as const).map((value) => <button key={value} type="button" onClick={() => setLanguage(value)} className={filterClass(language === value)}>{value === 'all' ? (locale === 'zh' ? '全部语言' : 'All languages') : value === 'cpp' ? 'C++' : value === 'csharp' ? 'C#' : 'Python'}</button>)}
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
          {(['all', 'easy', 'medium', 'hard'] as const).map((value) => <button key={value} type="button" onClick={() => setDifficulty(value)} className={filterClass(difficulty === value)}>{value === 'all' ? (locale === 'zh' ? '全部难度' : 'All levels') : t.common.difficulty[value]}</button>)}
          <span className="mx-1 hidden w-px bg-border sm:block" />
          {(['all', 'open', 'completed'] as const).map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={filterClass(status === value)}>{value === 'all' ? (locale === 'zh' ? '全部状态' : 'All status') : value === 'open' ? t.common.notStarted : t.common.completed}</button>)}
        </div>
      </section>

      {filtered.length > 0 ? (
        <div>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleExercises.map((lesson, index) => {
            const done = completedLessons[lesson.id] !== undefined;
            return (
              <Link key={lesson.id} to={`/learn/${lesson.language}/${lesson.id}#exercise`} className="interactive-card surface-panel group flex min-h-40 flex-col p-3 sm:min-h-56 sm:p-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted/60">{String(index + 1).padStart(2, '0')}</span>
                  <Badge tone="neutral">{lesson.language === 'cpp' ? 'C++' : lesson.language === 'csharp' ? 'C#' : 'Python'}</Badge>
                  <DifficultyBadge difficulty={lesson.difficulty} />
                  {done && <IconCheck size={14} className="ml-auto text-emerald-500" />}
                </div>
                <h2 className="mt-3 text-base font-semibold sm:mt-4">{localize(lesson.title)}</h2>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:line-clamp-3">{localize(lesson.exercise.prompt)}</p>
                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-muted">≈ 8–12 min <span className="max-sm:hidden">· {lesson.exercise.hints.length} {locale === 'zh' ? '条提示' : 'hints'}</span></span>
                  <span className="inline-flex items-center font-semibold text-accent">{done ? (locale === 'zh' ? '再次练习' : 'Practice again') : (locale === 'zh' ? '开始作答' : 'Start')}<IconChevronRight size={13} /></span>
                </div>
              </Link>
            );
          })}
        </section>
        {visibleCount < filtered.length && <button type="button" onClick={() => setVisibleCount((count) => count + 9)} className="mx-auto mt-5 flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-accent hover:bg-surface2">{locale === 'zh' ? `再显示 ${Math.min(9, filtered.length - visibleCount)} 题` : `Show ${Math.min(9, filtered.length - visibleCount)} more`}</button>}
        </div>
      ) : (
        <div className="surface-panel grid min-h-56 place-items-center p-8 text-center"><div><IconListCheck size={28} className="mx-auto text-muted" /><p className="mt-3 text-sm font-semibold">{locale === 'zh' ? '没有符合条件的练习' : 'No exercises match these filters'}</p></div></div>
      )}
    </div>
  );
}
