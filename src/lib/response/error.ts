export const error = (status: number, statusText: string, reason?: unknown) =>
	new Response(
		JSON.stringify({
			errors: [{ status: String(status), title: reason instanceof Error ? reason.message : reason }]
		}),
		{
			status: status,
			statusText: statusText,
			headers: { 'Content-Type': 'application/json' }
		}
	);
