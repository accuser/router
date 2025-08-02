import { json } from '$lib/response';

export const accepted = (data?: unknown, { ...init }: ResponseInit = {}) =>
	json(data, {
		...init,
		status: 202
	});
