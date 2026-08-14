import type { AlgorithmStep } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';

/** 标准输出面板 */
export function OutputPanel({ current }: { current: AlgorithmStep | null }) {
  const { t } = useI18n();
  const output = current?.output ?? [];
  if (output.length === 0) {
    return <p className="text-xs text-muted">{t.panels.empty}</p>;
  }
  return (
    <pre className="whitespace-pre-wrap break-all rounded-md bg-codebg p-2 font-mono text-xs leading-5 text-text">
      {output.join('\n')}
    </pre>
  );
}
