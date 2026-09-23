import { Link } from 'react-router-dom';
import { textsByLevel } from '../content';
import { LEVELS, WORD_RANGE } from '../content/schema';
import { useProgress } from '../store/progress';

const BLURB = {
  A1: 'Short everyday texts in the present tense: family, food, home, getting around.',
  A2: 'Longer stories about work, travel and health, told in the Perfekt.',
  B1: 'Articles and reports on society, work and daily life, with more complex sentences.',
};

export function HomePage() {
  const results = useProgress((s) => s.results);

  return (
    <div className="stack">
      <section className="hero">
        <p className="eyebrow">DeuLern Lese Reise</p>
        <h1>Read your way into German</h1>
        <p className="lead">
          Pick a text at your level and read it. Tap an underlined word to see its
          meaning, then answer a few questions to check what you understood. You can read
          the texts in any order.
        </p>
      </section>

      <div className="grid">
        {LEVELS.map((level) => {
          const texts = textsByLevel(level);
          const done = texts.filter((t) => results[t.id]).length;
          const next = texts.find((t) => !results[t.id]) ?? texts[0];
          const [min, max] = WORD_RANGE[level];
          return (
            <article key={level} className="card level-card">
              <span className="chip">{level}</span>
              <h2>Level {level}</h2>
              <p className="text-muted">{BLURB[level]}</p>
              <p className="text-sm text-muted">
                {texts.length} texts · {min}–{max} words each
              </p>
              <div
                className="progress-bar"
                aria-label={`${done} of ${texts.length} read`}
              >
                <span style={{ width: `${(100 * done) / texts.length}%` }} />
              </div>
              <p className="text-sm">
                {done} / {texts.length} read
              </p>
              <div className="row">
                <Link
                  className="button button--primary"
                  to={`/level/${level.toLowerCase()}`}
                >
                  All {level} texts
                </Link>
                {next && done < texts.length && (
                  <Link className="button button--ghost" to={`/text/${next.id}`}>
                    Next: {next.title}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
