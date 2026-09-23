import { z } from 'zod';

export const LEVELS = ['A1', 'A2', 'B1'] as const;
export type Level = (typeof LEVELS)[number];

/** Inclusive word-count range per level. */
export const WORD_RANGE: Record<Level, [number, number]> = {
  A1: [89, 144],
  A2: [144, 233],
  B1: [233, 377],
};

const question = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('mc'),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
  }),
  z.object({
    type: z.literal('tf'),
    prompt: z.string().min(1),
    answer: z.boolean(),
    explanation: z.string().optional(),
  }),
]);

export const textSchema = z.object({
  id: z.string().regex(/^(a1|a2|b1)-\d\d$/),
  level: z.enum(LEVELS),
  title: z.string().min(1),
  topic: z.string().min(1),
  body: z.string().min(1),
  glossary: z
    .array(
      z.object({
        german: z.string().min(1),
        english: z.string().min(1),
        /** Exact text to highlight in the body, when it differs from the headword. */
        match: z.string().min(1).optional(),
      }),
    )
    .min(1),
  questions: z.array(question).min(6).max(12),
});

export type Question = z.infer<typeof question>;
export type ReadingText = z.infer<typeof textSchema>;

/** Tokens separated by whitespace that contain a letter or digit. */
export function countWords(body: string): number {
  return body.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

/** Text to find in the body: `match`, else the headword without its article. */
export function glossaryNeedle(g: {
  german: string;
  match?: string | undefined;
}): string {
  return g.match ?? g.german.replace(/^(der|die|das)\s+/i, '');
}

/** First case-insensitive whole-word occurrence of `needle` in `body`. */
export function findGlossary(body: string, needle: string): number {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`, 'iu').exec(body);
  return m ? m.index : -1;
}
