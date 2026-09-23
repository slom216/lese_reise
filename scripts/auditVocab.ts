/**
 * Reports how much of each text is covered by the CEFR word lists in data/.
 * Heuristic (crude suffix stripping, no real lemmatiser), so it only reports
 * and never fails. Usage: npm run audit:vocab [-- a1-03]
 */
import { readFileSync } from 'node:fs';
import { LEVELS, countWords, type Level, type ReadingText } from '../src/content/schema';

type Entry = Record<string, unknown> & { german: string };
const load = (f: string): Entry[] => JSON.parse(readFileSync(f, 'utf8'));

// Inflected function words the lists only carry in base form.
const FUNCTION_WORDS =
  `der die das den dem des ein eine einen einem einer eines kein keine keinen keinem
keiner mein meine meinen meinem meiner dein deine deinen deinem sein seine seinen seinem seiner ihr
ihre ihren ihrem ihrer unser unsere unseren unserem euer eure ich du er sie es wir ihr mich mir dich
dir ihn ihm uns euch ihnen sich bin bist ist sind seid war warst waren wart gewesen habe hast hat
haben habt hatte hattest hatten gehabt werde wirst wird werden werdet wurde wurden geworden kann
kannst können könnt konnte konnten könnte möchte möchtest möchten muss musst müssen musste mussten
will willst wollen wollte wollten darf darfst dürfen durfte soll sollst sollen sollte sollten mag
magst würde würden wäre wären hätte hätten dieser diese dieses diesen diesem man zum zur im am ins
vom beim ans aufs dass wenn weil als ob zu so da dann denn doch ja nein nicht auch noch schon nur
sehr gern gerne viel viele vielen welche welcher welches welchen jeden jede jeder jedem alle allen
alles etwas nichts was wer wie wo wohin woher warum wann`.split(/\s+/);

function formsOf(e: Entry): string[] {
  const out = [e.german];
  for (const k of [
    'plural',
    'thirdPersonPresent',
    'simplePast',
    'pastParticiple',
    'comparative',
    'superlative',
  ])
    if (typeof e[k] === 'string') out.push(e[k] as string);
  return out
    .flatMap((s) => s.split(/[\s/,()]+/))
    .map((s) => s.toLowerCase().replace(/[^\p{L}]/gu, ''))
    .filter(
      (s) =>
        s.length > 1 && !['der', 'die', 'das', 'sich', 'etw', 'jdn', 'jdm'].includes(s),
    );
}

const SUFFIXES = [
  '',
  'e',
  'en',
  'n',
  'er',
  'es',
  's',
  'st',
  't',
  'et',
  'te',
  'ten',
  'em',
  'ern',
  'est',
];
function known(token: string, vocab: Set<string>): boolean {
  if (vocab.has(token)) return true;
  for (const suf of SUFFIXES) {
    if (suf && !token.endsWith(suf)) continue;
    const stem = token.slice(0, token.length - suf.length);
    if (stem.length < 2) continue;
    if (
      vocab.has(stem) ||
      vocab.has(stem + 'en') ||
      vocab.has(stem + 'n') ||
      vocab.has(stem + 'e')
    )
      return true;
    const ge = stem.replace(/^ge/, '');
    if (ge !== stem && (vocab.has(ge + 'en') || vocab.has(ge + 'n'))) return true;
  }
  return false;
}

const lists: Record<Level, Entry[]> = {
  A1: load('data/a1.json'),
  A2: load('data/a2.json'),
  B1: load('data/b1.json'),
};
const cumulative = (level: Level) => {
  const set = new Set(FUNCTION_WORDS);
  for (const l of LEVELS.slice(0, LEVELS.indexOf(level) + 1))
    for (const e of lists[l]) formsOf(e).forEach((f) => set.add(f));
  return set;
};

const only = process.argv[2];
for (const level of LEVELS) {
  const vocab = cumulative(level);
  const texts: ReadingText[] = JSON.parse(
    readFileSync(`src/content/texts/${level.toLowerCase()}.json`, 'utf8'),
  );
  for (const t of texts) {
    if (only && t.id !== only) continue;
    const tokens = t.body.toLowerCase().match(/[\p{L}]+/gu) ?? [];
    const unknown = [
      ...new Set(tokens.filter((w) => !/^\d/.test(w) && !known(w, vocab))),
    ];
    const pct = Math.round(
      (100 * tokens.filter((w) => known(w, vocab)).length) / tokens.length,
    );
    console.log(`${t.id} ${countWords(t.body)}w ${pct}% known — ${t.title}`);
    if (unknown.length) console.log(`   unmatched: ${unknown.join(', ')}`);
  }
}
