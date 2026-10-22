import { z } from 'zod';

//agregale validacion para que no se puedan repetir productos en el array de items, ya que deberian auto sumarse, no repetirse
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