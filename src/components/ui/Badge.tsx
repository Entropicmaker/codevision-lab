import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'easy' | 'medium' | 'hard' | 'accent' | 'neutral' | 'done' | 'danger';

const toneClasses: Record<BadgeTone, string> = {
  easy: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  hard: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  accent: 'bg-accentsoft text-accent border-accent/30',
  neutral: 'bg-surface2 text-muted border-border',
  done: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/15 text-danger border-red-500/30',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 难度徽章（绿=简单 黄=中等 红=困难） */
export function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  return <Badge tone={difficulty}>{difficulty.toUpperCase()}</Badge>;
}
