import { useEffect, type ReactNode } from 'react';
import { useSettings } from '../stores/settingsStore';

/** 应用级副作用：主题 class、lang 属性与页面标题同步 */
export function AppProviders({ children }: { children: ReactNode }) {
  const theme = useSettings((s) => s.theme);
  const uiLang = useSettings((s) => s.uiLang);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.setAttribute('lang', uiLang === 'zh' ? 'zh-CN' : 'en');
  }, [theme, uiLang]);

  return <>{children}</>;
}
