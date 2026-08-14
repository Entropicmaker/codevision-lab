import { zhCN } from './zh-CN';
import { enUS } from './en-US';

/** 把字面量类型放宽为普通类型（词典值可自由翻译） */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : { [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof zhCN>;

export type { Dict as I18nDict };

export const dicts: Record<'zh' | 'en', Dict> = {
  zh: zhCN as Dict,
  en: enUS,
};

export type Locale = 'zh' | 'en';

/** 简单插值：fmt('第 {current} / {total} 步', { current: 3, total: 10 }) */
export function fmt(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** 取中英双语文本的当前语言版本 */
export function localize(
  text: { zh: string; en: string },
  locale: Locale,
): string {
  return text[locale];
}
