import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import { useSettings } from '../../stores/settingsStore';
import { cn } from '../../lib/cn';
import { IconGlobe, IconMenu, IconMoon, IconSun, IconClose } from '../ui/Icons';

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
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // 路由变化时收起移动端菜单
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // 点击菜单外部时关闭
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-md px-3 py-1.5 text-sm transition-colors',
      isActive ? 'bg-accentsoft font-medium text-accent' : 'text-muted hover:bg-surface2 hover:text-text',
    );

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:px-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold tracking-wide text-text">{t.appNameEn}</span>
            <span className="text-[10px] text-muted">{t.appName}</span>
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav aria-label={t.appName} className="ml-4 hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {t.nav[item.key]}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* 语言切换 */}
          <button
            type="button"
            onClick={() => setUiLang(uiLang === 'zh' ? 'en' : 'zh')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted transition-colors hover:bg-surface2 hover:text-text"
            title={t.lang.toggle}
            aria-label={t.lang.toggle}
          >
            <IconGlobe size={16} />
            <span className="hidden md:inline">{t.lang.label}</span>
          </button>
          {/* 主题切换 */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface2 hover:text-text"
            title={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
            aria-label={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
          >
            {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>
          {/* 移动端菜单按钮 */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-text lg:hidden"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.menu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div ref={menuRef} className="border-t border-border bg-surface px-3 py-2 lg:hidden">
          <nav className="grid grid-cols-2 gap-1" aria-label="mobile-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                {t.nav[item.key]}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
