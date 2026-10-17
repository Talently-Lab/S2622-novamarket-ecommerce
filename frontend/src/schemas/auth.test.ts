import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.ts';

/**
 * The auth schemas feed the login/register field errors straight into the UI,
 * so their messages are user-facing copy and must stay in Spanish.
 */
describe('auth schemas UI copy', () => {
  it('reports the login field errors in Spanish', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });

    expect(result.success).toBe(false);
    if (result.success) return;
    const messages = result.error.issues.map((issue) => issue.message);

    expect(messages).toContain('El email es obligatorio');
    expect(messages).toContain(
      'La contraseña debe tener al menos 6 caracteres',
    );
  });

  it('reports an invalid email in Spanish', () => {
    const result = loginSchema.safeParse({
      email: 'no-es-un-email',
      password: 'secreta',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues.map((issue) => issue.message)).toContain(
      'Ingresá un email válido',
    );
  });

  it('reports the register field errors and the mismatch in Spanish', () => {
    const result = registerSchema.safeParse({
      name: '',
      email: '',
      password: 'secreta',
      confirmPassword: 'otra',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    const messages = result.error.issues.map((issue) => issue.message);

    expect(messages).toContain('El nombre es obligatorio');
    expect(messages).toContain('El email es obligatorio');
    expect(messages).toContain('Las contraseñas no coinciden');
  });
});
