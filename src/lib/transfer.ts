import { progressDataSchema, type ProgressData } from '../store/progress';

export function exportProgress({ results, activity, settings }: ProgressData): string {
  return JSON.stringify(
    { app: 'lese-reise', version: 1, results, activity, settings },
    null,
    2,
  );
}

/** Parses an exported file; throws with a readable message when it is not one. */
export function importProgress(text: string): ProgressData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  const parsed = progressDataSchema.safeParse(raw);
  if (!parsed.success) throw new Error('This file is not a Lese Reise progress export.');
  return parsed.data;
}
