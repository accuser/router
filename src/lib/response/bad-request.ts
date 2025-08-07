import { error } from './error';

export const badRequest = (reason?: unknown, init?: ResponseInit) => error(400, 'Bad Request', reason, init);
