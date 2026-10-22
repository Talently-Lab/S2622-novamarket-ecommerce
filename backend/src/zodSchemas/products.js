import { z } from 'zod';

export const GET_PRODUCT_SCHEMA = z.object({
    id: z
        .string({ required_error: 'El ID del producto es requerido' })
        .regex(/^[0-9a-fA-F]{24}$/, 'El ID del producto debe ser un ObjectId válido'),
});

//tiene que tener filtro de categoria, nombre, precio, limit, page, ademas un filtro de ordenamiento por precio ascendente o descendente y acendente descendente por fecha de creacion
export const GET_PRODUCTS_SCHEMA = z.object({
    limit: z
        .string({ required_error: 'El límite de productos es requerido' })
        .regex(/^\d+$/, 'El límite de productos debe ser un número entero')
        .transform((val) => parseInt(val, 10))
        .default('10'),
    page: z
        .string({ required_error: 'La página de productos es requerida' })
        .regex(/^\d+$/, 'La página de productos debe ser un número entero')
        .transform((val) => parseInt(val, 10))
        .default('1'),
    category: z.string().optional(),
    name: z.string().optional(),
    minPrice: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .optional(),
    maxPrice: z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .optional(),
    sortByPrice: z.enum(['asc', 'desc']).optional(),
    sortByDate: z.enum(['asc', 'desc']).optional(),
});

const CATEGORIAS = ['accesorios', 'perifericos', 'gadgets'];

const productFields = {
    nombre: z.string('El nombre debe ser una cadena de texto').trim().min(1, 'El nombre es requerido'),
    descripcion: z.string('La descripción debe ser una cadena de texto'),
    precio: z.number('El precio debe ser un número').nonnegative('El precio no puede ser negativo'),
    stock: z.number('El stock debe ser un número').int('El stock debe ser un número entero').nonnegative('El stock no puede ser negativo'),
    categoria: z.enum(CATEGORIAS, { error: `La categoría debe ser una de: ${CATEGORIAS.join(', ')}` }),
    imagenUrl: z.string('La imagen debe ser una cadena de texto'),
};

export const CREATE_PRODUCT_SCHEMA = z.object({
    ...productFields,
    descripcion: productFields.descripcion.optional(),
    stock: productFields.stock.default(0),
    imagenUrl: productFields.imagenUrl.optional(),
});

export const UPDATE_PRODUCT_SCHEMA = z
    .object(productFields)
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    });