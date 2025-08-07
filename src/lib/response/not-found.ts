import { error } from './error';

export const notFound = (reason?: unknown, init?: ResponseInit) => error(404, 'Not Found', reason, init);
