export const text = (body?: BodyInit | null, { headers, ...init }: ResponseInit = {}) =>
	new Response(body, {
		...init,
		headers: {
			'Content-Type': 'text/plain',
			...headers
		}
	});
