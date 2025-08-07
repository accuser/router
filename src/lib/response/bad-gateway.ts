import { error } from './error';

export const badGateway = (reason?: unknown, init?: ResponseInit) => error(502, 'Bad Gateway', reason, init);
