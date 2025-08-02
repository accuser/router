export const json = (data?: unknown, { headers, ...init }: ResponseInit = {}) =>
	new Response(data === undefined ? data : JSON.stringify(data), {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...headers
		}
	});
