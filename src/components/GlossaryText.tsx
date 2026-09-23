import { useState, type ReactNode } from 'react';
import { findGlossary, glossaryNeedle, type ReadingText } from '../content/schema';

type Hit = { start: number; end: number; entry: ReadingText['glossary'][number] };

/** Marks the first occurrence of each glossary entry; later overlapping hits are dropped. */
function paragraphHits(paragraphs: string[], glossary: ReadingText['glossary']): Hit[][] {
  const used = new Set<number>();
  return paragraphs.map((p) => {
    const hits: Hit[] = [];
    glossary.forEach((entry, i) => {
      if (used.has(i)) return;
      const needle = glossaryNeedle(entry);
      const start = findGlossary(p, needle);
      if (start < 0) return;
      const end = start + needle.length;
      if (hits.some((h) => start < h.end && end > h.start)) return;
      used.add(i);
      hits.push({ start, end, entry });
    });
    return hits.sort((a, b) => a.start - b.start);
  });
}

export function GlossaryText({ text }: { text: ReadingText }) {
  const [open, setOpen] = useState<string | null>(null);
  const paragraphs = text.body.split(/\n\n+/);
  const hits = paragraphHits(paragraphs, text.glossary);

  return (
    <div className="reading" onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}>
      {paragraphs.map((p, pi) => {
        const parts: ReactNode[] = [];
        let pos = 0;
        for (const h of hits[pi] ?? []) {
          const key = `${pi}-${h.start}`;
          const isOpen = open === key;
          parts.push(p.slice(pos, h.start));
          parts.push(
            <span className="gloss" key={key}>
              <button
                type="button"
                className="gloss__word"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : key)}
              >
                {p.slice(h.start, h.end)}
              </button>
              {isOpen && (
                <span className="gloss__tip" role="status">
                  <strong>{h.entry.german}</strong> — {h.entry.english}
                </span>
              )}
            </span>,
          );
          pos = h.end;
        }
        parts.push(p.slice(pos));
        return (
          <p key={pi} style={{ whiteSpace: 'pre-line' }}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}
