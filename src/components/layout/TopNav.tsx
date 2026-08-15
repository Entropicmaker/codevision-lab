import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import { useSettings } from '../../stores/settingsStore';
import { cn } from '../../lib/cn';
import { IconGlobe, IconMenu, IconMoon, IconSun, IconClose } from '../ui/Icons';
import { MobileSiteSwitcher, SiteSwitcher } from './SiteSwitcher';

const NAV_ITEMS = [
  { to: '/', key: 'home' },
  { to: '/roadmap', key: 'roadmap' },
  { to: '/learn/cpp', key: 'lessons' },
  { to: '/structures', key: 'dataStructures' },
  { to: '/algorithms', key: 'algorithms' },
  { to: '/lab', key: 'lab' },
  { to: '/exercises', key: 'exercises' },
  { to: '/progress', key: 'progress' },
] as const;

export function TopNav() {
  const { t } = useI18n();
  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const uiLang = useSettings((s) => s.uiLang);
  const setUiLang = useSettings((s) => s.setUiLang);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !menuPanelRef.current) return;
      const focusable = Array.from(
        menuPanelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    main?.setAttribute('inert', '');
    footer?.setAttribute('inert', '');
    window.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => menuPanelRef.current?.querySelector<HTMLElement>('a[href]')?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      main?.removeAttribute('inert');
      footer?.removeAttribute('inert');
      window.removeEventListener('keydown', onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [menuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-full px-3 py-2 text-[13.5px] transition-colors',
      isActive
        ? 'bg-accentsoft font-semibold text-accent'
        : 'text-muted hover:bg-surface2 hover:text-text',
    );

  return (
    <header className="sticky top-0 z-50 py-2">
      <div className="site-shell glass flex h-14 items-center gap-2 rounded-full border border-border/80 px-3 shadow-[var(--cv-shadow-soft)]">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label={t.appName}>
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full border border-botanical text-lg text-botanical transition group-hover:border-accent group-hover:text-accent"
          >
            ⌖
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-[0.045em] text-text">{t.appNameEn}</span>
            <span className="text-[10px] text-muted">{t.appName}</span>
          </span>
        </Link>

        <nav aria-label={t.appName} className="ml-5 hidden items-center gap-0.5 xl:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {t.nav[item.key]}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SiteSwitcher />
          <button
            type="button"
            onClick={() => setUiLang(uiLang === 'zh' ? 'en' : 'zh')}
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted transition-colors hover:bg-surface2 hover:text-text"
            title={t.lang.toggle}
            aria-label={t.lang.toggle}
          >
            <IconGlobe size={16} />
            <span className="hidden sm:inline">UI · {t.lang.label}</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface2 hover:text-text"
            title={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
            aria-label={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
          >
            {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-surface2 hover:text-text xl:hidden"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.menu}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-[#061012]/45 backdrop-blur-sm"
            aria-label={t.nav.closeMenu}
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={menuPanelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={uiLang === 'zh' ? '学习导航' : 'Navigation'}
            className="absolute inset-x-3 top-3 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[24px] border border-border bg-surface p-3 shadow-2xl sm:left-auto sm:right-4 sm:w-[420px]"
          >
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <span className="micro-label text-muted">
                {uiLang === 'zh' ? '学习导航' : 'Navigate'} / 08
              </span>
              <span className="font-mono text-[10px] text-accent">SYSTEM ONLINE</span>
            </div>
            <nav className="grid gap-1 sm:grid-cols-2" aria-label="mobile-nav">
              {NAV_ITEMS.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-12 items-center gap-3 rounded-2xl border px-3 text-sm transition-colors',
                      isActive
                        ? 'border-accent/35 bg-accentsoft font-semibold text-accent'
                        : 'border-transparent text-muted hover:border-border hover:bg-surface2 hover:text-text',
                    )
                  }
                >
                  <span className="font-mono text-[10px] text-muted/60">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {t.nav[item.key]}
                </NavLink>
              ))}
            </nav>
            <MobileSiteSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
