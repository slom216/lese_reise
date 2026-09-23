import { TEXTS } from './index';
import { LEVELS, WORD_RANGE, countWords, findGlossary, glossaryNeedle } from './schema';

describe('reading texts', () => {
  const EXPECTED = { A1: 50, A2: 10, B1: 10 };
  it.each(LEVELS)('%s has the expected number of texts', (level) => {
    expect(TEXTS.filter((t) => t.level === level)).toHaveLength(EXPECTED[level]);
  });

  it('texts within a level have distinct titles', () => {
    for (const level of LEVELS) {
      const titles = TEXTS.filter((t) => t.level === level).map((t) => t.title);
      expect(new Set(titles).size).toBe(titles.length);
    }
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
