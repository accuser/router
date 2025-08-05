import { json } from './json';

export const error = (status: number, statusText?: string, reason?: unknown) =>
	json(
		{
			errors: [
				{
					status: String(status),
					title: statusText,
					description: reason instanceof Error ? reason.message : reason ? String(reason) : undefined,
				},
			],
		},
		{ status, statusText }
	);
