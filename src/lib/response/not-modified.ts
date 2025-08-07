export const notModified = (init?: ResponseInit) => new Response(null, { ...init, status: 304 });
