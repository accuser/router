import { error } from './error';

export const unsupportedMediaType = (reason?: unknown, init?: ResponseInit) =>
	error(415, 'Unsupported Media Type', reason, init);
