import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { Question } from '../content/schema';
import { Quiz } from './Quiz';

const questions: Question[] = [
  { type: 'mc', prompt: 'Wie alt?', options: ['1', '2', '3', '4'], answer: 2 },
  { type: 'tf', prompt: 'Stimmt das?', answer: false, explanation: 'Nein.' },
];

const renderQuiz = (onComplete = vi.fn()) =>
  render(
    <MemoryRouter>
      <Quiz
        questions={questions}
        onComplete={onComplete}
        next={{ to: '/text/a1-02', label: 'Next text' }}
      />
    </MemoryRouter>,
  );

describe('Quiz', () => {
  it('scores the answers and shows corrections', async () => {
    const onComplete = vi.fn();
    renderQuiz(onComplete);
    const check = screen.getByRole('button', { name: 'Check answers' });
    expect(check).toBeDisabled();

    await userEvent.click(screen.getByLabelText('3'));
    await userEvent.click(screen.getByLabelText('Richtig'));
    await userEvent.click(check);

    expect(onComplete).toHaveBeenCalledWith(0.5);
    expect(screen.getByText('1 / 2 correct')).toBeInTheDocument();
    expect(screen.getByText(/Correct answer: Falsch\. Nein\./)).toBeInTheDocument();
  });

  it('congratulates and offers the next text on a perfect score', async () => {
    renderQuiz();
    await userEvent.click(screen.getByLabelText('3'));
    await userEvent.click(screen.getByLabelText('Falsch'));
    await userEvent.click(screen.getByRole('button', { name: 'Check answers' }));

    expect(screen.getByText(/Perfekt/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next text' })).toHaveAttribute(
      'href',
      '/text/a1-02',
    );
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });
});
