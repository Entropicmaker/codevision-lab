import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { useI18n } from '../../hooks/useI18n';

export function AppLayout(): ReactNode {
  const { t } = useI18n();
  return (
    <div className="app-frame flex min-h-screen flex-col text-text">
      <TopNav />
      <main className="site-shell w-full flex-1 py-4 sm:py-6 lg:py-8">
        <Outlet />
      </main>
      <footer className="site-shell py-6 text-xs text-muted">
        <div className="flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono tracking-[0.14em]">CODEVISION / FIELD NOTE 01</span>
          <span>{t.footer.note}</span>
        </div>
      </footer>
    </div>
  );
}
