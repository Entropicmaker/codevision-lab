import { Link } from 'react-router-dom';
import { algorithmMetas } from '../content/algorithms/registry';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { IconChart, IconLayers, IconPlay, IconRoute, IconCheck, IconInfo } from '../components/ui/Icons';

const LANGUAGES = [
  { id: 'cpp', name: 'C++', desc: '指针、引用、模板、STL', color: 'text-sky-500' },
  { id: 'csharp', name: 'C#', desc: '委托、事件、LINQ、异步', color: 'text-violet-500' },
  { id: 'python', name: 'Python', desc: '生成器、装饰器、闭包', color: 'text-amber-500' },
] as const;

const FEATURES = [
  { icon: IconLayers, titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: IconPlay, titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: IconChart, titleKey: 'feature3Title', descKey: 'feature3Desc' },
  { icon: IconCheck, titleKey: 'feature4Title', descKey: 'feature4Desc' },
] as const;

export function HomePage() {
  const { t, locale, localize } = useI18n();
  const home = t.home;
  const hotAlgorithms = algorithmMetas.slice(0, 8);

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 sm:px-10 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: 'var(--cv-glow)' }}
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col items-start gap-4">
            <Badge tone="accent">{home.badge}</Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-sky-400 via-accent to-violet-500 bg-clip-text text-transparent">
                {home.heroTitle}
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {home.heroSubtitle}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link to="/algorithms/bubble-sort">
                <Button variant="primary" size="md" icon={<IconPlay size={16} />}>
                  {home.heroCta}
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button variant="secondary" size="md" icon={<IconRoute size={16} />}>
                  {home.heroCta2}
                </Button>
              </Link>
            </div>
          </div>

          {/* 装饰代码卡片 */}
          <div className="rounded-xl border border-border bg-codebg p-4 shadow-lg">
            <div className="mb-2 flex items-center gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-[11px] text-muted">bubble_sort.py</span>
            </div>
            <pre className="overflow-x-auto text-[12.5px] leading-6">
              <code>
                <span className="text-violet-400">def</span>{' '}
                <span className="text-sky-300">bubble_sort</span>
                <span className="text-muted">(a):</span>
                {'\n    '}
                <span className="text-violet-400">for</span>
                {' i '}
                <span className="text-violet-400">in</span>
                <span className="text-sky-300"> range</span>
                <span className="text-muted">(</span>
                <span className="text-sky-300">len</span>
                <span className="text-muted">(a)-</span>
                <span className="text-amber-300">1</span>
                <span className="text-muted">):</span>
                {'\n        '}
                <span className="text-violet-400">for</span>
                {' j '}
                <span className="text-violet-400">in</span>
                <span className="text-sky-300"> range</span>
                <span className="text-muted">(</span>
                <span className="text-sky-300">len</span>
                <span className="text-muted">(a)-</span>
                <span className="text-amber-300">1</span>
                <span className="text-muted">-i):</span>
                {'\n            '}
                <span className="text-violet-400">if</span>
                {' a[j] '}
                <span className="text-muted">&gt;</span>
                {' a[j+'}
                <span className="text-amber-300">1</span>
                <span className="text-muted">]:</span>
                {'\n                '}
                <span className="text-muted">a[j], a[j+</span>
                <span className="text-amber-300">1</span>
                <span className="text-muted">] = a[j+</span>
                <span className="text-amber-300">1</span>
                <span className="text-muted">], a[j]</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* 特性 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.titleKey}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
            >
              <Icon size={20} className="text-accent" />
              <h3 className="text-sm font-semibold">
                {home[f.titleKey as keyof typeof home]}
              </h3>
              <p className="text-xs leading-relaxed text-muted">
                {home[f.descKey as keyof typeof home]}
              </p>
            </div>
          );
        })}
      </section>

      {/* 语言入口 */}
      <section>
        <h2 className="text-lg font-semibold">{home.languagesTitle}</h2>
        <p className="mb-4 text-sm text-muted">{home.languagesDesc}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {LANGUAGES.map((lang) => (
            <Link
              key={lang.id}
              to={`/learn/${lang.id}`}
              className="group flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition hover:border-borderstrong"
            >
              <span className={`text-xl font-bold ${lang.color}`}>{lang.name}</span>
              <span className="text-xs text-muted">{lang.desc}</span>
              <span className="mt-2 text-xs font-medium text-accent opacity-0 transition group-hover:opacity-100">
                {t.common.learn} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 算法入口 */}
      <section>
        <h2 className="text-lg font-semibold">{home.algorithmsTitle}</h2>
        <p className="mb-4 text-sm text-muted">{home.algorithmsDesc}</p>
        <div className="flex flex-wrap gap-2">
          {hotAlgorithms.map((meta) => (
            <Link
              key={meta.id}
              to={`/algorithms/${meta.id}`}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition hover:border-borderstrong hover:text-text"
            >
              {localize(meta.name)}
            </Link>
          ))}
          <Link
            to="/algorithms"
            className="rounded-lg border border-accent/40 bg-accentsoft/50 px-3 py-2 text-sm font-medium text-accent transition hover:bg-accentsoft"
          >
            {locale === 'zh' ? '查看全部 →' : 'View all →'}
          </Link>
        </div>
      </section>

      {/* 路线图 CTA */}
      <section className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-gradient-to-r from-accentsoft/60 to-transparent p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <IconInfo size={18} className="text-accent" />
            {home.roadmapTitle}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">{home.roadmapDesc}</p>
        </div>
        <Link to="/roadmap">
          <Button variant="primary" icon={<IconRoute size={16} />}>
            {locale === 'zh' ? '查看技能树' : 'View skill tree'}
          </Button>
        </Link>
      </section>
    </div>
  );
}
