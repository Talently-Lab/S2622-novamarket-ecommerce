import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.ts';

/**
 * The auth schemas feed the login/register field errors straight into the UI,
 * so their messages are user-facing copy and must stay in Spanish.
 *
 * The rules are a mirror of `backend/src/zodSchemas/auth.js`: a client that
 * accepts what the server rejects is a bug, not a nicety. The cases below pin
 * both halves of that contract.
 */
function messagesOf(result: {
  success: boolean;
  error?: { issues: { message: string }[] };
}): string[] {
  return result.success ? [] : (result.error?.issues.map((i) => i.message) ?? []);
}

describe('loginSchema', () => {
  it('reports the login field errors in Spanish', () => {
    const messages = messagesOf(loginSchema.safeParse({ email: '', password: '' }));

    expect(messages).toContain('El email es obligatorio');
    expect(messages).toContain('La contraseña es obligatoria');
  });

  it('reports an invalid email in Spanish', () => {
    const messages = messagesOf(
      loginSchema.safeParse({ email: 'no-es-un-email', password: 'x' }),
    );

    expect(messages).toContain('Ingresá un email válido');
  });

  it('does not block in the client a short password the backend accepts', () => {
    // The backend login schema only requires a string; enforcing a length here
    // would lock out a credential the server would have accepted.
    const result = loginSchema.safeParse({
      email: 'nova@email.com',
      password: 'x',
    });

    expect(result.success).toBe(true);
  });
});

describe('registerSchema', () => {
  const validRegister = {
    name: 'Nova',
    email: 'nova@email.com',
    password: 'Nova1234',
    confirmPassword: 'Nova1234',
  };

  it('accepts a payload the backend accepts', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it('rejects a one-character name, which the backend also rejects', () => {
    const messages = messagesOf(
      registerSchema.safeParse({ ...validRegister, name: 'J' }),
    );

    expect(messages).toContain('El nombre debe tener al menos 2 caracteres');
  });

  it('rejects a password shorter than 8 characters', () => {
    const messages = messagesOf(
      registerSchema.safeParse({
        ...validRegister,
        password: 'Nova123',
        confirmPassword: 'Nova123',
      }),
    );

    expect(messages).toContain('La contraseña debe tener al menos 8 caracteres');
  });

  it('requires an uppercase, a lowercase and a digit, like the backend', () => {
    const withoutUppercase = messagesOf(
      registerSchema.safeParse({
        ...validRegister,
        password: 'nova1234',
        confirmPassword: 'nova1234',
      }),
    );
    expect(withoutUppercase).toContain(
      'La contraseña debe contener al menos una letra mayúscula',
    );

    const withoutLowercase = messagesOf(
      registerSchema.safeParse({
        ...validRegister,
        password: 'NOVA1234',
        confirmPassword: 'NOVA1234',
      }),
    );
    expect(withoutLowercase).toContain(
      'La contraseña debe contener al menos una letra minúscula',
    );

    const withoutDigit = messagesOf(
      registerSchema.safeParse({
        ...validRegister,
        password: 'NovaNova',
        confirmPassword: 'NovaNova',
      }),
    );
    expect(withoutDigit).toContain(
      'La contraseña debe contener al menos un número',
    );
  });

  it('reports the mismatch in Spanish (client-only rule)', () => {
    const messages = messagesOf(
      registerSchema.safeParse({
        ...validRegister,
        confirmPassword: 'Otra1234',
      }),
    );

    expect(messages).toContain('Las contraseñas no coinciden');
  });
});
