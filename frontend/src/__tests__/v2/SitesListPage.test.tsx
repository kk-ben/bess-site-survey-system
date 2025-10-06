// ============================================================================
// BESS Site Survey System v2.0 - Sites List Page Tests
// ============================================================================
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SitesListPage from '../../pages/v2/SitesListPage';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';

jest.mock('../../services/v2/site.service');

describe('SitesListPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render sites list page', () => {
    renderWithRouter(<SitesListPage />);
    expect(screen.getByText(/候補地一覧/i)).toBeInTheDocument();
  });

  it('should display filter controls', () => {
    renderWithRouter(<SitesListPage />);
    expect(screen.getByText(/フィルター/i)).toBeInTheDocument();
  });
});
