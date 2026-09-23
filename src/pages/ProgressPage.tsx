import { Link } from 'react-router-dom';
import { textsByLevel } from '../content';
import { LEVELS } from '../content/schema';
import { MonthCalendar } from '../components/MonthCalendar';
import { streaks } from '../lib/streak';
import { useProgress } from '../store/progress';

export function ProgressPage() {
  const results = useProgress((s) => s.results);
  const activity = useProgress((s) => s.activity);
  const { current, best } = streaks(
    Object.keys(activity).filter((d) => (activity[d] ?? 0) > 0),
  );
  const total = Object.values(activity).reduce((a, b) => a + b, 0);

  return (
    <div className="stack">
      <h1>Your progress</h1>

      <div className="stats">
        <div className="card stat">
          <span className="stat__value">{current}</span>
          <span className="stat__label">Day streak</span>
        </div>
        <div className="card stat">
          <span className="stat__value">{best}</span>
          <span className="stat__label">Best streak</span>
        </div>
        <div className="card stat">
          <span className="stat__value">{Object.keys(results).length}</span>
          <span className="stat__label">Texts read</span>
        </div>
        <div className="card stat">
          <span className="stat__value">{total}</span>
          <span className="stat__label">Quizzes finished</span>
        </div>
      </div>

      <section className="card stack">
        <h2>Reading calendar</h2>
        <MonthCalendar activity={activity} />
      </section>

      {LEVELS.map((level) => {
        const texts = textsByLevel(level);
        const done = texts.filter((t) => results[t.id]).length;
        return (
          <section key={level} className="stack stack--tight">
            <h2>
              {level}{' '}
              <span className="text-muted text-sm">
                {done} / {texts.length} read
              </span>
            </h2>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Text</th>
                  <th scope="col">Best</th>
                  <th scope="col">Last</th>
                  <th scope="col">Tries</th>
                </tr>
              </thead>
              <tbody>
                {texts.map((t) => {
                  const r = results[t.id];
                  return (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/text/${t.id}`}>{t.title}</Link>
                      </td>
                      <td>{r ? `${Math.round(r.bestScore * 100)}%` : '—'}</td>
                      <td>{r ? `${Math.round(r.lastScore * 100)}%` : '—'}</td>
                      <td>{r?.attempts ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
