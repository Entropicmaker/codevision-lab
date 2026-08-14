import { Link, useParams } from 'react-router-dom';
import { lessonChapters, lessonLanguages } from '../content/lessons/chapters';
import { getLessonsByLanguage } from '../content/lessons/registry';
import type { CodeLang } from '../engine/types/step';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/cn';
import { NotFoundPage } from './NotFoundPage';
import { Badge } from '../components/ui/Badge';

const LANGS: Array<{ id: CodeLang; name: string }> = [
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'python', name: 'Python' },
];

/** 语言课程树：章节与知识点导航 */
export function LessonTreePage() {
  const { lang } = useParams();
  const { t, localize } = useI18n();

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

  return (
    <div className="flex flex-col gap-4">
      <header>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {LANGS.map((l) => (
            <Link
              key={l.id}
              to={`/learn/${l.id}`}
              className={cn(
                'rounded-lg border px-4 py-1.5 font-mono text-sm font-semibold transition-colors',
                l.id === language
                  ? 'border-accent/60 bg-accentsoft text-accent'
                  : 'border-border text-muted hover:text-text',
              )}
            >
              {l.name}
            </Link>
          ))}
        </div>
        <h1 className="text-2xl font-bold">
          {t.nav.lessons} · {LANGS.find((l) => l.id === language)?.name}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.lessons.subtitle}</p>
      </header>

      <p className="rounded-lg border border-border bg-surface2/60 px-3 py-2 text-xs text-muted">
        {t.lessons.comingNote}
      </p>

      {groups.map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {localize(group.title)}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {group.chapters.map((chapter) => {
              const chapterLessons = lessonsByChapter.get(chapter.id) ?? [];
              const hasLessons = chapterLessons.length > 0;
              return (
                <div
                  key={chapter.id}
                  className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-text">{localize(chapter.title)}</h3>
                    {hasLessons ? (
                      <Badge tone="done">{chapterLessons.length}</Badge>
                    ) : (
                      <Badge tone="neutral">{t.common.notStarted}</Badge>
                    )}
                  </div>
                  {hasLessons && (
                    <div className="flex flex-col gap-1">
                      {chapterLessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          to={`/learn/${language}/${lesson.id}`}
                          className="rounded-md bg-accentsoft/60 px-2 py-1.5 text-xs font-medium text-accent transition hover:bg-accentsoft"
                        >
                          {localize(lesson.title)} · {lesson.minutes} min
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {chapter.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-md bg-surface2 px-1.5 py-0.5 text-[11px] text-muted"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
