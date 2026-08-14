import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * 可视化画布容器：测量自身尺寸供渲染器使用。
 * SVG 渲染器用 viewBox + width:100% 自适应缩放。
 */
export function VizCanvas({
  children,
  className,
}: {
  children: ReactNode | ((size: { width: number; height: number }) => ReactNode);
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      data-viz-canvas
    >
      {typeof children === 'function' ? children(size) : children}
    </div>
  );
}
