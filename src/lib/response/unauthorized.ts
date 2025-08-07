import { error } from './error';

export const unauthorized = (reason?: unknown, init?: ResponseInit) => error(401, 'Unauthorized', reason, init);
