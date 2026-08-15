import type { ReactNode } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../lib/cn';

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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 封面区 */}
      <header className="coordinate-frame surface-panel flex flex-col gap-4 overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="micro-label text-accent">{kicker} / index</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            {subtitle && <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{subtitle}</p>}
          </div>
          {toolbar && <div className="min-w-0">{toolbar}</div>}
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[224px_minmax(0,1fr)] xl:gap-9">
        {/* 目录（书籍式侧栏） */}
        <nav
          aria-label={kicker}
          className="top-24 hidden max-h-[calc(100vh-8rem)] flex-col gap-4 overflow-y-auto border-l border-border pl-4 xl:sticky xl:flex"
        >
          <span className="micro-label text-muted">Contents / {String(toc.length).padStart(2, '0')}</span>
          <div className="flex flex-col gap-1">
            {toc.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => scrollTo(entry.id)}
                className="flex min-h-9 items-baseline gap-2 rounded-xl px-2 py-2 text-left text-xs text-muted transition-colors hover:bg-surface2 hover:text-text"
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
        <details className="surface-panel px-4 py-2 xl:hidden">
          <summary className="cursor-pointer select-none py-1 text-sm font-semibold text-text">
            {locale === 'zh' ? '目录' : 'Contents'}
          </summary>
          <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
            {toc.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => scrollTo(entry.id)}
                className="flex min-h-10 items-center gap-2 rounded-xl px-2 py-2 text-left text-xs text-muted hover:bg-surface2 hover:text-text"
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
    <section id={`sec-${id}`} className="mb-8 scroll-mt-24 sm:mb-10">
      {/* 章头：大号编号 + 大标题，层级一目了然 */}
      <div className="mb-3 flex flex-wrap items-baseline gap-3 border-b border-border pb-3 sm:mb-4 sm:gap-4">
        <span className="shrink-0 font-mono text-xl font-bold leading-none text-accent sm:text-2xl">
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {right && <span className="ml-auto text-xs text-muted/70">{right}</span>}
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

/** 阅读流中的条目行（书籍式纵向列表项，相对章缩进一层） */
export function BookEntry({
  number,
  title,
  meta,
  description,
  action,
  accentDot,
  indent = true,
}: {
  /** 子编号：章.节（如 "1.3"），弱化显示 */
  number?: string;
  title: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  accentDot?: string;
  /** 是否相对章头缩进一层 */
  indent?: boolean;
}) {
  return (
    <article
      className={cn(
        'flex flex-col gap-2 border-b border-border/60 py-4 last:border-b-0 sm:py-5',
        indent && 'sm:ml-6',
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {number && (
          <span className="shrink-0 font-mono text-[10px] text-muted/70 sm:w-9 sm:text-right">{number}</span>
        )}
        {accentDot && (
          <span
            className="h-1.5 w-1.5 shrink-0 self-center rounded-full"
            style={{ backgroundColor: accentDot }}
            aria-hidden
          />
        )}
        <h3 className="text-base font-medium leading-snug text-text/90">{title}</h3>
        {meta && <span className="flex flex-wrap items-center gap-1.5">{meta}</span>}
        {action && <span className="w-full pt-1 sm:ml-auto sm:w-auto sm:pt-0">{action}</span>}
      </div>
      {description && (
        <div
          className={cn(
            'text-xs leading-relaxed text-muted',
            number ? 'pl-0 sm:pl-12' : indent ? 'pl-0 sm:pl-6' : 'pl-0',
          )}
        >
          {description}
        </div>
      )}
    </article>
  );
}
