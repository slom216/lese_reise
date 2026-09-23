import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dayKey } from '../lib/dates';

/** Must match the key read by the inline theme script in index.html. */
export const STORAGE_KEY = 'lese-reise';

const resultSchema = z.object({
  bestScore: z.number().min(0).max(1),
  lastScore: z.number().min(0).max(1),
  attempts: z.number().int().min(1),
  completedAt: z.string(),
});

export const progressDataSchema = z.object({
  results: z.record(z.string(), resultSchema),
  activity: z.record(z.string().regex(/^\d{4}-\d\d-\d\d$/), z.number().int().min(0)),
  settings: z.object({
    theme: z.enum(['system', 'light', 'dark']),
    fontSize: z.enum(['s', 'm', 'l', 'xl']),
  }),
});

export type ProgressData = z.infer<typeof progressDataSchema>;
export type Settings = ProgressData['settings'];

const initial: ProgressData = {
  results: {},
  activity: {},
  settings: { theme: 'system', fontSize: 'm' },
};

type Actions = {
  /** Records a finished quiz; score is the fraction correct (0–1). */
  complete: (textId: string, score: number, now?: Date) => void;
  setSettings: (patch: Partial<Settings>) => void;
  replaceAll: (data: ProgressData) => void;
  reset: () => void;
};

export const useProgress = create<ProgressData & Actions>()(
  persist(
    (set) => ({
      ...initial,
      complete: (textId, score, now = new Date()) =>
        set((s) => {
          const prev = s.results[textId];
          const day = dayKey(now);
          return {
            results: {
              ...s.results,
              [textId]: {
                bestScore: Math.max(prev?.bestScore ?? 0, score),
                lastScore: score,
                attempts: (prev?.attempts ?? 0) + 1,
                completedAt: now.toISOString(),
              },
            },
            activity: { ...s.activity, [day]: (s.activity[day] ?? 0) + 1 },
          };
        }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      replaceAll: (data) => set(data),
      reset: () => set({ results: {}, activity: {} }),
    }),
    { name: STORAGE_KEY, version: 1 },
  ),
);
