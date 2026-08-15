import { useI18n } from '../../hooks/useI18n';
import type { PlaybackController, PlaybackSnapshot } from '../../engine/playback/PlaybackController';
import { SPEED_MAX, SPEED_MIN } from '../../stores/settingsStore';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';
import {
  IconJumpEnd,
  IconJumpStart,
  IconKeyboard,
  IconNext,
  IconPause,
  IconPlay,
  IconPrev,
  IconReset,
} from '../ui/Icons';

interface BottomControlBarProps {
  controller: PlaybackController;
  snapshot: PlaybackSnapshot;
  speed: number;
  onSpeedChange: (speed: number) => void;
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
  onShowShortcuts: () => void;
}

/** 底部播放控制栏 */
export function BottomControlBar({
  controller,
  snapshot,
  speed,
  onSpeedChange,
  loop,
  onLoopChange,
  onShowShortcuts,
}: BottomControlBarProps) {
  const { t, fmt } = useI18n();
  const { index, total, status } = snapshot;
  const hasSteps = total > 0;
  const canPrev = index > 0;
  const canNext = index < total - 1;

  const statusLabel = t.playback.status[status];

  const controlButton =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface px-2 text-muted transition-colors hover:border-borderstrong hover:text-text disabled:cursor-not-allowed disabled:opacity-35';

  return (
    <div className="glass sticky bottom-0 z-40 border-t border-border">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
        {/* 状态与步骤计数 */}
        <div className="flex min-w-28 items-center gap-2" data-testid="step-counter">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              status === 'playing' && 'animate-pulse bg-emerald-500',
              status === 'paused' && 'bg-amber-500',
              status === 'finished' && 'bg-emerald-500',
              status === 'idle' && 'bg-muted/50',
            )}
            aria-hidden
          />
          <span className="hidden text-xs font-medium text-text sm:inline">{statusLabel}</span>
          <span className="font-mono text-[11px] tabular-nums text-muted">
            {fmt(t.playback.stepOf, { current: index + (total > 0 ? 1 : 0), total })}
          </span>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={controlButton}
            onClick={() => controller.jumpTo(0)}
            disabled={!canPrev}
            title={t.common.jumpStart}
            aria-label={t.common.jumpStart}
            data-testid="btn-jump-start"
          >
            <IconJumpStart size={16} />
          </button>
          <button
            type="button"
            className={controlButton}
            onClick={() => controller.prev()}
            disabled={!canPrev}
            title={t.common.prevStep}
            aria-label={t.common.prevStep}
            data-testid="btn-prev"
          >
            <IconPrev size={16} />
          </button>
          <button
            type="button"
            className="inline-flex h-10 min-w-20 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            onClick={() => controller.toggle()}
            disabled={!hasSteps}
            title={t.common.play}
            data-testid="btn-play-pause"
          >
            {status === 'playing' ? <IconPause size={16} /> : <IconPlay size={16} />}
            {status === 'playing' ? t.common.pause : t.common.play}
          </button>
          <button
            type="button"
            className={controlButton}
            onClick={() => controller.next()}
            disabled={!canNext}
            title={t.common.nextStep}
            aria-label={t.common.nextStep}
            data-testid="btn-next"
          >
            <IconNext size={16} />
          </button>
          <button
            type="button"
            className={controlButton}
            onClick={() => controller.jumpTo(total - 1)}
            disabled={!canNext}
            title={t.common.jumpEnd}
            aria-label={t.common.jumpEnd}
            data-testid="btn-jump-end"
          >
            <IconJumpEnd size={16} />
          </button>
          <button
            type="button"
            className={controlButton}
            onClick={() => controller.reset()}
            disabled={!hasSteps}
            title={t.common.reset}
            aria-label={t.common.reset}
            data-testid="btn-reset"
          >
            <IconReset size={16} />
          </button>
        </div>

        {/* 进度 slider */}
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          step={1}
          value={Math.min(index, Math.max(0, total - 1))}
          onChange={(e) => controller.jumpTo(Number(e.target.value))}
          disabled={!hasSteps}
          className="h-1 min-w-24 flex-1 cursor-pointer accent-[var(--cv-accent)] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={t.playback.stepOf}
        />

        {/* 速度 */}
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-muted sm:inline">{t.playback.speedLabel}</span>
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.25}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="h-1 w-16 cursor-pointer accent-[var(--cv-accent)] sm:w-20"
            aria-label={t.playback.speedLabel}
          />
          <span className="hidden w-12 font-mono text-[11px] tabular-nums text-muted sm:inline">
            {speed.toFixed(2)} {t.playback.speedUnit}
          </span>
        </div>

        {/* 自动播放（循环） */}
        <button
          type="button"
          role="switch"
          aria-checked={loop}
          onClick={() => onLoopChange(!loop)}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors',
            loop
              ? 'border-accent/50 bg-accentsoft font-medium text-accent'
              : 'border-border bg-surface text-muted hover:text-text',
          )}
        >
          <span
            className={cn(
              'relative inline-block h-3.5 w-6 rounded-full transition-colors',
              loop ? 'bg-accent' : 'bg-borderstrong',
            )}
            aria-hidden
          >
            <span
              className={cn(
                'absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all',
                loop ? 'left-3' : 'left-0.5',
              )}
            />
          </span>
          <span className="hidden sm:inline">{t.common.autoplay}</span>
        </button>

        {/* 快捷键帮助 */}
        <Button size="sm" variant="ghost" icon={<IconKeyboard size={14} />} onClick={onShowShortcuts} className="hidden md:inline-flex">
          {t.playground.shortcutHelp}
        </Button>
      </div>
    </div>
  );
}
