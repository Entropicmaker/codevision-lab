import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="text-muted">{icon}</div>}
      <div className="text-sm font-medium text-text">{title}</div>
      {description && <div className="max-w-md text-xs leading-relaxed text-muted">{description}</div>}
      {action}
    </div>
  );
}
