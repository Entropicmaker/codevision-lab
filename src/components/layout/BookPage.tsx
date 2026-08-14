import type { ReactNode } from 'react';
import { useI18n } from '../../hooks/useI18n';

export interface BookTocEntry {
  id: string;
  label: string;
  count?: number;
}

/**
 * 书籍式页面布局（与语言教程页一致的设计语言）：
 * - 封面区：小写标签（kicker）+ 大标题 + 副标语
 * - 左侧 sticky 目录（点击平滑滚动到对应章节），移动端折叠为下拉
 * - 右侧单列纵向阅读流（children）
 */
export function BookPage({
  kicker,
  title,
  subtitle,
  toc,
  toolbar,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  toc: BookTocEntry[];
  /** 目录上方/下方的附加工具栏（搜索、筛选等） */
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const { locale } = useI18n();

  const scrollTo = (id: string): void => {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 封面区 */}
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{kicker}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {toolbar && <div className="min-w-0">{toolbar}</div>}
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[264px_minmax(0,1fr)]">
        {/* 目录（书籍式侧栏） */}
        <nav
          aria-label={kicker}
          className="top-20 hidden max-h-[calc(100vh-7rem)] flex-col gap-4 overflow-y-auto border-l-2 border-border pl-4 lg:sticky lg:flex"
        >
          {toolbar && <div className="min-w-0 lg:hidden">{toolbar}</div>}
          <div className="flex flex-col gap-1">
            {toc.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => scrollTo(entry.id)}
                className="flex items-baseline gap-2 rounded-md px-1.5 py-1 text-left text-xs text-muted transition-colors hover:bg-surface2 hover:text-text"
              >
                <span className="leading-snug">{entry.label}</span>
                {entry.count !== undefined && (
                  <span className="ml-auto font-mono text-[10px] text-muted/60">{entry.count}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* 移动端目录（折叠） */}
        <details className="rounded-2xl border border-border bg-surface px-3 py-2 lg:hidden">
          <summary className="cursor-pointer select-none text-sm font-medium text-text">
            {locale === 'zh' ? '目录' : 'Contents'}
          </summary>
          <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
            {toc.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => scrollTo(entry.id)}
                className="flex items-baseline gap-2 rounded-md px-1.5 py-1 text-left text-xs text-muted hover:bg-surface2 hover:text-text"
              >
                {entry.label}
                {entry.count !== undefined && (
                  <span className="ml-auto font-mono text-[10px] text-muted/60">{entry.count}</span>
                )}
              </button>
            ))}
          </div>
        </details>

        {/* 阅读流 */}
        <div className="flex min-w-0 flex-col">{children}</div>
      </div>
    </div>
  );
}

/** 阅读流中的章节区块：编号 + 标题 + 条目列表 */
export function BookSection({
  id,
  index,
  title,
  right,
  children,
}: {
  id: string;
  index: number;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={`sec-${id}`} className="mb-8 scroll-mt-20">
      <div className="mb-3 flex items-baseline gap-3 border-b border-border pb-2">
        <span className="font-mono text-xs text-accent">{String(index).padStart(2, '0')}</span>
        <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
        {right && <span className="ml-auto text-[11px] text-muted/70">{right}</span>}
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

/** 阅读流中的条目行（书籍式纵向列表项） */
export function BookEntry({
  number,
  title,
  meta,
  description,
  action,
  accentDot,
}: {
  number?: string;
  title: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  accentDot?: string;
}) {
  return (
    <article className="flex flex-col gap-2 border-b border-border/60 py-5 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-3">
        {number && <span className="shrink-0 font-mono text-sm text-accent">{number}</span>}
        {accentDot && (
          <span
            className="h-2 w-2 shrink-0 self-center rounded-full"
            style={{ backgroundColor: accentDot }}
            aria-hidden
          />
        )}
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
        {meta && <span className="flex flex-wrap items-center gap-1.5">{meta}</span>}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {description && <div className="pl-7 text-xs leading-relaxed text-muted">{description}</div>}
    </article>
  );
}
