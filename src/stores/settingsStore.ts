import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CodeLang } from '../engine/types/step';
import type { Locale } from '../i18n';

export type ThemeMode = 'dark' | 'light';

export interface SettingsState {
  theme: ThemeMode;
  uiLang: Locale;
  codeLang: CodeLang;
  /** 播放速度：步/秒，范围 0.25–4 */
  playbackSpeed: number;
  /** 编辑器字号 */
  fontSize: number;
  reduceMotion: boolean;
  setTheme: (theme: ThemeMode) => void;
  setUiLang: (uiLang: Locale) => void;
  setCodeLang: (codeLang: CodeLang) => void;
  setPlaybackSpeed: (speed: number) => void;
  setFontSize: (size: number) => void;
  setReduceMotion: (reduce: boolean) => void;
}

export const SPEED_MIN = 0.25;
export const SPEED_MAX = 4;

export function clampSpeed(speed: number): number {
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed));
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      uiLang: 'zh',
      codeLang: 'cpp',
      playbackSpeed: 1,
      fontSize: 13,
      reduceMotion: false,
      setTheme: (theme) => set({ theme }),
      setUiLang: (uiLang) => set({ uiLang }),
      setCodeLang: (codeLang) => set({ codeLang }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: clampSpeed(speed) }),
      setFontSize: (size) => set({ fontSize: Math.min(24, Math.max(10, size)) }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: 'cv-settings', version: 1 },
  ),
);
