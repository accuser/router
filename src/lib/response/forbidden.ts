import { error } from './error';

export const forbidden = (reason?: unknown) => error(403, 'Forbidden', reason);
