import { json } from '$lib/response';

export const noContent = ({ ...init }: ResponseInit = {}) =>
	json(undefined, {
		...init,
		status: 204
	});
