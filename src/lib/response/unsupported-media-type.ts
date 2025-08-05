import { error } from './error';

export const unsupportedMediaType = (reason?: unknown) => error(415, 'Unsupported Media Type', reason);
