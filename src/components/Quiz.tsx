import { useState } from 'react';
import type { Question } from '../content/schema';

type Answer = number | boolean | undefined;

const TF_OPTIONS = [
  { label: 'Richtig', value: true },
  { label: 'Falsch', value: false },
];

function correctLabel(q: Question): string {
  return q.type === 'mc' ? (q.options[q.answer] ?? '') : q.answer ? 'Richtig' : 'Falsch';
}

export function Quiz({
  questions,
  onComplete,
}: {
  questions: Question[];
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Answer[]>(() => questions.map(() => undefined));
  const [submitted, setSubmitted] = useState(false);

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const unanswered = answers.filter((a) => a === undefined).length;

  const submit = () => {
    setSubmitted(true);
    onComplete(correct / questions.length);
  };
  const retry = () => {
    setAnswers(questions.map(() => undefined));
    setSubmitted(false);
  };

  return (
    <form
      className="quiz stack"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {questions.map((q, i) => {
        const choices =
          q.type === 'mc'
            ? q.options.map((label, value) => ({ label, value }))
            : TF_OPTIONS;
        const isRight = answers[i] === q.answer;
        return (
          <fieldset
            key={i}
            className={`card quiz__q${submitted ? (isRight ? ' is-right' : ' is-wrong') : ''}`}
          >
            <legend>
              <span className="quiz__num">{i + 1}.</span> {q.prompt}
              {q.type === 'tf' && (
                <span className="chip chip--soft">Richtig / Falsch</span>
              )}
            </legend>
            <div
              className={
                q.type === 'tf' ? 'quiz__choices quiz__choices--row' : 'quiz__choices'
              }
            >
              {choices.map((c) => (
                <label key={String(c.value)} className="quiz__choice">
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === c.value}
                    disabled={submitted}
                    onChange={() =>
                      setAnswers((a) => a.map((v, j) => (j === i ? c.value : v)))
                    }
                  />
                  {c.label}
                </label>
              ))}
            </div>
            {submitted && (
              <p className="quiz__feedback" role="status">
                {isRight
                  ? '✓ Correct.'
                  : `✗ Correct answer: ${correctLabel(q).replace(/[.!?]$/, '')}.`}
                {q.explanation && ` ${q.explanation}`}
              </p>
            )}
          </fieldset>
        );
      })}

      {submitted ? (
        <div className="card quiz__result" role="status">
          <p className="quiz__score">
            {correct} / {questions.length} correct
          </p>
          <button type="button" className="button button--secondary" onClick={retry}>
            Try again
          </button>
        </div>
      ) : (
        <div className="row">
          <button
            type="submit"
            className="button button--primary"
            disabled={unanswered > 0}
          >
            Check answers
          </button>
          {unanswered > 0 && (
            <span className="text-muted text-sm">
              {unanswered} question(s) left to answer
            </span>
          )}
        </div>
      )}
    </form>
  );
}
