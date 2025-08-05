import { json } from '$lib/response';

export const accepted: typeof json = (data, init) => json(data, { ...init, status: 202 });
