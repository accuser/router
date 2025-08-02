import { json } from '$lib/response';

export const ok = (data?: unknown, { ...init }: ResponseInit = {}) =>
	json(data, {
		...init,
		status: 200
	});
