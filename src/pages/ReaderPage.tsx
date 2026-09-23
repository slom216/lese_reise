import { Link, useParams } from 'react-router-dom';
import { textById, textsByLevel } from '../content';
import { countWords } from '../content/schema';
import { GlossaryText } from '../components/GlossaryText';
import { Quiz } from '../components/Quiz';
import { useProgress } from '../store/progress';
import { NotFoundPage } from './NotFoundPage';

export function ReaderPage() {
  const { id = '' } = useParams();
  const text = textById(id);
  const result = useProgress((s) => s.results[id]);
  const complete = useProgress((s) => s.complete);
  const fontSize = useProgress((s) => s.settings.fontSize);
  if (!text) return <NotFoundPage />;

  const siblings = textsByLevel(text.level);
  const index = siblings.findIndex((t) => t.id === text.id);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const levelPath = `/level/${text.level.toLowerCase()}`;

  return (
    <article className="reader stack" data-font={fontSize}>
      <p className="text-sm">
        <Link to={levelPath}>← Level {text.level} texts</Link>
      </p>
      <header className="stack stack--tight">
        <div className="row">
          <span className="chip">{text.level}</span>
          <span className="text-sm text-muted">
            {text.topic} · {countWords(text.body)} words
            {result && ` · best score ${Math.round(result.bestScore * 100)}%`}
          </span>
        </div>
        <h1>{text.title}</h1>
      </header>

      <GlossaryText text={text} />

      <section className="stack stack--tight" aria-labelledby="glossary-heading">
        <h2 id="glossary-heading">Wörter zum Text</h2>
        <p className="text-muted text-sm">Words that might be new at this level.</p>
        <dl className="glossary">
          {text.glossary.map((g) => (
            <div key={g.german} className="glossary__row">
              <dt lang="de">{g.german}</dt>
              <dd>{g.english}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="stack" aria-labelledby="quiz-heading">
        <h2 id="quiz-heading">Hast du alles verstanden?</h2>
        {/* key resets the quiz state when moving to another text */}
        <Quiz
          key={text.id}
          questions={text.questions}
          onComplete={(s) => complete(text.id, s)}
        />
      </section>

      <nav className="row reader__pager" aria-label="More texts">
        {prev && (
          <Link className="button button--ghost" to={`/text/${prev.id}`}>
            ← {prev.title}
          </Link>
        )}
        <span className="spacer" />
        {next ? (
          <Link className="button button--secondary" to={`/text/${next.id}`}>
            {next.title} →
          </Link>
        ) : (
          <Link className="button button--secondary" to={levelPath}>
            Back to level {text.level}
          </Link>
        )}
      </nav>
    </article>
  );
}
