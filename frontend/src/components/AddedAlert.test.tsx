import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AddedAlert from './AddedAlert.tsx';

describe('AddedAlert', () => {
  it('renders nothing while hidden', () => {
    const { container } = render(<AddedAlert visible={false} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('announces the added product', () => {
    render(<AddedAlert visible />);

    expect(screen.getByRole('status')).toHaveTextContent('Agregado al carrito');
  });

  it('docks below the desktop navbar so it never covers the cart button', () => {
    render(<AddedAlert visible />);

    const alert = screen.getByRole('status');

    // The desktop navbar is 80px tall: top-24 (96px) clears it with a gap.
    expect(alert).toHaveClass('md:top-24');
    expect(alert).not.toHaveClass('md:top-4');
    // Mobile keeps the full-width top placement.
    expect(alert).toHaveClass('top-4');
  });
});
