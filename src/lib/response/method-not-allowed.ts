import { error } from './error';

export const methodNotAllowed = (reason?: unknown, init?: ResponseInit) =>
	error(405, 'Method Not Allowed', reason, init);
