import { error } from './error';

export const badRequest = (reason?: unknown) => error(400, 'Bad Request', reason);
