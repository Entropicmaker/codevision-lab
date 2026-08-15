import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { algorithmMetas } from '../content/algorithms/registry';
import { useProgress } from '../stores/progressStore';
import { useI18n } from '../hooks/useI18n';
import {
  DragZoomViewport,
  MAX_SCALE,
  MIN_SCALE,
  type ViewTransform,
} from '../components/roadmap/DragZoomViewport';
import { computeLayout, SkillTree, type RoadmapItem } from '../components/roadmap/SkillTree';
import { Button } from '../components/ui/Button';
import { IconFit, IconMinus, IconPlus, IconReset, IconSearch } from '../components/ui/Icons';

const DIFFICULTY_LEGEND = [
  { cls: 'bg-emerald-500', label: 'easy' },
  { cls: 'bg-amber-500', label: 'medium' },
  { cls: 'bg-red-500', label: 'hard' },
] as const;

export function RoadmapPage() {
  const { t, fmt } = useI18n();
  const completedAlgorithms = useProgress((s) => s.completedAlgorithms);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 900, h: 560 });
  const [view, setView] = useState<ViewTransform>({ scale: 0.7, x: 16, y: 16 });

  const items: RoadmapItem[] = useMemo(
    () =>
      algorithmMetas.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        difficulty: m.difficulty,
        prerequisites: m.prerequisites,
      })),
    [],
  );
  const layout = useMemo(() => computeLayout(items), [items]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fitView = useCallback(() => {
    const { w, h } = containerSize;
    if (w <= 0 || h <= 0) return;
    // 小屏优先展示一个清晰可点的起始节点，而不是把整棵宽树缩成不可读的缩略图。
    if (w < 1200) {
      const scale = w < 640 ? 0.74 : 0.82;
      const start = items.find((item) => item.prerequisites.length === 0) ?? items[0];
      const pos = start ? layout.positions[start.id] : undefined;
      if (pos) {
        setView({
          scale,
          x: w / 2 - (pos.x + 112) * scale,
          y: 54 - pos.y * scale,
        });
        return;
      }
    }
    const scale = Math.min(
      1.2,
      Math.max(
        MIN_SCALE,
        Math.min((w - 48) / layout.width, (h - 48) / layout.height),
      ),
    );
    setView({
      scale,
      x: (w - layout.width * scale) / 2,
      y: (h - layout.height * scale) / 2,
    });
  }, [containerSize, items, layout]);

  useEffect(() => {
    fitView();
  }, [fitView]);

  const zoomBy = useCallback(
    (factor: number) => {
      setView((v) => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
        const k = scale / v.scale;
        const cx = containerSize.w / 2;
        const cy = containerSize.h / 2;
        return { scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
      });
    },
    [containerSize],
  );

  const centerOn = useCallback(
    (id: string) => {
      const pos = layout.positions[id];
      if (!pos) return;
      setView((v) => {
        const scale = Math.max(v.scale, 1);
        return {
          scale,
          x: containerSize.w / 2 - (pos.x + 104) * scale,
          y: containerSize.h / 2 - (pos.y + 30) * scale,
        };
      });
    },
    [containerSize, layout],
  );

  const handleSearchSubmit = (): void => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = items.find((i) => `${i.name.zh} ${i.name.en} ${i.id}`.toLowerCase().includes(q));
    if (match) centerOn(match.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="coordinate-frame surface-panel retro-grid p-5 sm:p-7">
        <p className="micro-label text-accent">Learning route / map 01</p>
        <h1 className="font-editorial mt-2 text-3xl font-semibold sm:text-5xl">{t.roadmap.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{t.roadmap.subtitle}</p>
      </header>

      {/* 工具栏 */}
      <div className="surface-panel flex flex-wrap items-center gap-2 p-3">
        <div className="relative w-full sm:w-64">
          <IconSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
            placeholder={t.roadmap.searchPlaceholder}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>
        <Button size="sm" icon={<IconFit size={14} />} onClick={fitView} className="flex-1 sm:flex-none">
          {t.roadmap.fitView}
        </Button>
        <Button size="sm" icon={<IconMinus size={14} />} onClick={() => zoomBy(1 / 1.25)} title={t.roadmap.zoomOut} aria-label={t.roadmap.zoomOut} />
        <Button size="sm" icon={<IconPlus size={14} />} onClick={() => zoomBy(1.25)} title={t.roadmap.zoomIn} aria-label={t.roadmap.zoomIn} />
        <Button size="sm" icon={<IconReset size={14} />} onClick={fitView} aria-label={t.roadmap.resetView}>
          <span className="hidden sm:inline">{t.roadmap.resetView}</span>
        </Button>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-[11px] text-muted sm:ml-auto sm:w-auto sm:border-0 sm:pt-0">
          <span>{fmt(t.roadmap.nodes, { count: items.length })}</span>
          <span className="flex items-center gap-2">
            {t.roadmap.legend}:
            {DIFFICULTY_LEGEND.map((d) => (
              <span key={d.label} className="inline-flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${d.cls}`} aria-hidden />
                {t.common.difficulty[d.label]}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* 视口 */}
      <div
        ref={containerRef}
        className="h-[58dvh] min-h-[440px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-[var(--cv-shadow-soft)] sm:h-[64vh]"
      >
        <DragZoomViewport view={view} onViewChange={setView} className="h-full w-full">
          <SkillTree items={items} completed={completedAlgorithms} searchQuery={query} />
        </DragZoomViewport>
      </div>
    </div>
  );
}
