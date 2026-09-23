import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Question } from '../content/schema';
import { Quiz } from './Quiz';

const questions: Question[] = [
  { type: 'mc', prompt: 'Wie alt?', options: ['1', '2', '3', '4'], answer: 2 },
  { type: 'tf', prompt: 'Stimmt das?', answer: false, explanation: 'Nein.' },
];

describe('Quiz', () => {
  it('scores the answers and shows corrections', async () => {
    const onComplete = vi.fn();
    render(<Quiz questions={questions} onComplete={onComplete} />);
    const check = screen.getByRole('button', { name: 'Check answers' });
    expect(check).toBeDisabled();

    await userEvent.click(screen.getByLabelText('3'));
    await userEvent.click(screen.getByLabelText('Richtig'));
    await userEvent.click(check);

    expect(onComplete).toHaveBeenCalledWith(0.5);
    expect(screen.getByText('1 / 2 correct')).toBeInTheDocument();
    expect(screen.getByText(/Correct answer: Falsch\. Nein\./)).toBeInTheDocument();
  });
});
