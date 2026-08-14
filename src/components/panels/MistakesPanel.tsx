import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { useI18n } from '../../hooks/useI18n';
import { IconAlert } from '../ui/Icons';

/** 常见错误与边界情况 */
export function MistakesPanel({ meta }: { meta: AlgorithmMeta }) {
  const { locale } = useI18n();
  if (meta.commonMistakes.length === 0) return null;
  return (
    <ol className="flex flex-col gap-3">
      {meta.commonMistakes.map((mistake, i) => (
        <li key={i} className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-danger">
            <IconAlert size={15} className="shrink-0" />
            {mistake.title[locale]}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{mistake.detail[locale]}</p>
          {mistake.code && (
            <pre className="mt-2 overflow-x-auto rounded-md bg-codebg p-2 font-mono text-[11px] leading-5 text-muted">
              {mistake.code}
            </pre>
          )}
        </li>
      ))}
    </ol>
  );
}
