import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { IconChevronDown } from './Icons';

/** 可折叠面板（右侧状态区 / 课程侧栏通用） */
export function Panel({
  title,
  icon,
  right,
  defaultOpen = true,
  collapsible = true,
  className,
  bodyClassName,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn('rounded-2xl border border-border bg-surface cv-card', className)}>
      <header className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => collapsible && setOpen((o) => !o)}
          disabled={!collapsible}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 text-left text-xs font-semibold uppercase tracking-wide text-muted',
            collapsible && 'cursor-pointer hover:text-text',
          )}
          aria-expanded={open}
        >
          {icon}
          <span className="truncate">{title}</span>
          {collapsible && (
            <IconChevronDown
              size={14}
              className={cn('ml-auto shrink-0 transition-transform', !open && '-rotate-90')}
            />
          )}
        </button>
        {right}
      </header>
      {open && <div className={cn('border-t border-border px-3 py-2.5', bodyClassName)}>{children}</div>}
    </section>
  );
}
