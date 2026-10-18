import { z } from 'zod';

/**
 * Rejects input that would silently coerce to a number when the field is
 * empty. `z.coerce.number()` maps '' to 0 (because `Number('') === 0`), so a
 * blank stock input would become a valid 0. Normalizing blank input (and
 * null) to NaN forces the numeric validators to fail instead.
 *
 * The numeric checks live inside the `z.preprocess` pipe: `z.preprocess`
 * returns a pipe wrapper, so `.int()` / `.min()` cannot be chained onto its
 * result — they belong on the wrapped `z.coerce.number()` schema.
 */
function blankToNaN(value: unknown): unknown {
  if (value === null) return Number.NaN;
  if (typeof value === 'string' && value.trim() === '') return Number.NaN;
  return value;
}

const PRICE_MESSAGE = 'El precio debe ser mayor a 0';
const STOCK_MESSAGE = 'El stock debe ser un número entero mayor o igual a 0';

/**
 * Admin product form schema (SN-251). Field names are the English domain
 * names from `Product`; validation messages are user-facing Spanish copy.
 * The shape mirrors `ProductInput` in `productService`, so a parsed form
 * value drops straight into the admin data layer.
 */
export const productSchema = z.object({
  name: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio'),
  description: z.string().optional().default(''),
  price: z.preprocess(
    blankToNaN,
    z
      .coerce.number({ error: PRICE_MESSAGE })
      .refine((value) => Number.isFinite(value) && value > 0, PRICE_MESSAGE),
  ),
  stock: z.preprocess(
    blankToNaN,
    z.coerce
      .number({ error: STOCK_MESSAGE })
      .int(STOCK_MESSAGE)
      .min(0, STOCK_MESSAGE),
  ),
  // Only "something was chosen" is enforced here: the valid values are the
  // backend enum (`GET /api/formdata/products`), so hardcoding them would
  // reject any category the backend adds later.
  category: z
    .string({ error: 'Seleccioná una categoría' })
    .trim()
    .min(1, 'Seleccioná una categoría'),
  imageUrl: z
    .string()
    .optional()
    .default('')
    .refine(
      (value) => value === '' || z.url().safeParse(value).success,
      'La URL de la imagen no es válida',
    ),
});

export type ProductFormValues = z.infer<typeof productSchema>;
