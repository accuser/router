import { json } from '$lib/response';

export const created = (data?: unknown, { ...init }: ResponseInit = {}) =>
	json(data, {
		...init,
		status: 201
	});
