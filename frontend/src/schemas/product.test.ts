import { describe, expect, it } from 'vitest';
import { productSchema } from './product.ts';

/** A valid raw form payload: price/stock arrive as text from the inputs. */
function validInput(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Teclado NovaType K7',
    description: 'Teclado mecánico 75%',
    price: '45999.9',
    stock: '24',
    category: 'perifericos',
    imageUrl: 'https://example.com/k7.png',
    ...overrides,
  };
}

function messages(input: unknown): string[] {
  const result = productSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('productSchema', () => {
  it('parses a valid form value and coerces price/stock to numbers', () => {
    const result = productSchema.safeParse(validInput());

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('se esperaba un parseo exitoso');
    expect(result.data).toEqual({
      name: 'Teclado NovaType K7',
      description: 'Teclado mecánico 75%',
      price: 45999.9,
      stock: 24,
      category: 'perifericos',
      imageUrl: 'https://example.com/k7.png',
    });
  });

  it('trims the name and defaults optional description and imageUrl to empty strings', () => {
    const result = productSchema.safeParse({
      name: '  Mouse NovaClick  ',
      price: '100',
      stock: '1',
      category: 'accesorios',
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('se esperaba un parseo exitoso');
    expect(result.data.name).toBe('Mouse NovaClick');
    expect(result.data.description).toBe('');
    expect(result.data.imageUrl).toBe('');
  });

  it('rejects a missing name with the Spanish message', () => {
    expect(messages(validInput({ name: undefined }))).toContain(
      'El nombre es obligatorio',
    );
  });

  it('rejects a blank name after trimming', () => {
    expect(messages(validInput({ name: '   ' }))).toContain(
      'El nombre es obligatorio',
    );
  });

  it('rejects a price of zero', () => {
    expect(messages(validInput({ price: '0' }))).toContain(
      'El precio debe ser mayor a 0',
    );
  });

  it('rejects an empty price instead of coercing it to zero', () => {
    expect(messages(validInput({ price: '' }))).toContain(
      'El precio debe ser mayor a 0',
    );
  });

  it('rejects a non-numeric price', () => {
    expect(messages(validInput({ price: 'gratis' }))).toContain(
      'El precio debe ser mayor a 0',
    );
  });

  // The trap this schema exists to defeat: `z.coerce.number()` turns '' into 0,
  // which would silently accept an empty stock input as a valid zero.
  it('rejects an empty stock instead of silently accepting it as zero', () => {
    const result = productSchema.safeParse(validInput({ stock: '' }));

    expect(result.success).toBe(false);
    expect(messages(validInput({ stock: '' }))).toContain(
      'El stock debe ser un número entero mayor o igual a 0',
    );
  });

  it('rejects whitespace-only and non-numeric stock', () => {
    expect(messages(validInput({ stock: '   ' }))).toContain(
      'El stock debe ser un número entero mayor o igual a 0',
    );
    expect(messages(validInput({ stock: 'muchos' }))).toContain(
      'El stock debe ser un número entero mayor o igual a 0',
    );
  });

  it('rejects negative and fractional stock', () => {
    expect(messages(validInput({ stock: '-1' }))).toContain(
      'El stock debe ser un número entero mayor o igual a 0',
    );
    expect(messages(validInput({ stock: '1.5' }))).toContain(
      'El stock debe ser un número entero mayor o igual a 0',
    );
  });

  it('accepts a stock of zero', () => {
    const result = productSchema.safeParse(validInput({ stock: '0' }));

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('se esperaba un parseo exitoso');
    expect(result.data.stock).toBe(0);
  });

  it('requires a category, but the backend owns the valid values', () => {
    expect(messages(validInput({ category: undefined }))).toContain(
      'Seleccioná una categoría',
    );
    expect(messages(validInput({ category: '' }))).toContain(
      'Seleccioná una categoría',
    );

    // A slug the backend adds later must not be rejected client-side.
    const result = productSchema.safeParse(validInput({ category: 'novedades' }));
    expect(result.success).toBe(true);
  });

  it('rejects an invalid imageUrl but accepts an empty one', () => {
    expect(messages(validInput({ imageUrl: 'not-a-url' }))).toContain(
      'La URL de la imagen no es válida',
    );

    const result = productSchema.safeParse(validInput({ imageUrl: '' }));
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('se esperaba un parseo exitoso');
    expect(result.data.imageUrl).toBe('');
  });
});
