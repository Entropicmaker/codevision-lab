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
  replaceProgress: (data: Pick<ProgressState, 'completedAlgorithms' | 'completedLessons' | 'favorites'>) => void;
  resetProgress: () => void;
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
      replaceProgress: (data) => set({
        completedAlgorithms: data.completedAlgorithms,
        completedLessons: data.completedLessons,
        favorites: data.favorites,
      }),
      resetProgress: () => set({ completedAlgorithms: {}, completedLessons: {}, favorites: [] }),
    }),
    { name: 'cv-progress', version: 1 },
  ),
);
