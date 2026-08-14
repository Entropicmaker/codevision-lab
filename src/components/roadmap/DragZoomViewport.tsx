import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ViewTransform {
  scale: number;
  x: number;
  y: number;
}

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 3;

/**
 * 可拖拽、可缩放的画布视口：
 * - 空白处按住拖动平移；滚轮以指针为中心缩放；触屏同样可用
 * - 受控组件：view 状态由调用方管理（便于“适应画布 / 居中节点”等操作）
 */
export function DragZoomViewport({
  view,
  onViewChange,
  children,
  className,
}: {
  view: ViewTransform;
  onViewChange: (view: ViewTransform) => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; viewX: number; viewY: number } | null>(null);

  // 滚轮缩放（以指针为中心）
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
      const k = nextScale / view.scale;
      onViewChange({
        scale: nextScale,
        x: px - (px - view.x) * k,
        y: py - (py - view.y) * k,
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [view, onViewChange]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return;
    // 点击在可交互元素上（节点/按钮）时不启动拖拽
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, select')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      viewX: view.x,
      viewY: view.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    onViewChange({
      scale: view.scale,
      x: drag.viewX + (e.clientX - drag.startX),
      y: drag.viewY + (e.clientY - drag.startY),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={ref}
      className={cn('relative select-none overflow-hidden touch-none', className)}
      style={{ cursor: dragRef.current ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
