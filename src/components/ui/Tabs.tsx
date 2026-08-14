import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: ReactNode;
}

export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('flex items-center gap-1 border-b border-border', className)}
    >
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={active === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'relative -mb-px border-b-2 px-3 py-2 text-sm transition-colors',
            active === item.id
              ? 'border-accent font-medium text-text'
              : 'border-transparent text-muted hover:text-text',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export interface TabbedPanelItem extends TabItem {
  content: ReactNode;
}

/** 标签页容器：仅渲染当前激活面板（用于移动端布局） */
export function TabbedPanels({
  items,
  active,
  onChange,
  className,
  contentClassName,
}: {
  items: TabbedPanelItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  contentClassName?: string;
}) {
  const current = items.find((i) => i.id === active) ?? items[0];
  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <Tabs items={items} active={current.id} onChange={onChange} />
      <div className={cn('min-h-0 flex-1 overflow-auto', contentClassName)}>
        {current?.content}
      </div>
    </div>
  );
}
