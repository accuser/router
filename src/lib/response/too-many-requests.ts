import { error } from './error';

export const tooManyRequests = (reason?: unknown, init?: ResponseInit) => error(429, 'Too Many Requests', reason, init);
