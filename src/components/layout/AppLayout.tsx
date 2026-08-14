import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { useI18n } from '../../hooks/useI18n';

export function AppLayout(): ReactNode {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <TopNav />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-4 sm:px-4 lg:py-6">
        <Outlet />
      </main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted">
        {t.footer.note}
      </footer>
    </div>
  );
}
