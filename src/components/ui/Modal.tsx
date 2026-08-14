import { useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { IconClose } from './Icons';

/** 简单模态框：Esc 关闭、点击遮罩关闭 */
export function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  widthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn('w-full rounded-2xl border border-border bg-surface cv-card p-4 shadow-2xl', widthClass)}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-text"
            aria-label="close"
          >
            <IconClose size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
