import { z } from 'zod';

export const registerSchema = z.object({
    nombre: z
        .string('El nombre debe ser una cadena de texto')
        .min(2, 'El nombre es requerido'),

    email: z
        .string('El email debe ser una cadena de texto')
        .email('Email inválido'),

    password: z
        .string('La contraseña debe ser una cadena de texto')
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        .regex(/\d/, 'La contraseña debe contener al menos un número')
});


export const loginSchema = z.object({
    email: z.string('El email debe ser una cadena de texto').email('Email inválido'),
    password: z.string('La contraseña debe ser una cadena de texto')
});