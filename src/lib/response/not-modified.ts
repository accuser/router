import { json } from '$lib/response';

export const notModified: typeof json = (data, init) => json(data, { ...init, status: 304 });
