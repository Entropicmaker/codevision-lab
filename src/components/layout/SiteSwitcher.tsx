import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { lingeoNetwork, lingeoSites, type LingeoSite } from '../../data/ecosystem';
import type { Locale } from '../../i18n';

const CURRENT_SITE = 'codevision';

function siteState(site: LingeoSite, locale: Locale): string {
  if (site.id === CURRENT_SITE) return locale === 'zh' ? '当前' : 'Current';
  if (site.primary) return locale === 'zh' ? '返回主站' : 'Back home';
  return locale === 'zh' ? '进入' : 'Open';
}

function SiteRows({ mobile = false }: { mobile?: boolean }): ReactNode {
  const { locale, localize } = useI18n();
  const rowClass = mobile
    ? 'grid min-h-16 grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-border bg-surface2/45 px-3 py-2 text-left'
    : 'grid min-h-16 grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 bg-surface px-3 py-2 text-left transition hover:bg-surface2';

  return lingeoSites.map((site, index) => {
    const content = (
      <>
        <span className="font-mono text-[9px] text-muted/60">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="grid min-w-0 gap-0.5">
          <strong className="truncate text-xs font-semibold text-text">
            {localize(site.name)}
          </strong>
          <small className="truncate text-[10px] text-muted">{localize(site.descriptor)}</small>
        </span>
        <span className="whitespace-nowrap text-[10px] font-semibold text-accent">
          {siteState(site, locale)}
        </span>
      </>
    );

    return site.id === CURRENT_SITE ? (
      <span
        key={site.id}
        aria-current="page"
        className={`${rowClass} border-accent/25 bg-accentsoft/70`}
      >
        {content}
      </span>
    ) : (
      <a key={site.id} href={site.href} className={rowClass}>
        {content}
      </a>
    );
  });
}

export function SiteSwitcher(): ReactNode {
  const { locale, localize } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative hidden xl:block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface/70 px-2.5 text-left text-muted transition hover:border-borderstrong hover:bg-surface2 hover:text-text"
        aria-label={locale === 'zh' ? '打开 LingeoCS 系列站点' : 'Open LingeoCS network'}
        aria-expanded={open}
        aria-controls="lingeocs-site-switcher"
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-full bg-text font-mono text-xs text-bg"
          aria-hidden
        >
          ◎
        </span>
        <span className="hidden 2xl:grid">
          <strong className="text-[10px] tracking-[0.08em] text-text">{lingeoNetwork.name}</strong>
          <small className="text-[9px]">{localize(lingeoNetwork.label)}</small>
        </span>
        <span className="font-mono text-[10px] font-semibold 2xl:hidden">LCS</span>
        <span className={`text-xs transition ${open ? 'rotate-180' : ''}`} aria-hidden>
          ⌄
        </span>
      </button>

      {open && (
        <div
          id="lingeocs-site-switcher"
          className="absolute right-0 top-[calc(100%+12px)] z-[70] w-[350px] overflow-hidden rounded-[22px] border border-border bg-surface p-4 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="micro-label text-muted">Network coordinates</p>
              <p className="mt-1 font-mono text-xs font-semibold tracking-[0.08em] text-text">
                LINGEOCS / 02
              </p>
            </div>
            <span className="font-mono text-[9px] tracking-[0.08em] text-botanical">ONLINE</span>
          </div>
          <p className="my-3 text-xs leading-5 text-muted">{localize(lingeoNetwork.description)}</p>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
            <SiteRows />
          </div>
        </div>
      )}
    </div>
  );
}

export function MobileSiteSwitcher(): ReactNode {
  const { locale, localize } = useI18n();
  return (
    <section
      className="mt-3 border-t border-border/70 pt-3"
      aria-label={locale === 'zh' ? 'LingeoCS 系列站点' : 'LingeoCS network'}
    >
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="micro-label text-muted">
          {lingeoNetwork.name} / {localize(lingeoNetwork.label)}
        </span>
        <span className="font-mono text-[9px] text-botanical">HOME + 01 SITE</span>
      </div>
      <div className="grid gap-1.5">
        <SiteRows mobile />
      </div>
    </section>
  );
}
