import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

//agregue la validacion para que no se puedan repetir productos en el array de items, ya que deberian auto sumarse, no repetirse
export const CREATE_ORDER_SCHEMA = z.object({
    items: z.array(z.object({
        productId: z.string().nonempty('productId is required'),
        cantidad: z.number().int().positive('cantidad must be a positive integer')
    }))
    .nonempty('items array cannot be empty')
    .refine((items) => {
        const ids = items.map(item => item.productId);
        return ids.length === new Set(ids).size;
    }, {
        message: "No se permiten productos duplicados en el carrito, se deben agrupar las cantidades"
    }),
    total: z.number().nonnegative('total must be a non-negative number'),
    direccionEnvio: z.object({
        calle: z.string().nonempty('calle is required'),
        ciudad: z.string().nonempty('ciudad is required'),
        provincia: z.string().nonempty('provincia is required'),
        codigoPostal: z.string().nonempty('codigoPostal is required')
    })
})

// PUT /api/orders/:id/status  -> params
export const ORDER_ID_PARAMS_SCHEMA = z.object({
    id: z
        .string('El ID del pedido es requerido')
        .regex(OBJECT_ID_REGEX, 'El ID del pedido debe ser un ObjectId válido')
});

// PUT /api/orders/:id/status  -> body
export const UPDATE_ORDER_STATUS_SCHEMA = z.object({
    estado: z.enum(ORDER_STATUSES, {
        error: `El estado es requerido y debe ser uno de: ${ORDER_STATUSES.join(', ')}`
    })
});