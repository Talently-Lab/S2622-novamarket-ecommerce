import { describe, expect, it } from 'vitest';
import { shippingAddressSchema } from './checkout.ts';

const VALID = {
  calle: 'Av. Corrientes 1234',
  ciudad: 'CABA',
  provincia: 'Buenos Aires',
  codigoPostal: '1043',
};

describe('shippingAddressSchema', () => {
  it('accepts a complete address and trims the values', () => {
    const result = shippingAddressSchema.safeParse({
      calle: '  Av. Corrientes 1234 ',
      ciudad: 'CABA',
      provincia: 'Buenos Aires',
      codigoPostal: '1043',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.calle).toBe('Av. Corrientes 1234');
    }
  });

  it('rejects every empty field with its Spanish message', () => {
    const result = shippingAddressSchema.safeParse({
      calle: '   ',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toEqual([
        'Ingresá la calle y el número',
        'Ingresá la ciudad',
        'Ingresá la provincia',
        'Ingresá el código postal',
      ]);
    }
  });

  it('matches the backend rule and accepts non-numeric postal codes', () => {
    expect(
      shippingAddressSchema.safeParse({ ...VALID, codigoPostal: 'C1425ABC' })
        .success,
    ).toBe(true);
  });
});
