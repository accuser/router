import { error } from './error';

export const serviceUnavailable = (reason?: unknown, init?: ResponseInit) =>
	error(503, 'Service Unavailable', reason, init);
