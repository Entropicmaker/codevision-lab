import { Link, useParams } from 'react-router-dom';
import { getLessonMeta } from '../content/lessons/registry';
import { lessonChapters } from '../content/lessons/chapters';
import { useSettings } from '../stores/settingsStore';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import { NotFoundPage } from './NotFoundPage';
import { CodeEditor } from '../components/editor/CodeEditor';
import { LanguageSwitcher } from '../components/editor/LanguageSwitcher';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Panel } from '../components/ui/Panel';
import { IconCheck, IconChevronRight } from '../components/ui/Icons';

/** 统一教学页：概念 / 三语言示例 / 对比 / 常见错误 / 练习 */
export function LessonDetailPage() {
  const { lessonId } = useParams();
  const { t, locale, localize } = useI18n();
  const codeLang = useSettings((s) => s.codeLang);
  const setCodeLang = useSettings((s) => s.setCodeLang);
  const theme = useSettings((s) => s.theme);
  const fontSize = useSettings((s) => s.fontSize);
  const completedLessons = useProgress((s) => s.completedLessons);
  const markLessonComplete = useProgress((s) => s.markLessonComplete);

  const lesson = lessonId ? getLessonMeta(lessonId) : undefined;
  if (!lesson) {
    return <NotFoundPage />;
  }

  const chapter = lessonChapters[lesson.language]
    .flatMap((g) => g.chapters)
    .find((c) => c.id === lesson.chapterId);
  const isDone = completedLessons[lesson.id] !== undefined;
  const example = lesson.codeExamples[codeLang];

  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-muted">
          <Link to={`/learn/${lesson.language}`} className="hover:text-text">
            {t.nav.lessons} · {lesson.language === 'cpp' ? 'C++' : lesson.language === 'csharp' ? 'C#' : 'Python'}
          </Link>
          <IconChevronRight size={12} />
          {chapter && <span className="text-text">{localize(chapter.title)}</span>}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">{localize(lesson.title)}</h1>
          <DifficultyBadge difficulty={lesson.difficulty} />
          {isDone && (
            <Badge tone="done">
              <IconCheck size={11} />
              {t.common.completed}
            </Badge>
          )}
        </div>
      </header>

      {/* 概念说明 */}
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {locale === 'zh' ? '概念说明' : 'Concept'}
        </h2>
        <div className="flex flex-col gap-2">
          {lesson.concept.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-text">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* 代码示例 */}
      <section className="flex min-h-72 flex-col rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <LanguageSwitcher value={codeLang} onChange={setCodeLang} withDemoNote={false} />
        </div>
        <div className="relative min-h-64 flex-1">
          <CodeEditor
            source={example.source}
            language={codeLang}
            highlightLine={null}
            theme={theme}
            fontSize={fontSize}
            className="absolute inset-0"
          />
        </div>
      </section>

      {/* 三语言对比 */}
      {lesson.comparison.length > 0 && (
        <section className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <h2 className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {locale === 'zh' ? '三语言写法对比' : 'Cross-language comparison'}
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-3 py-2 font-medium">{locale === 'zh' ? '要点' : 'Aspect'}</th>
                <th className="px-3 py-2 font-mono font-medium">C++</th>
                <th className="px-3 py-2 font-mono font-medium">C#</th>
                <th className="px-3 py-2 font-mono font-medium">Python</th>
              </tr>
            </thead>
            <tbody>
              {lesson.comparison.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-muted">{localize(row.aspect)}</td>
                  {(['cpp', 'csharp', 'python'] as const).map((lang) => (
                    <td key={lang} className="px-3 py-2 font-mono text-text">
                      {row.rows[lang]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 常见错误 */}
      {lesson.commonMistakes.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {t.panels.mistakes}
          </h2>
          <div className="flex flex-col gap-2">
            {lesson.commonMistakes.map((mistake, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="text-sm font-medium text-danger">{localize(mistake.title)}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{localize(mistake.detail)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 练习 */}
      <Panel title={locale === 'zh' ? '小练习' : 'Exercise'} defaultOpen={false}>
        <p className="text-sm text-text">{localize(lesson.exercise.prompt)}</p>
        {lesson.exercise.hints.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {lesson.exercise.hints.map((hint, i) => (
              <li key={i} className="text-xs text-muted">
                💡 {hint}
              </li>
            ))}
          </ul>
        )}
        <details className="mt-3 rounded-lg border border-border">
          <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-accent">
            {locale === 'zh' ? '查看参考答案' : 'Show answer'}
          </summary>
          <pre className="overflow-x-auto border-t border-border bg-codebg p-3 font-mono text-xs leading-5 text-text">
            {lesson.exercise.answer}
          </pre>
        </details>
      </Panel>

      <div className="flex justify-end">
        <Button
          variant={isDone ? 'secondary' : 'primary'}
          icon={isDone ? <IconCheck size={15} /> : undefined}
          onClick={() => markLessonComplete(lesson.id)}
          disabled={isDone}
        >
          {isDone ? t.common.completed : locale === 'zh' ? '标记为已学完' : 'Mark as completed'}
        </Button>
      </div>
    </div>
  );
}
