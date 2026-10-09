import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { system } from '../../theme/system.ts';
import { SharedInput } from './Input.tsx';

function renderSharedInput(node: ReactNode) {
  render(<ChakraProvider value={system}>{node}</ChakraProvider>);
}

describe('SharedInput', () => {
  it('renders the default state with label and helper text', () => {
    renderSharedInput(
      <SharedInput
        label="Correo electrónico"
        placeholder="Ingresa tu correo"
        helperText="Usaremos este correo para contactarte"
      />,
    );

    const input = screen.getByLabelText('Correo electrónico');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveClass('novamarket-input');
    expect(input).toHaveAttribute('data-visual-state', 'default');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(
      screen.getByText('Usaremos este correo para contactarte'),
    ).toBeInTheDocument();
    expect(input.getAttribute('aria-describedby')).toContain('-helper');
  });

  it('renders the focus state on demand', () => {
    renderSharedInput(
      <SharedInput label="Nombre" placeholder="Ingresa tu nombre" visualState="focus" />,
    );

    expect(screen.getByLabelText('Nombre')).toHaveAttribute(
      'data-visual-state',
      'focus',
    );
  });

  it('renders the error state with error text and accessibility wiring', () => {
    renderSharedInput(
      <SharedInput
        label="Correo electrónico"
        helperText="Usaremos este correo para contactarte"
        errorText="Ingresa un correo válido"
        isInvalid
      />,
    );

    const input = screen.getByLabelText('Correo electrónico');
    expect(input).toHaveAttribute('data-visual-state', 'error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument();
    expect(
      screen.queryByText('Usaremos este correo para contactarte'),
    ).not.toBeInTheDocument();
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('-error');
    expect(document.getElementById(describedBy)).toHaveTextContent(
      'Ingresa un correo válido',
    );
  });

  it('renders the completed state', () => {
    renderSharedInput(
      <SharedInput label="Nombre" defaultValue="Ada Lovelace" isCompleted />,
    );

    const input = screen.getByLabelText('Nombre');
    expect(input).toHaveAttribute('data-visual-state', 'completed');
    expect(input).toHaveValue('Ada Lovelace');
  });

  it('renders the disabled state', () => {
    renderSharedInput(
      <SharedInput label="Nombre" placeholder="Ingresa tu nombre" isDisabled />,
    );

    const input = screen.getByLabelText('Nombre');
    expect(input).toHaveAttribute('data-visual-state', 'disabled');
    expect(input).toBeDisabled();
  });

  it('renders the optional right icon', () => {
    renderSharedInput(
      <SharedInput
        label="Contraseña"
        type="password"
        icon={<span data-testid="input-icon">ojo</span>}
      />,
    );

    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });
});
