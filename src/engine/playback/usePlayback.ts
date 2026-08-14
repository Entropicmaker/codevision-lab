import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { AlgorithmStep } from '../types/step';
import { PlaybackController, type PlaybackSnapshot } from './PlaybackController';

/**
 * 把 PlaybackController 接入 React：
 * - 步骤序列变化时自动 load（重置播放状态）
 * - 组件卸载时 destroy（取消节拍器，防止泄漏）
 */
export function usePlayback(
  steps: AlgorithmStep[],
): PlaybackSnapshot & { controller: PlaybackController } {
  const controllerRef = useRef<PlaybackController | null>(null);
  if (controllerRef.current === null) {
    controllerRef.current = new PlaybackController();
  }
  const controller = controllerRef.current;

  useEffect(() => {
    controller.load(steps);
  }, [controller, steps]);

  useEffect(() => {
    return () => controller.destroy();
  }, [controller]);

  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );

  return { ...snapshot, controller };
}
