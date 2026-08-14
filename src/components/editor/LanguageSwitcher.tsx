import { cn } from '../../lib/cn';
import type { CodeLang } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';
import { Badge } from '../ui/Badge';
import { IconInfo } from '../ui/Icons';

const LANGS: Array<{ id: CodeLang; label: string }> = [
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'python', label: 'Python' },
];

/** 示例代码语言切换（切换仅影响源码与行号映射，步骤序列不变） */
export function LanguageSwitcher({
  value,
  onChange,
  withDemoNote = true,
}: {
  value: CodeLang;
  onChange: (lang: CodeLang) => void;
  withDemoNote?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="tablist"
        aria-label={t.playground.codeLangLabel}
        className="inline-flex items-center rounded-lg border border-border bg-surface2 p-0.5"
      >
        {LANGS.map((lang) => (
          <button
            key={lang.id}
            role="tab"
            type="button"
            aria-selected={value === lang.id}
            onClick={() => onChange(lang.id)}
            className={cn(
              'rounded-md px-3 py-1 font-mono text-xs transition-colors',
              value === lang.id
                ? 'bg-accent font-semibold text-white'
                : 'text-muted hover:text-text',
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>
      {withDemoNote && (
        <Badge tone="neutral" className="hidden items-center gap-1 sm:inline-flex">
          <IconInfo size={12} />
          {t.playground.demoMode}
        </Badge>
      )}
    </div>
  );
}
