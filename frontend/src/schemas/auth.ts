import { z } from 'zod';

// Validation messages are user-facing UI copy, so they stay in Spanish
// (identifiers and comments stay in English).
//
// These rules MIRROR the backend contract in `backend/src/zodSchemas/auth.js`.
// A client that accepts what the server rejects makes the user fill the whole
// form only to be turned down at submit time with a message that contradicts
// what the field just told them. If the backend changes, change it here too.
// Client-only rules are marked as such below.

const PASSWORD_MIN_LENGTH = 8;

/** Email rule shared by login and register (backend: string + email). */
const emailRule = z
  .string()
  .min(1, 'El email es obligatorio')
  .email('Ingresá un email válido');

/**
 * Register password rule, mirroring the backend: at least 8 characters with an
 * uppercase letter, a lowercase letter and a digit.
 */
const registerPasswordRule = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  )
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(/\d/, 'La contraseña debe contener al menos un número');

export const loginSchema = z.object({
  email: emailRule,
  // The backend login schema only requires a string, so no length rule here:
  // blocking a short password would reject a credential the server accepts.
  // `min(1)` is only a guard so an empty field fails in place instead of
  // taking a round trip that answers "credenciales inválidas".
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    // The backend validates `nombre` with min(2), so a one-character name must
    // not pass here either.
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: emailRule,
    password: registerPasswordRule,
    // Client-only: the backend never receives this field.
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
