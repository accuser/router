import { error } from './error';

export const unauthorized = (reason?: unknown) => error(401, 'Unauthorized', reason);
