import { error } from './error';

export const internalServerError = (reason?: unknown, init?: ResponseInit) =>
	error(500, 'Internal Server Error', reason, init);
