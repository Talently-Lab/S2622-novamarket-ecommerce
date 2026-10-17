import { render, screen, fireEvent } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollToTop from './ScrollToTop.tsx';

beforeEach(() => {
  window.scrollTo = vi.fn();
});

function renderWithScrollToTop(initialEntries: string[], linkTo: string) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ScrollToTop />
      <Link to={linkTo}>go</Link>
      <Routes>
        <Route path="/" element={<p>home</p>} />
        <Route path="/productos" element={<p>products</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ScrollToTop', () => {
  it('scrolls to top when the pathname changes', () => {
    renderWithScrollToTop(['/'], '/productos');
    vi.mocked(window.scrollTo).mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'go' }));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('scrolls to top when only the search params change', () => {
    renderWithScrollToTop(['/productos'], '/productos?categoria=perifericos');
    vi.mocked(window.scrollTo).mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'go' }));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
