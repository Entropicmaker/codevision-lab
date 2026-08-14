import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useSettings } from '../stores/settingsStore';
import { dicts } from '../i18n';

// 重量级页面（含 Monaco / 大量渲染器）按路由懒加载
const AlgorithmPlaygroundPage = lazy(() =>
  import('../pages/AlgorithmPlaygroundPage').then((m) => ({ default: m.AlgorithmPlaygroundPage })),
);
const AlgorithmsPage = lazy(() =>
  import('../pages/AlgorithmsPage').then((m) => ({ default: m.AlgorithmsPage })),
);
const RoadmapPage = lazy(() =>
  import('../pages/RoadmapPage').then((m) => ({ default: m.RoadmapPage })),
);
const LessonTreePage = lazy(() =>
  import('../pages/LessonTreePage').then((m) => ({ default: m.LessonTreePage })),
);
const LessonDetailPage = lazy(() =>
  import('../pages/LessonDetailPage').then((m) => ({ default: m.LessonDetailPage })),
);
const LabPage = lazy(() => import('../pages/LabPage').then((m) => ({ default: m.LabPage })));
const ExercisesPage = lazy(() =>
  import('../pages/ExercisesPage').then((m) => ({ default: m.ExercisesPage })),
);
const ProgressPage = lazy(() =>
  import('../pages/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);
const StructuresPage = lazy(() =>
  import('../pages/StructuresPage').then((m) => ({ default: m.StructuresPage })),
);

function PageLoader(): ReactNode {
  const uiLang = useSettings((s) => s.uiLang);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
      {dicts[uiLang].common.loading}
    </div>
  );
}

export function AppRoutes(): ReactNode {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="algorithms" element={<AlgorithmsPage />} />
          <Route path="algorithms/:algorithmId" element={<AlgorithmPlaygroundPage />} />
          <Route path="structures" element={<StructuresPage />} />
          <Route path="learn/:lang" element={<LessonTreePage />} />
          <Route path="learn/:lang/:lessonId" element={<LessonDetailPage />} />
          <Route path="lab" element={<LabPage />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
