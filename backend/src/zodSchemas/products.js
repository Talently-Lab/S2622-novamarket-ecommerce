import { z } from 'zod';

export const GET_PRODUCT_SCHEMA = z.object({
    id: z
        .string({ required_error: 'El ID del producto es requerido' })
        .regex(/^[0-9a-fA-F]{24}$/, 'El ID del producto debe ser un ObjectId válido'),
});

export const loginSchema = z.object({
    email: z.string('El email debe ser una cadena de texto').email('Email inválido'),
    password: z.string('La contraseña debe ser una cadena de texto')
});