/**
 * Sets `wortschatzId` on every glossary word that is an entry in DeuLern Wortschatz,
 * so the reader can link it to wortschatz.deulern.com/word/<id>. data/ is a copy of
 * Wortschatz's source files, and its ids are frozen, so links do not rot.
 *
 * Matches the headword exactly ("das Zentrum", "sich freuen"), else a plural or
 * er-form recorded on the entry ("die Karten", "fährt … ab"). Inflected forms such as
 * "verkaufe" stay unlinked: there is no lemmatiser here. A form that fits two entries
 * equally well stays unlinked rather than guessing.
 *
 * Usage: npm run link:glossary   (content.test.ts fails when this is out of date)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

type Word = {
  id: string;
  german: string;
  plural?: string;
  article?: string;
  thirdPersonPresent?: string;
};
type Glossary = {
  german: string;
  english: string;
  match?: string;
  wortschatzId?: string;
};
type Text = { glossary: Glossary[] } & Record<string, unknown>;

const LEVELS = ['a1', 'a2', 'b1'];
const read = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;

export const loadWords = () => LEVELS.flatMap((l) => read<Word[]>(`data/${l}.json`));
export const textFile = (level: string) => `src/content/texts/${level}.json`;

/** Returns a copy of `texts` with `wortschatzId` set or removed on every glossary word. */
export function linkTexts(texts: Text[], words: Word[]): Text[] {
  const exact = new Map<string, Set<string>>();
  const derived = new Map<string, Set<string>>();
  const add = (map: Map<string, Set<string>>, key: string | undefined, id: string) => {
    if (!key) return;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(id);
  };
  for (const w of words) {
    add(exact, w.german, w.id);
    if (w.plural) add(derived, `die ${w.plural}`, w.id);
    add(derived, w.thirdPersonPresent, w.id);
  }
  const only = (ids: Set<string> | undefined) =>
    ids?.size === 1 ? [...ids][0] : undefined;

  return texts.map((t) => ({
    ...t,
    glossary: t.glossary.map((entry) => {
      const g = { ...entry };
      delete g.wortschatzId;
      const key = g.german.replace(/\s*…\s*/g, ' ').trim();
      const id = exact.has(key) ? only(exact.get(key)) : only(derived.get(key));
      return id ? { ...g, wortschatzId: id } : g;
    }),
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const words = loadWords();
  const options = { ...(await resolveConfig(textFile('a1'))), parser: 'json' };
  let linked = 0;
  let total = 0;
  for (const level of LEVELS) {
    const texts = linkTexts(read<Text[]>(textFile(level)), words);
    for (const t of texts) {
      total += t.glossary.length;
      linked += t.glossary.filter((g) => g.wortschatzId).length;
    }
    writeFileSync(textFile(level), await format(JSON.stringify(texts, null, 2), options));
  }
  console.log(`link:glossary: ${linked} of ${total} glossary words link to Wortschatz`);
}
