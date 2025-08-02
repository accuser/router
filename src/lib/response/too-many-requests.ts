import { error } from './error';

export const tooManyRequests = (reason?: unknown) => error(429, 'Too Many Requests', reason);
