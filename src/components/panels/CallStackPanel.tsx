import type { AlgorithmStep } from '../../engine/types/step';
import { useI18n } from '../../hooks/useI18n';
import { Badge } from '../ui/Badge';

/** 调用栈面板：展示函数帧、参数、局部变量与递归层数 */
export function CallStackPanel({ current }: { current: AlgorithmStep | null }) {
  const { t } = useI18n();
  const frames = current?.callStack ?? [];
  const maxDepth = frames.reduce((max, f) => Math.max(max, f.depth), 0);

  if (frames.length === 0) {
    return <p className="text-xs text-muted">{t.panels.empty}</p>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {maxDepth > 0 && (
        <Badge tone="accent">
          {t.panels.recursionDepth}: {maxDepth}
        </Badge>
      )}
      {/* 栈顶在上 */}
      {[...frames].reverse().map((frame) => (
        <div
          key={frame.id}
          className="rounded-md border-l-2 border-violet-500 bg-surface2 px-2.5 py-1.5"
          style={{ marginLeft: `${Math.min(frame.depth - 1, 6) * 8}px` }}
        >
          <div className="font-mono text-xs font-semibold text-violet-500 dark:text-violet-400">
            {frame.function}()
          </div>
          {Object.keys(frame.args).length > 0 && (
            <div className="mt-0.5 truncate font-mono text-[11px] text-muted">
              args: {Object.entries(frame.args).map(([k, v]) => `${k}=${String(v)}`).join(', ')}
            </div>
          )}
          {Object.keys(frame.locals).length > 0 && (
            <div className="truncate font-mono text-[11px] text-muted">
              locals: {Object.entries(frame.locals).map(([k, v]) => `${k}=${String(v)}`).join(', ')}
            </div>
          )}
          {frame.returnValue !== undefined && (
            <div className="font-mono text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              → {String(frame.returnValue)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
