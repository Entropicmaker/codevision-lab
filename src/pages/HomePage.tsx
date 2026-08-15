import { Link } from 'react-router-dom';
import { algorithmMetas } from '../content/algorithms/registry';
import { useI18n } from '../hooks/useI18n';
import { Badge } from '../components/ui/Badge';
import {
  IconChart,
  IconCheck,
  IconLayers,
  IconPlay,
  IconRoute,
} from '../components/ui/Icons';

const LANGUAGES = [
  { id: 'cpp', name: 'C++', desc: '指针、引用、模板、STL', code: '01', color: 'text-sky-500' },
  { id: 'csharp', name: 'C#', desc: '委托、事件、LINQ、异步', code: '02', color: 'text-violet-500' },
  { id: 'python', name: 'Python', desc: '生成器、装饰器、闭包', code: '03', color: 'text-amber-500' },
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
    <div className="flex flex-col gap-12 sm:gap-16">
      <section className="coordinate-frame surface-panel retro-grid relative overflow-hidden px-5 py-6 sm:px-8 sm:py-9 lg:px-12 lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <span className="micro-label text-accent">Knowledge coordinates / 01</span>
          <span className="flex items-center gap-2 font-mono text-[10px] text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            LEARNING SYSTEM ONLINE
          </span>
        </div>

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-12">
          <div className="flex flex-col items-start">
            <Badge tone="accent" className="mb-5">{home.badge}</Badge>
            <h1 className="font-editorial max-w-3xl text-[clamp(2.55rem,7vw,5.8rem)] font-semibold leading-[1.04] tracking-[-0.055em] text-text">
              {home.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
              {home.heroSubtitle}
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/algorithms/bubble-sort"
                className="glow-accent inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <IconPlay size={16} />
                {home.heroCta}
              </Link>
              <Link
                to="/roadmap"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface/75 px-5 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-borderstrong hover:bg-surface2"
              >
                <IconRoute size={16} />
                {home.heroCta2}
              </Link>
            </div>
          </div>

          <div className="terminal-window min-w-0 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-1.5 border-b border-border/70 pb-3" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/75" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/75" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/75" />
              <span className="ml-2 font-mono text-[10px] tracking-wide text-muted">bubble_sort.py · LIVE</span>
              <span className="ml-auto font-mono text-[9px] text-accent">STEP 04/08</span>
            </div>
            <pre className="relative z-10 overflow-x-auto text-[11px] leading-6 sm:text-[12.5px]">
              <code>
                <span className="text-violet-400">def</span>{' '}
                <span className="text-sky-400 dark:text-sky-300">bubble_sort</span>
                <span className="text-muted">(a):</span>
                {'\n    '}
                <span className="text-violet-400">for</span>
                {' i '}
                <span className="text-violet-400">in</span>
                <span className="text-sky-400 dark:text-sky-300"> range</span>
                <span className="text-muted">(len(a)-1):</span>
                {'\n        '}
                <span className="text-violet-400">for</span>
                {' j '}
                <span className="text-violet-400">in</span>
                <span className="text-sky-400 dark:text-sky-300"> range</span>
                <span className="text-muted">(len(a)-1-i):</span>
                {'\n            '}
                <span className="text-violet-400">if</span>
                {' a[j] '}
                <span className="text-muted">&gt;</span>
                {' a[j+1]:'}
                {'\n                '}
                <span className="rounded bg-accentsoft px-1 text-accent">a[j], a[j+1] = a[j+1], a[j]</span>
              </code>
            </pre>
            <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
              {[
                ['INPUT', '[7, 3, 5, 1]'],
                ['STATE', 'COMPARING'],
                ['OUTPUT', '[1, 3, 5, 7]'],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-xl bg-surface2/65 px-2.5 py-2">
                  <div className="font-mono text-[9px] tracking-widest text-muted">{label}</div>
                  <div className="mt-1 truncate font-mono text-[10px] text-text sm:text-[11px]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-label={locale === 'zh' ? '平台数据' : 'Platform facts'} className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border sm:grid-cols-4 sm:divide-y-0">
        {[
          [String(algorithmMetas.length).padStart(2, '0'), locale === 'zh' ? '交互算法' : 'Algorithms'],
          ['03', locale === 'zh' ? '编程语言' : 'Languages'],
          ['∞', locale === 'zh' ? '可回放步骤' : 'Replayable steps'],
          ['LOCAL', locale === 'zh' ? '进度只属于你' : 'Private progress'],
        ].map(([value, label]) => (
          <div key={label} className="px-4 py-5 text-center sm:py-6">
            <div className="font-editorial text-2xl font-semibold text-text sm:text-3xl">{value}</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">{label}</div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="micro-label text-botanical">Learning instruments</p>
            <h2 className="font-editorial mt-2 text-3xl font-semibold sm:text-4xl">
              {locale === 'zh' ? '把抽象过程变成可见现场' : 'Turn abstraction into a visible process'}
            </h2>
          </div>
          <span className="font-mono text-[10px] text-muted">OBSERVE · REPLAY · UNDERSTAND</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article key={feature.titleKey} className="interactive-card surface-panel flex min-h-48 flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface2/70 text-accent">
                    <Icon size={18} />
                  </span>
                  <span className="font-mono text-[10px] text-muted/60">0{index + 1}</span>
                </div>
                <h3 className="mt-auto pt-8 text-base font-semibold">
                  {home[feature.titleKey as keyof typeof home]}
                </h3>
                <p className="mt-2 text-xs leading-6 text-muted">
                  {home[feature.descKey as keyof typeof home]}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="micro-label text-sand">Language archives / 03</p>
          <h2 className="font-editorial mt-2 text-3xl font-semibold sm:text-4xl">{home.languagesTitle}</h2>
          <p className="mt-2 text-sm text-muted">{home.languagesDesc}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {LANGUAGES.map((lang) => (
            <Link
              key={lang.id}
              to={`/learn/${lang.id}`}
              className="interactive-card surface-panel group flex min-h-52 flex-col p-5"
            >
              <div className="flex items-start justify-between">
                <span className={`font-editorial text-4xl font-semibold ${lang.color}`}>{lang.name}</span>
                <span className="font-mono text-xs text-muted/50">{lang.code}</span>
              </div>
              <span className="mt-auto text-sm text-muted">{lang.desc}</span>
              <span className="mt-5 flex items-center justify-between border-t border-border/70 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                {t.common.learn}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <div className="surface-panel p-5 sm:p-7">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="micro-label text-accent">Algorithm index</p>
              <h2 className="font-editorial mt-2 text-2xl font-semibold sm:text-3xl">{home.algorithmsTitle}</h2>
            </div>
            <Link to="/algorithms" className="shrink-0 text-xs font-semibold text-accent hover:underline">
              {locale === 'zh' ? '查看全部 →' : 'View all →'}
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {hotAlgorithms.map((meta, index) => (
              <Link
                key={meta.id}
                to={`/algorithms/${meta.id}`}
                className="group flex min-h-14 items-center gap-3 bg-surface px-4 text-sm transition hover:bg-surface2"
              >
                <span className="font-mono text-[10px] text-muted/55">{String(index + 1).padStart(2, '0')}</span>
                <span className="font-medium text-text">{localize(meta.name)}</span>
                <span className="ml-auto text-accent opacity-0 transition group-hover:opacity-100">↗</span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="coordinate-frame flex flex-col overflow-hidden rounded-[20px] border border-accent/25 bg-accentsoft/65 p-6 sm:p-7">
          <span className="micro-label text-accent">Next coordinate</span>
          <h2 className="font-editorial mt-4 text-3xl font-semibold">{home.roadmapTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{home.roadmapDesc}</p>
          <Link
            to="/roadmap"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-text px-5 text-sm font-semibold text-bg transition hover:-translate-y-0.5"
          >
            <IconRoute size={16} />
            {locale === 'zh' ? '打开技能树' : 'Open skill tree'}
          </Link>
          <span className="mt-auto pt-8 font-mono text-[9px] tracking-[0.14em] text-muted">ROUTE / SELF-PACED</span>
        </aside>
      </section>
    </div>
  );
}
