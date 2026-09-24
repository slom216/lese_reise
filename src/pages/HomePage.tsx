import { Link } from 'react-router-dom';
import { textsByLevel } from '../content';
import { LEVELS, WORD_RANGE } from '../content/schema';
import { useProgress } from '../store/progress';
import heroArt from '../assets/art/hero-reading.webp';
import artA1 from '../assets/art/level-a1-family.webp';
import artA2 from '../assets/art/level-a2-travel.webp';
import artB1 from '../assets/art/level-b1-city.webp';

/** Cut-paper art per level, drawn at native size (or smaller on narrow cards). */
const ART = {
  A1: { src: artA1, width: 410, height: 167 },
  A2: { src: artA2, width: 404, height: 167 },
  B1: { src: artB1, width: 410, height: 161 },
};

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
        <div className="hero__copy">
          <p className="eyebrow">A1–B1 German reading</p>
          <h1>
            Read your way <span className="hero__accent">into German.</span>
          </h1>
          <p className="lead">
            Pick a text at your level and read it. Tap an underlined word to see its
            meaning, then answer a few questions to check what you understood. You can
            read the texts in any order.
          </p>
        </div>
        {/* The slogan printed in the art ("Lesen öffnet Welten") is decoration. */}
        <img className="hero__art" src={heroArt} alt="" width={743} height={351} />
      </section>

      <div className="level-grid">
        {LEVELS.map((level) => {
          const texts = textsByLevel(level);
          const done = texts.filter((t) => results[t.id]).length;
          const next = texts.find((t) => !results[t.id]) ?? texts[0];
          const [min, max] = WORD_RANGE[level];
          return (
            <article key={level} className="card level-card">
              <div className="level-card__frame">
                <img
                  className="level-card__art"
                  src={ART[level].src}
                  alt=""
                  width={ART[level].width}
                  height={ART[level].height}
                />
              </div>
              <span className="chip">{level}</span>
              <h2>Level {level}</h2>
              <p className="level-card__blurb">{BLURB[level]}</p>
              <p className="level-card__meta">
                {texts.length} texts · {min}–{max} words each
              </p>
              <div
                className="progress-bar"
                aria-label={`${done} of ${texts.length} read`}
              >
                <span style={{ width: `${(100 * done) / texts.length}%` }} />
              </div>
              <p>
                {done} / {texts.length} read
              </p>
              <div className="level-card__actions">
                <Link
                  className="button button--primary"
                  to={`/level/${level.toLowerCase()}`}
                >
                  All {level} texts
                </Link>
                {next && done < texts.length && (
                  <Link className="level-card__next" to={`/text/${next.id}`}>
                    <b>Next:</b> {next.title}
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
