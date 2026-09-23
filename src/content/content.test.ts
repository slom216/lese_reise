import { TEXTS } from './index';
import { LEVELS, WORD_RANGE, countWords, findGlossary, glossaryNeedle } from './schema';

describe('reading texts', () => {
  it.each(LEVELS)('%s has 10 texts', (level) => {
    expect(TEXTS.filter((t) => t.level === level)).toHaveLength(10);
  });

  it('ids are unique and match their level', () => {
    expect(new Set(TEXTS.map((t) => t.id)).size).toBe(TEXTS.length);
    for (const t of TEXTS) expect(t.id.slice(0, 2)).toBe(t.level.toLowerCase());
  });

  it.each(TEXTS.map((t) => [t.id, t] as const))('%s is within its word range', (_, t) => {
    const [min, max] = WORD_RANGE[t.level];
    const n = countWords(t.body);
    expect(n).toBeGreaterThanOrEqual(min);
    expect(n).toBeLessThanOrEqual(max);
  });

  it.each(TEXTS.map((t) => [t.id, t] as const))(
    '%s glossary words appear in the text',
    (_, t) => {
      const missing = t.glossary.filter(
        (g) => findGlossary(t.body, glossaryNeedle(g)) < 0,
      );
      expect(missing.map((g) => g.german)).toEqual([]);
    },
  );
});
