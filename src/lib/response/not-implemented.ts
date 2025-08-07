import { error } from './error';

export const notImplemented = (reason?: unknown, init?: ResponseInit) => error(501, 'Not Implemented', reason, init);
