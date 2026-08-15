import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLessonMeta, lessonMetas } from '../content/lessons/registry';
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
import { IconCheck, IconChevronRight, IconCopy, IconPlay } from '../components/ui/Icons';

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
  const [copied, setCopied] = useState(false);

  const lesson = lessonId ? getLessonMeta(lessonId) : undefined;
  if (!lesson) {
    return <NotFoundPage />;
  }

  const chapter = lessonChapters[lesson.language]
    .flatMap((g) => g.chapters)
    .find((c) => c.id === lesson.chapterId);
  const isDone = completedLessons[lesson.id] !== undefined;
  const example = lesson.codeExamples[codeLang];
  const stripUntranslatedComments = (source: string): string => source
    .replace(/\s*\/\/[^\n]*[\u3400-\u9fff][^\n]*/g, '')
    .replace(/^\s*#[^\n]*[\u3400-\u9fff][^\n]*$/gm, '');
  const visibleSource = locale === 'en' ? stripUntranslatedComments(example.source) : example.source;
  const visibleAnswer = locale === 'en' ? stripUntranslatedComments(lesson.exercise.answer) : lesson.exercise.answer;
  const languageLessons = lessonMetas.filter((item) => item.language === lesson.language);
  const lessonIndex = languageLessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = languageLessons[lessonIndex - 1];
  const nextLesson = languageLessons[lessonIndex + 1];

  const copyCode = async (): Promise<void> => {
    await navigator.clipboard.writeText(visibleSource);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="coordinate-frame surface-panel flex flex-col gap-3 p-4 sm:p-6">
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-muted">
          <Link to={`/learn/${lesson.language}`} className="hover:text-text">
            {t.nav.lessons} · {lesson.language === 'cpp' ? 'C++' : lesson.language === 'csharp' ? 'C#' : 'Python'}
          </Link>
          <IconChevronRight size={12} />
          {chapter && <span className="text-text">{localize(chapter.title)}</span>}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-editorial text-2xl font-semibold sm:text-3xl">{localize(lesson.title)}</h1>
          <DifficultyBadge difficulty={lesson.difficulty} />
          {isDone && (
            <Badge tone="done">
              <IconCheck size={11} />
              {t.common.completed}
            </Badge>
          )}
        </div>
      </header>

      <nav className="sticky top-[76px] z-30 flex gap-1 overflow-x-auto rounded-full border border-border bg-surface/90 p-1 text-xs shadow-sm backdrop-blur" aria-label={locale === 'zh' ? '本课目录' : 'Lesson contents'}>
        {[
          ['overview', locale === 'zh' ? '目标' : 'Goals'],
          ['concept', locale === 'zh' ? '概念' : 'Concept'],
          ['code', locale === 'zh' ? '代码' : 'Code'],
          ['exercise', locale === 'zh' ? '练习' : 'Exercise'],
        ].map(([id, label]) => <a key={id} href={`#${id}`} className="min-w-fit rounded-full px-3 py-2 text-muted hover:bg-surface2 hover:text-text">{label}</a>)}
      </nav>

      <section id="overview" className="surface-panel scroll-mt-32 p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <p className="micro-label text-accent">Learning objectives / ≈ 10 min</p>
            <h2 className="mt-2 text-lg font-semibold">{locale === 'zh' ? '完成本课后，你将能够' : 'By the end of this lesson, you can'}</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted sm:grid-cols-3">
              {(locale === 'zh'
                ? lesson.concept.slice(0, 3)
                : [
                    `Explain the role of ${localize(lesson.title)}.`,
                    'Recognize the essential syntax and execution flow.',
                    'Apply the idea in a small coding exercise.',
                  ]).map((point, index) => (
                <li key={index} className="rounded-xl bg-surface2/55 p-3"><span className="mr-1 text-accent">0{index + 1}</span>{point}</li>
              ))}
            </ul>
          </div>
          <Button
            variant={isDone ? 'secondary' : 'primary'}
            icon={isDone ? <IconCheck size={15} /> : undefined}
            onClick={() => markLessonComplete(lesson.id)}
            disabled={isDone}
          >
            {isDone ? t.common.completed : locale === 'zh' ? '标记为已学完' : 'Mark as completed'}
          </Button>
        </div>
      </section>

      {/* 概念说明 */}
      <section id="concept" className="surface-panel scroll-mt-32 p-4 sm:p-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {locale === 'zh' ? '概念说明' : 'Concept'}
        </h2>
        {locale === 'zh' ? <div className="flex max-w-3xl flex-col gap-3">
          {lesson.concept.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-text">
              {paragraph}
            </p>
          ))}
        </div> : (
          <div className="rounded-xl border border-border bg-surface2/55 p-4 text-sm leading-relaxed text-muted">
            The interface is available in English. Full English lesson prose is being reviewed; switch the UI to Chinese for the complete current lesson text.
          </div>
        )}
      </section>

      {/* 代码示例 */}
      <section id="code" className="surface-panel flex min-h-[380px] scroll-mt-32 flex-col overflow-hidden sm:min-h-[460px]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <LanguageSwitcher value={codeLang} onChange={setCodeLang} withDemoNote={false} />
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />} onClick={() => void copyCode()}>
              {copied ? t.common.copied : t.common.copy}
            </Button>
            <Link to="/lab" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-accent hover:bg-surface2">
              <IconPlay size={13} />{locale === 'zh' ? '打开实验室' : 'Open playground'}
            </Link>
          </div>
        </div>
        <div className="relative min-h-64 flex-1">
          <CodeEditor
            source={visibleSource}
            language={codeLang}
            highlightLine={null}
            theme={theme}
            fontSize={fontSize}
            className="absolute inset-0"
          />
        </div>
      </section>

      {/* 三语言对比 */}
      {locale === 'zh' && lesson.comparison.length > 0 && (
        <section className="surface-panel overflow-x-auto">
          <h2 className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {locale === 'zh' ? '三语言写法对比' : 'Cross-language comparison'}
          </h2>
          <table className="w-full min-w-[680px] text-xs">
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
        <section className="surface-panel p-3 sm:p-4">
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
      <div id="exercise" className="scroll-mt-32">
      <Panel title={locale === 'zh' ? '小练习' : 'Exercise'} defaultOpen={false}>
        <p className="text-sm text-text">{localize(lesson.exercise.prompt)}</p>
        {locale === 'zh' && lesson.exercise.hints.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {lesson.exercise.hints.map((hint, i) => (
              <details key={i} className="rounded-lg border border-border px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-accent">提示 {i + 1}</summary>
                <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
              </details>
            ))}
          </div>
        )}
        <details className="mt-3 rounded-lg border border-border">
          <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-accent">
            {locale === 'zh' ? '查看参考答案' : 'Show answer'}
          </summary>
          <pre className="overflow-x-auto border-t border-border bg-codebg p-3 font-mono text-xs leading-5 text-text">
            {visibleAnswer}
          </pre>
        </details>
      </Panel>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {previousLesson ? (
          <Link to={`/learn/${lesson.language}/${previousLesson.id}`} className="surface-panel p-4 text-sm text-muted hover:text-text">← {localize(previousLesson.title)}</Link>
        ) : <span />}
        {nextLesson && (
          <Link to={`/learn/${lesson.language}/${nextLesson.id}`} className="surface-panel p-4 text-right text-sm font-semibold text-accent">{localize(nextLesson.title)} →</Link>
        )}
      </div>
    </div>
  );
}
