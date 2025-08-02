export const html = (body?: BodyInit | null, { headers, ...init }: ResponseInit = {}) =>
	new Response(body, {
		...init,
		headers: {
			'Content-Type': 'text/html',
			...headers
		}
	});
