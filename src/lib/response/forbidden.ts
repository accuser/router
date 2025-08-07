import { error } from './error';

export const forbidden = (reason?: unknown, init?: ResponseInit) => error(403, 'Forbidden', reason, init);
