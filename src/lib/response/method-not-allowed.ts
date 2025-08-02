import { error } from './error';

export const methodNotAllowed = (reason?: unknown) => error(405, 'Method Not Allowed', reason);
