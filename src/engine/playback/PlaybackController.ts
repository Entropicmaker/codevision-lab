import type { AlgorithmStep } from '../types/step';
import { clampSpeed } from '../../stores/settingsStore';

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

export interface PlaybackSnapshot {
  index: number;
  total: number;
  status: PlaybackStatus;
  speed: number;
  currentStep: AlgorithmStep | null;
}

/**
 * 播放控制器：管理步骤播放 / 暂停 / 前进 / 后退 / 跳转 / 速度 / 重置。
 * - 前进 = 应用下一快照；后退 = 恢复上一快照（绝不反向执行算法）。
 * - 节拍器基于 requestAnimationFrame，可随时取消，StrictMode 安全。
 */
export class PlaybackController {
  private steps: AlgorithmStep[] = [];
  private index = 0;
  private status: PlaybackStatus = 'idle';
  private speed = 1;
  /** 循环模式：播放到末尾自动从头继续（“自动播放”） */
  private loop = false;
  private rafId: number | null = null;
  private lastTick = 0;
  private listeners = new Set<() => void>();
  private snapshot: PlaybackSnapshot;

  constructor() {
    this.snapshot = this.computeSnapshot();
  }

  private computeSnapshot(): PlaybackSnapshot {
    return {
      index: this.index,
      total: this.steps.length,
      status: this.status,
      speed: this.speed,
      currentStep: this.steps[this.index] ?? null,
    };
  }

  private emit(): void {
    this.snapshot = this.computeSnapshot();
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): PlaybackSnapshot => this.snapshot;

  private stopTicker(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private startTicker(): void {
    if (this.rafId !== null || this.speed <= 0) return;
    this.lastTick = performance.now();
    const tick = (now: number): void => {
      this.rafId = requestAnimationFrame(tick);
      const stepMs = 1000 / this.speed;
      if (now - this.lastTick >= stepMs) {
        this.lastTick = now - ((now - this.lastTick) % stepMs);
        this.advanceOne();
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private advanceOne(): void {
    if (this.index >= this.steps.length - 1) {
      if (this.loop && this.steps.length > 1) {
        this.index = 0;
        this.emit();
        return;
      }
      this.status = 'finished';
      this.stopTicker();
      this.emit();
      return;
    }
    this.index += 1;
    if (this.index === this.steps.length - 1) {
      if (this.loop && this.steps.length > 1) {
        this.index = 0;
        this.emit();
        return;
      }
      this.status = 'finished';
      this.stopTicker();
    }
    this.emit();
  }

  /** 加载新步骤序列（重置播放状态） */
  load(steps: AlgorithmStep[]): void {
    this.stopTicker();
    this.steps = steps;
    this.index = 0;
    this.status = steps.length > 0 ? 'paused' : 'idle';
    this.emit();
  }

  play(): void {
    if (this.steps.length === 0) return;
    if (this.status === 'finished') this.index = 0;
    this.status = 'playing';
    this.startTicker();
    this.emit();
  }

  pause(): void {
    if (this.status !== 'playing') return;
    this.stopTicker();
    this.status = 'paused';
    this.emit();
  }

  toggle(): void {
    if (this.status === 'playing') this.pause();
    else this.play();
  }

  next(): void {
    if (this.steps.length === 0) return;
    if (this.index < this.steps.length - 1) {
      this.index += 1;
      if (this.index === this.steps.length - 1 && this.status !== 'playing') {
        this.status = 'finished';
      }
      this.emit();
    } else if (this.status !== 'playing') {
      this.status = 'finished';
      this.emit();
    }
  }

  prev(): void {
    if (this.index > 0) {
      this.index -= 1;
      if (this.status === 'finished') this.status = 'paused';
      this.emit();
    }
  }

  jumpTo(target: number): void {
    if (this.steps.length === 0) return;
    const clamped = Math.max(0, Math.min(target, this.steps.length - 1));
    this.index = clamped;
    if (this.status === 'playing') {
      // 播放中跳转：到达末尾则结束，否则继续播放
      if (clamped === this.steps.length - 1) {
        this.status = 'finished';
        this.stopTicker();
      }
    } else {
      this.status = clamped === this.steps.length - 1 ? 'finished' : 'paused';
    }
    this.emit();
  }

  reset(): void {
    this.stopTicker();
    this.index = 0;
    this.status = this.steps.length > 0 ? 'paused' : 'idle';
    this.emit();
  }

  setSpeed(speed: number): void {
    const next = clampSpeed(speed);
    if (next === this.speed) return;
    this.speed = next;
    if (this.status === 'playing') {
      this.stopTicker();
      this.startTicker();
    }
    this.emit();
  }

  setLoop(loop: boolean): void {
    this.loop = loop;
  }

  destroy(): void {
    this.stopTicker();
    this.listeners.clear();
  }
}
