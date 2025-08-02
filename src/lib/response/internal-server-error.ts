import { error } from './error';

export const internalServerError = (reason?: unknown) =>
	error(500, 'Internal Server Error', reason);
