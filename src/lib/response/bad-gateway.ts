import { error } from './error';

export const badGateway = (reason?: unknown) => error(502, 'Bad Gateway', reason);
