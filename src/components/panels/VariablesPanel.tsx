import type { AlgorithmStep, Primitive } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../lib/cn';

function typeName(value: Primitive): string {
  if (value === null) return 'null';
  return typeof value;
}

function displayValue(value: Primitive): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

/** 变量表：展示当前步变量快照，与上一步不同的值以黄色高亮 */
export function VariablesPanel({
  current,
  previous,
}: {
  current: AlgorithmStep | null;
  previous: AlgorithmStep | null;
}) {
  const { t } = useI18n();
  const entries = current ? Object.entries(current.variables) : [];
  if (!current || entries.length === 0) {
    return <p className="text-xs text-muted">{t.panels.empty}</p>;
  }
  return (
    <table className="w-full text-xs">
      <tbody>
        {entries.map(([name, value]) => {
          const changed = previous !== null && previous.variables[name] !== value;
          return (
            <tr key={name} className="border-b border-border last:border-b-0">
              <td className="py-1.5 pr-2 font-mono text-text">{name}</td>
              <td
                className={cn(
                  'py-1.5 pr-2 font-mono text-right transition-colors',
                  changed ? 'font-semibold text-amber-500 dark:text-amber-400' : 'text-muted',
                )}
                title={changed ? 'changed' : undefined}
              >
                {displayValue(value)}
              </td>
              <td className="w-10 py-1.5 text-right text-[10px] text-muted/70">{typeName(value)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
