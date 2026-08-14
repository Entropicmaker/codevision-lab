import { useSettings } from '../stores/settingsStore';
import { dicts, fmt, localize } from '../i18n';
import type { Dict, Locale } from '../i18n';

export function useI18n(): {
  t: Dict;
  locale: Locale;
  fmt: typeof fmt;
  localize: (text: { zh: string; en: string }) => string;
} {
  const uiLang = useSettings((s) => s.uiLang);
  return {
    t: dicts[uiLang],
    locale: uiLang,
    fmt,
    localize: (text) => localize(text, uiLang),
  };
}
