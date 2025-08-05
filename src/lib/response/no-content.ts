export const noContent = (init?: ResponseInit) => new Response(null, { ...init, status: 204 });
