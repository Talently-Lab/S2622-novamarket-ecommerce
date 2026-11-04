import { z } from 'zod';

// Validation messages are user-facing UI copy, so they stay in Spanish
// (identifiers and comments stay in English).
//
// These rules MIRROR the backend contract in `backend/src/zodSchemas/order.js`:
// every address field is a non-empty string. A stricter client rule would
// reject input the server accepts, so no extra format rules are added here.
export const shippingAddressSchema = z.object({
  calle: z.string().trim().min(1, 'Ingresá la calle y el número'),
  ciudad: z.string().trim().min(1, 'Ingresá la ciudad'),
  provincia: z.string().trim().min(1, 'Ingresá la provincia'),
  codigoPostal: z.string().trim().min(1, 'Ingresá el código postal'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const EMPTY_ADDRESS: ShippingAddress = {
  calle: '',
  ciudad: '',
  provincia: '',
  codigoPostal: '',
};
