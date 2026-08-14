import { useMemo } from 'react';
import { extractPseudocodeLines } from '../../engine/codeMap/extract';
import { cn } from '../../lib/cn';

/** 伪代码面板：当前执行逻辑行高亮 */
export function PseudocodePanel({
  pseudocode,
  currentCodeLineId,
}: {
  pseudocode: string;
  currentCodeLineId: string | null;
}) {
  const lines = useMemo(() => extractPseudocodeLines(pseudocode), [pseudocode]);
  return (
    <div className="overflow-x-auto rounded-lg bg-codebg p-2">
      <pre className="font-mono text-xs leading-6">
        {lines.map((line) => (
          <div
            key={line.lineNumber}
            className={cn(
              'flex rounded px-2',
              line.codeLineId !== null && line.codeLineId === currentCodeLineId
                ? 'bg-accentsoft text-text'
                : 'text-muted',
            )}
          >
            <span className="w-6 select-none text-right text-muted/50">{line.lineNumber}</span>
            <span className="ml-2 whitespace-pre">{line.text || ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
