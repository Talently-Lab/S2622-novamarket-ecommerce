import { z } from 'zod';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// POST /api/cart  -> body
export const ADD_TO_CART_SCHEMA = z.object({
    productId: z
        .string('El productId es requerido')
        .regex(OBJECT_ID_REGEX, 'El productId debe ser un ObjectId válido'),
    cantidad: z
        .number('La cantidad debe ser un número')
        .int('La cantidad debe ser un número entero')
        .positive('La cantidad debe ser mayor a 0')
        .default(1),
});

// PATCH /api/cart/:id  -> body
export const UPDATE_CART_ITEM_SCHEMA = z.object({
    cantidad: z
        .number('La cantidad es requerida y debe ser un número')
        .int('La cantidad debe ser un número entero')
        .positive('La cantidad debe ser mayor a 0'),
});

// PATCH /api/cart/:id y DELETE /api/cart/:id  -> params
// El :id es el ID del PRODUCTO que está dentro del carrito.
export const CART_ITEM_PARAMS_SCHEMA = z.object({
    id: z
        .string('El ID del producto es requerido')
        .regex(OBJECT_ID_REGEX, 'El ID del producto debe ser un ObjectId válido'),
});
