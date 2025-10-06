// ============================================================================
// BESS Site Survey System v2.0 - Automation Badge Tests
// ============================================================================
import { render, screen } from '@testing-library/react';
import AutomationBadge from '../../components/v2/AutomationBadge';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';

describe('AutomationBadge', () => {
  it('should render AUTO level badge', () => {
    render(<AutomationBadge level="AUTO" />);
    expect(screen.getByText('自動')).toBeInTheDocument();
  });

  it('should render SEMI level badge', () => {
    render(<AutomationBadge level="SEMI" />);
    expect(screen.getByText('半自動')).toBeInTheDocument();
  });

  it('should render MANUAL level badge', () => {
    render(<AutomationBadge level="MANUAL" />);
    expect(screen.getByText('手動')).toBeInTheDocument();
  });

  it('should apply correct color for AUTO', () => {
    const { container } = render(<AutomationBadge level="AUTO" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should apply correct color for SEMI', () => {
    const { container } = render(<AutomationBadge level="SEMI" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('should apply correct color for MANUAL', () => {
    const { container } = render(<AutomationBadge level="MANUAL" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-gray-100');
  });
});
