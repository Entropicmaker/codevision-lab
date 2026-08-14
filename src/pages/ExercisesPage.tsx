import { Link } from 'react-router-dom';
import { lessonMetas } from '../content/lessons/registry';
import { useI18n } from '../hooks/useI18n';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { IconListCheck } from '../components/ui/Icons';

/** 练习题：聚合课程知识点的小练习 */
export function ExercisesPage() {
  const { t } = useI18n();
  const exercises = lessonMetas.flatMap((lesson) => [
    { lessonId: lesson.id, title: lesson.title, prompt: lesson.exercise.prompt },
  ]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold">{t.exercises.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.exercises.subtitle}</p>
      </header>

      {exercises.length === 0 ? (
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
        <div className="grid gap-2 sm:grid-cols-2">
          {exercises.map((exercise) => (
            <Link
              key={exercise.lessonId}
              to={`/learn/${exercise.lessonId}`}
              className="rounded-xl border border-border bg-surface p-4 transition hover:border-borderstrong"
            >
              <h2 className="text-sm font-semibold text-text">{exercise.title.zh}</h2>
              <p className="mt-1 text-xs text-muted">{exercise.prompt.zh}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
