import { Link } from 'react-router-dom';
import { lessonMetas } from '../content/lessons/registry';
import { useI18n } from '../hooks/useI18n';
import { BookPage, BookSection, BookEntry } from '../components/layout/BookPage';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { IconChevronRight, IconListCheck } from '../components/ui/Icons';

/** 练习题：书籍目录式排版（按语言分章聚合课程练习） */
export function ExercisesPage() {
  const { t, locale, localize } = useI18n();

  const byLanguage = new Map<string, typeof lessonMetas>();
  for (const lesson of lessonMetas) {
    const list = byLanguage.get(lesson.language) ?? [];
    list.push(lesson);
    byLanguage.set(lesson.language, list);
  }

  const languageName = (lang: string): string =>
    lang === 'cpp' ? 'C++' : lang === 'csharp' ? 'C#' : 'Python';

  const toc = Array.from(byLanguage.entries()).map(([lang, list]) => ({
    id: lang,
    label: languageName(lang),
    count: list.length,
  }));

  return (
    <BookPage
      kicker={t.nav.exercises}
      title={t.exercises.title}
      subtitle={t.exercises.subtitle}
      toc={toc}
    >
      {lessonMetas.length === 0 ? (
        <EmptyState
          icon={<IconListCheck size={30} />}
          title={t.exercises.empty}
          action={
            <Link to="/algorithms">
              <Button variant="primary">{t.nav.algorithms}</Button>
            </Link>
          }
        />
      ) : (
        Array.from(byLanguage.entries()).map(([lang, list], li) => (
          <BookSection
            key={lang}
            id={lang}
            index={li + 1}
            title={languageName(lang)}
            right={`${list.length} ${locale === 'zh' ? '题' : 'exercises'}`}
          >
            {list.map((lesson, idx) => {
              return (
                <BookEntry
                  key={lesson.id}
                  number={`${li + 1}.${idx + 1}`}
                  title={
                    <Link
                      to={`/learn/${lesson.language}/${lesson.id}`}
                      className="group inline-flex items-center gap-2 hover:underline"
                    >
                      <span>{localize(lesson.title)}</span>
                      <IconChevronRight
                        size={14}
                        className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  }
                  description={
                    <>
                      {localize(lesson.exercise.prompt)}
                      <span className="ml-2 text-accent">
                        {locale === 'zh' ? '含参考答案 →' : 'with answer →'}
                      </span>
                    </>
                  }
                />
              );
            })}
          </BookSection>
        ))
      )}
    </BookPage>
  );
}
