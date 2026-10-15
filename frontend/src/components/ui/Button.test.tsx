import { render, screen } from '@testing-library/react';
import { Button, ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { system } from '../../theme/system.ts';

function renderButton(node: ReactNode) {
  render(<ChakraProvider value={system}>{node}</ChakraProvider>);
}

describe('Button Figma recipe', () => {
  it('renders the primary variant by default', () => {
    renderButton(<Button>Continuar</Button>);

    const button = screen.getByRole('button', { name: 'Continuar' });
    expect(button).toHaveClass('novamarket-button');
    expect(button).toBeEnabled();
  });

  it('renders the secondary variant', () => {
    renderButton(<Button variant="secondary">Cancelar</Button>);

    const button = screen.getByRole('button', { name: 'Cancelar' });
    expect(button).toHaveClass('novamarket-button');
    expect(button).toBeEnabled();
  });

  it('renders the link variant', () => {
    renderButton(<Button variant="link">Ver detalles</Button>);

    expect(screen.getByRole('button', { name: 'Ver detalles' })).toHaveClass(
      'novamarket-button',
    );
  });

  it('renders the disabled state', () => {
    renderButton(
      <Button variant="primary" disabled>
        Continuar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Continuar' });
    expect(button).toHaveClass('novamarket-button');
    expect(button).toBeDisabled();
  });
});
