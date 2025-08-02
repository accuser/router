import { error } from './error';

export const notFound = (reason?: unknown) => error(404, 'Not Found', reason);
