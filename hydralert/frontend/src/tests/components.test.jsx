import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RiskBadge from '../components/RiskBadge';
import IntakeButtons from '../components/IntakeButtons';

// ─── Mock API & Toast context ──────────────────────────────
vi.mock('../utils/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { log: { amountMl: 250, _id: '1' } } }),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

// ─── RiskBadge Tests ──────────────────────────────────────
describe('RiskBadge', () => {
  it('renders compact badge with correct label for low risk', () => {
    render(<RiskBadge score={15} category="low" recommendedMl={250} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('renders compact badge for moderate risk', () => {
    render(<RiskBadge score={55} category="moderate" recommendedMl={500} />);
    expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
  });

  it('renders compact badge for high risk', () => {
    render(<RiskBadge score={80} category="high" recommendedMl={750} />);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });

  it('renders large badge with score and recommendation', () => {
    render(<RiskBadge large score={72} category="high" recommendedMl={750} />);
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText(/750 ml/)).toBeInTheDocument();
    expect(screen.getByText(/lower your risk/i)).toBeInTheDocument();
  });

  it('includes ARIA label for accessibility', () => {
    render(<RiskBadge large score={30} category="moderate" recommendedMl={500} />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label');
    expect(el.getAttribute('aria-label')).toContain('moderate');
  });

  it('defaults gracefully to low risk with missing props', () => {
    render(<RiskBadge />);
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });
});

// ─── IntakeButtons Tests ──────────────────────────────────
describe('IntakeButtons', () => {
  it('renders all quick-amount buttons', () => {
    render(<IntakeButtons />);
    expect(screen.getByLabelText('Log 150 ml of water')).toBeInTheDocument();
    expect(screen.getByLabelText('Log 250 ml of water')).toBeInTheDocument();
    expect(screen.getByLabelText('Log 500 ml of water')).toBeInTheDocument();
    expect(screen.getByLabelText('Log 750 ml of water')).toBeInTheDocument();
  });

  it('renders custom input field and log button', () => {
    render(<IntakeButtons />);
    expect(screen.getByLabelText('Enter custom water amount in millilitres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log custom amount/i })).toBeInTheDocument();
  });

  it('custom log button is disabled when input is empty', () => {
    render(<IntakeButtons />);
    const logBtn = screen.getByRole('button', { name: /log custom amount/i });
    expect(logBtn).toBeDisabled();
  });

  it('enables custom log button when value is entered', () => {
    render(<IntakeButtons />);
    const input = screen.getByLabelText('Enter custom water amount in millilitres');
    const logBtn = screen.getByRole('button', { name: /log custom amount/i });
    fireEvent.change(input, { target: { value: '300' } });
    expect(logBtn).not.toBeDisabled();
  });

  it('calls onLogged callback when a quick button is clicked', async () => {
    const onLogged = vi.fn();
    render(<IntakeButtons onLogged={onLogged} />);
    fireEvent.click(screen.getByLabelText('Log 250 ml of water'));
    // Wait for async call
    await new Promise(r => setTimeout(r, 100));
    expect(onLogged).toHaveBeenCalled();
  });
});
