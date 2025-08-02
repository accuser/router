import { error } from './error';

export const serviceUnavailable = (reason?: unknown) => error(503, 'Service Unavailable', reason);
