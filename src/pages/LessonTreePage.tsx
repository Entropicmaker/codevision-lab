import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lessonChapters, lessonLanguages } from '../content/lessons/chapters';
import { getLessonsByLanguage } from '../content/lessons/registry';
import type { CodeLang } from '../engine/types/step';
import { useI18n } from '../hooks/useI18n';
import { useProgress } from '../stores/progressStore';
import { cn } from '../lib/cn';
import { NotFoundPage } from './NotFoundPage';
import { Badge } from '../components/ui/Badge';
import { IconCheck, IconChevronRight, IconPlay } from '../components/ui/Icons';

const LANGS: Array<{ id: CodeLang; name: string; subtitle: { zh: string; en: string } }> = [
  { id: 'cpp', name: 'C++', subtitle: { zh: '性能与内存的掌控', en: 'Performance and memory control' } },
  { id: 'csharp', name: 'C#', subtitle: { zh: '现代 .NET 应用开发', en: 'Modern .NET application development' } },
  { id: 'python', name: 'Python', subtitle: { zh: '简洁与生态', en: 'Clarity and a rich ecosystem' } },
];

const DIFFICULTY_DOT: Record<string, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-red-500',
};

/** 语言课程：书籍目录式排版（左侧目录 + 右侧章节阅读流） */
export function LessonTreePage() {
  const { lang } = useParams();
  const { t, locale, localize } = useI18n();
  const completedLessons = useProgress((s) => s.completedLessons);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const valid = lessonLanguages.includes(lang as CodeLang);
  if (!valid || !lang) {
    return <NotFoundPage />;
  }
  const language = lang as CodeLang;
  const groups = lessonChapters[language];
  const lessons = getLessonsByLanguage(language);
  const lessonsByChapter = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const list = lessonsByChapter.get(lesson.chapterId) ?? [];
    list.push(lesson);
    lessonsByChapter.set(lesson.chapterId, list);
  }

  const current = LANGS.find((l) => l.id === language);
  const completedCount = lessons.filter((lesson) => completedLessons[lesson.id] !== undefined).length;
  const nextLesson = lessons.find((lesson) => completedLessons[lesson.id] === undefined) ?? lessons[0];
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  let chapterNumber = 0;

  const scrollTo = (id: string): void => {
    const owner = groups.find((group) => group.chapters.some((chapter) => chapter.id === id));
    if (owner) setExpandedGroups((state) => ({ ...state, [owner.id]: true }));
    window.requestAnimationFrame(() => {
      document.getElementById(`ch-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 书籍封面区 */}
      <header className="coordinate-frame surface-panel flex flex-col gap-5 overflow-hidden p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          {LANGS.map((l) => (
            <Link
              key={l.id}
              to={`/learn/${l.id}`}
              className={cn(
                'inline-flex min-h-11 items-center rounded-full border px-4 py-2 transition-colors',
                l.id === language
                  ? 'border-accent/60 bg-accentsoft'
                  : 'border-border hover:border-borderstrong',
              )}
            >
              <span
                className={cn(
                  'font-mono text-base font-bold',
                  l.id === language ? 'text-accent' : 'text-muted',
                )}
              >
                {l.name}
              </span>
            </Link>
          ))}
        </div>
        <div>
          <p className="micro-label text-accent">{t.nav.lessons} / archive</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{current?.name}</h1>
          <p className="mt-2 text-sm leading-7 text-muted">{current?.subtitle[locale]} · {t.lessons.subtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>{locale === 'zh' ? '课程进度' : 'Course progress'}</span>
              <span className="font-mono">{completedCount}/{lessons.length} · {progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {nextLesson && (
            <Link to={`/learn/${language}/${nextLesson.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white">
              <IconPlay size={14} />{completedCount > 0 ? (locale === 'zh' ? '继续学习' : 'Continue') : t.common.learn}
            </Link>
          )}
        </div>
      </header>

      <div className="grid items-start gap-8 xl:grid-cols-[244px_minmax(0,1fr)] xl:gap-12">
        {/* 目录（书籍式侧栏） */}
        <nav
          aria-label={t.nav.lessons}
          className="top-24 hidden max-h-[calc(100vh-8rem)] flex-col gap-4 overflow-y-auto border-l border-border pl-4 xl:sticky xl:flex"
        >
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {localize(group.title)}
              </div>
              {group.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => scrollTo(chapter.id)}
                  className="flex min-h-9 items-center gap-2 rounded-xl px-2 py-2 text-left text-xs text-muted transition-colors hover:bg-surface2 hover:text-text"
                >
                  <span className="font-mono text-[10px] text-muted/60">
                    {String(group.chapters.indexOf(chapter) + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-snug">{localize(chapter.title)}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* 移动端目录（折叠） */}
        <details className="surface-panel px-4 py-2 xl:hidden">
          <summary className="cursor-pointer select-none py-1 text-sm font-semibold text-text">
            {locale === 'zh' ? '目录' : 'Contents'}
          </summary>
          <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
            {groups.flatMap((group) =>
              group.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => scrollTo(chapter.id)}
                  className="flex min-h-10 items-center gap-2 rounded-xl px-2 py-2 text-left text-xs text-muted hover:bg-surface2 hover:text-text"
                >
                  <span className="font-mono text-[10px] text-muted/60">
                    {String(group.chapters.indexOf(chapter) + 1).padStart(2, '0')}
                  </span>
                  {localize(chapter.title)}
                </button>
              )),
            )}
          </div>
        </details>

        {/* 章节阅读流（书籍式单列） */}
        <div className="flex min-w-0 flex-col">
          {groups.map((group, gi) => (
            <section key={group.id} className="mb-8">
              {/* Part 标题（最大层级） */}
              <div className="mb-5 flex flex-wrap items-baseline gap-3 border-b-2 border-border pb-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  PART {gi + 1}
                </span>
                <h2 className="text-2xl font-semibold tracking-tight">{localize(group.title)}</h2>
                <span className="ml-auto text-xs text-muted/70">
                  {group.chapters.length} {locale === 'zh' ? '章' : 'chapters'}
                </span>
                {group.id.includes('advanced') && (
                  <button
                    type="button"
                    onClick={() => setExpandedGroups((state) => ({ ...state, [group.id]: !state[group.id] }))}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-text"
                    aria-expanded={expandedGroups[group.id] === true}
                  >
                    {expandedGroups[group.id] === true
                      ? (locale === 'zh' ? '收起' : 'Collapse')
                      : (locale === 'zh' ? '展开进阶章节' : 'Expand advanced chapters')}
                  </button>
                )}
              </div>

              {(!group.id.includes('advanced') || expandedGroups[group.id] === true) && <div className="flex flex-col">
                {group.chapters.map((chapter) => {
                  chapterNumber += 1;
                  const chapterLessons = lessonsByChapter.get(chapter.id) ?? [];
                  return (
                    <article
                      key={chapter.id}
                      id={`ch-${chapter.id}`}
                      className="scroll-mt-24 border-b border-border/60 py-6 last:border-b-0"
                    >
                      {/* 章：大编号 + 大标题（层级高于小节） */}
                      <div className="flex items-baseline gap-4">
                        <span className="shrink-0 font-mono text-2xl font-bold leading-none text-accent">
                          {String(chapterNumber).padStart(2, '0')}
                        </span>
                        <h3 className="text-xl font-semibold leading-snug tracking-tight">
                          {localize(chapter.title)}
                        </h3>
                      </div>

                      {/* 已上线的知识点（可学习链接，小节层级） */}
                      {chapterLessons.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1 sm:pl-10">
                          {chapterLessons.map((lesson, li) => (
                            <Link
                              key={lesson.id}
                              to={`/learn/${language}/${lesson.id}`}
                              className="group flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-surface2 sm:gap-3"
                            >
                              <span className="w-8 shrink-0 text-right font-mono text-[11px] text-muted/70">
                                {chapterNumber}.{li + 1}
                              </span>
                              <span
                                className={cn(
                                  'h-1.5 w-1.5 shrink-0 self-center rounded-full',
                                  DIFFICULTY_DOT[lesson.difficulty],
                                )}
                                aria-hidden
                              />
                              <span className="text-sm font-medium text-accent group-hover:underline">
                                {localize(lesson.title)}
                              </span>
                              <span className="ml-auto flex items-center gap-2">
                                <span className="hidden text-[10px] text-muted sm:inline">≈ 8 min</span>
                                {completedLessons[lesson.id] !== undefined && <Badge tone="done"><IconCheck size={11} />{t.common.completed}</Badge>}
                              </span>
                              <IconChevronRight
                                size={14}
                                className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                              />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 章节主题一览 */}
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 sm:pl-12">
                        {locale === 'zh' && chapter.topics.map((topic) => (
                          <span key={topic} className="text-[11px] text-muted/80">{topic}</span>
                        ))}
                        {chapterLessons.length === 0 && (
                          <span className="text-[11px] italic text-muted/50">
                            {locale === 'zh' ? '· 内容整理中' : '· in progress'}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>}
            </section>
          ))}

          <p className="mt-2 text-[11px] text-muted/60">{t.lessons.comingNote}</p>
        </div>
      </div>
    </div>
  );
}
