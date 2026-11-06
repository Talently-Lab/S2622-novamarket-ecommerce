import { ApiError } from '../services/api.ts';

/**
 * The auth failures every admin call shares: 401 when the token is gone or
 * expired, 403 when the session is not an admin. Returns `null` for anything
 * else so callers keep their own fallback.
 */
export function adminAuthErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 401) {
    return 'Tu sesión expiró. Volvé a iniciar sesión.';
  }
  if (error.status === 403) {
    return 'No tenés permisos para esta acción.';
  }
  return null;
}

/** Messages for a failed admin write; `notFound` names the resource. */
export interface AdminWriteMessages {
  fallback: string;
  notFound: string;
}

/**
 * Turns a failed admin write into a message the UI can render.
 *
 * The statuses below are the ones the admin endpoints actually return: 401
 * and 403 from the auth middleware, 404 when the row disappeared between the
 * list render and the request. Anything else keeps the caller's fallback.
 */
export function adminWriteErrorMessage(
  error: unknown,
  messages: AdminWriteMessages,
): string {
  const authMessage = adminAuthErrorMessage(error);
  if (authMessage) return authMessage;
  if (error instanceof ApiError && error.status === 404) {
    return messages.notFound;
  }
  return messages.fallback;
}

/**
 * `GET /api/products/:id` answers 404 for an absent row and 400 for an id
 * that is not a Mongo ObjectId (for example the `local-` ids the removed
 * local driver minted). Both mean "this product cannot be edited".
 */
export function isMissingProductError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 400)
  );
}
