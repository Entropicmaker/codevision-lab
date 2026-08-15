import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { useI18n } from '../../hooks/useI18n';
import { lingeoSites } from '../../data/ecosystem';

export function AppLayout(): ReactNode {
  const { t, locale, localize } = useI18n();
  return (
    <div className="app-frame flex min-h-screen flex-col text-text">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-full bg-text px-4 py-2 text-sm font-semibold text-bg transition focus:translate-y-0"
      >
        {t.common.skipToContent}
      </a>
      <TopNav />
      <main id="main-content" className="site-shell w-full flex-1 py-4 sm:py-6 lg:py-8" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-shell py-6 text-xs text-muted">
        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono tracking-[0.14em]">CODEVISION / FIELD NOTE 02</span>
            <p className="mt-1 leading-relaxed">{t.footer.note}</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label={t.footer.links}>
            {lingeoSites
              .filter((site) => site.id !== 'codevision')
              .map((site) => (
                <a key={site.id} href={site.href} className="hover:text-text hover:underline">
                  {site.primary
                    ? locale === 'zh'
                      ? 'LingeoCS 主站'
                      : 'LingeoCS home'
                    : localize(site.name)}{' '}
                  ↗
                </a>
              ))}
            <a
              href="https://github.com/Entropicmaker/codevision-lab"
              className="hover:text-text hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://github.com/Entropicmaker/codevision-lab#readme"
              className="hover:text-text hover:underline"
            >
              README
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
