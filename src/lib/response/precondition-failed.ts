import { error } from './error';

export const preconditionFailed = (reason?: unknown, init?: ResponseInit) =>
	error(412, 'Precondition Failed', reason, init);
