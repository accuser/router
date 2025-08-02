import { error } from './error';

export const notImplemented = (reason?: unknown) => error(501, 'Not Implemented', reason);
