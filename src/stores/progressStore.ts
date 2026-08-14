import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AlgorithmProgressRecord {
  doneAt: number;
  lastInput: string;
}

export interface LessonProgressRecord {
  doneAt: number;
}

export interface ProgressState {
  completedAlgorithms: Record<string, AlgorithmProgressRecord>;
  completedLessons: Record<string, LessonProgressRecord>;
  favorites: string[];
  markAlgorithmComplete: (id: string, lastInput: string) => void;
  markLessonComplete: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completedAlgorithms: {},
      completedLessons: {},
      favorites: [],
      markAlgorithmComplete: (id, lastInput) =>
        set((state) => ({
          completedAlgorithms: {
            ...state.completedAlgorithms,
            [id]: { doneAt: Date.now(), lastInput },
          },
        })),
      markLessonComplete: (id) =>
        set((state) => ({
          completedLessons: {
            ...state.completedLessons,
            [id]: { doneAt: Date.now() },
          },
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
    }),
    { name: 'cv-progress', version: 1 },
  ),
);
