import { json } from '$lib/response';

export const ok: typeof json = (data, init) => json(data, { ...init, status: 200 });
