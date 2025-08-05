import { json } from '$lib/response';

export const created: typeof json = (data, init) => json(data, { ...init, status: 201 });
