import { Link, useParams } from 'react-router-dom';
import { textsByLevel } from '../content';
import { LEVELS, countWords, type Level } from '../content/schema';
import { useProgress } from '../store/progress';
import { NotFoundPage } from './NotFoundPage';

export function LevelPage() {
  const level = useParams().level?.toUpperCase() as Level;
  const results = useProgress((s) => s.results);
  if (!LEVELS.includes(level)) return <NotFoundPage />;

  return (
    <div className="stack">
      <p className="text-sm">
        <Link to="/">← All levels</Link>
      </p>
      <h1>Level {level} texts</h1>
      <ol className="text-list">
        {textsByLevel(level).map((t, i) => {
          const r = results[t.id];
          return (
            <li key={t.id}>
              <Link className="card text-card" to={`/text/${t.id}`}>
                <span className="text-card__num">{i + 1}</span>
                <span className="text-card__body">
                  <strong>{t.title}</strong>
                  <span className="text-sm text-muted">
                    {t.topic} · {countWords(t.body)} words · {t.questions.length}{' '}
                    questions
                  </span>
                </span>
                {r ? (
                  <span className="chip">Best {Math.round(r.bestScore * 100)}%</span>
                ) : (
                  <span className="chip chip--soft">New</span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
