import { describe, expect, it } from 'vitest';
import { error } from './error';

describe('error', () => {
	it('should create error response with status and statusText', async () => {
		const response = error(404, 'Not Found');

		expect(response.status).toBe(404);
		expect(response.statusText).toBe('Not Found');
		expect(response.headers.get('Content-Type')).toBe('application/json');

		const body = await response.json();
		expect(body).toEqual({
			errors: [
				{
					status: '404',
					title: 'Not Found',
					description: undefined,
				},
			],
		});
	});

	it('should create error response with only status', async () => {
		const response = error(500);

		expect(response.status).toBe(500);
		expect(response.statusText).toBe('');

		const body = await response.json();
		expect(body).toEqual({
			errors: [
				{
					status: '500',
					title: undefined,
					description: undefined,
				},
			],
		});
	});

	it('should handle Error instance as reason', async () => {
		const testError = new Error('Something went wrong');
		const response = error(400, 'Bad Request', testError);

		expect(response.status).toBe(400);

		const body = await response.json();
		expect(body.errors[0]).toEqual({
			status: '400',
			title: 'Bad Request',
			description: 'Something went wrong',
		});
	});

	it('should handle string reason', async () => {
		const response = error(422, 'Unprocessable Entity', 'Invalid input data');

		const body = await response.json();
		expect(body.errors[0]).toEqual({
			status: '422',
			title: 'Unprocessable Entity',
			description: 'Invalid input data',
		});
	});

	it('should handle number reason', async () => {
		const response = error(429, 'Too Many Requests', 42);

		const body = await response.json();
		expect(body.errors[0]).toEqual({
			status: '429',
			title: 'Too Many Requests',
			description: '42',
		});
	});

	it('should handle object reason by converting to string', async () => {
		const reasonObject = { field: 'email', issue: 'invalid format' };
		const response = error(400, 'Bad Request', reasonObject);

		const body = await response.json();
		expect(body.errors[0]).toEqual({
			status: '400',
			title: 'Bad Request',
			description: '[object Object]',
		});
	});

	it('should handle null reason', async () => {
		const response = error(503, 'Service Unavailable', null);

		const body = await response.json();
		expect(body.errors[0]).toEqual({
			status: '503',
			title: 'Service Unavailable',
			description: undefined,
		});
	});

	it('should handle undefined reason', async () => {
		const response = error(502, 'Bad Gateway', undefined);

		const body = await response.json();
		expect(body.errors[0]).toEqual({
			status: '502',
			title: 'Bad Gateway',
			description: undefined,
		});
	});

	it('should convert status to string in response body', async () => {
		const response = error(400);

		const body = await response.json();
		expect(body.errors[0].status).toBe('400');
		expect(typeof body.errors[0].status).toBe('string');
	});

	it('should follow JSON:API error object structure', async () => {
		const response = error(400, 'Bad Request', 'Invalid JSON');

		const body = await response.json();

		// Check JSON:API structure
		expect(body).toHaveProperty('errors');
		expect(Array.isArray(body.errors)).toBe(true);
		expect(body.errors).toHaveLength(1);

		const errorObject = body.errors[0];
		expect(errorObject).toHaveProperty('status');
		expect(errorObject).toHaveProperty('title');
		expect(errorObject).toHaveProperty('description');
	});

	it('should preserve response immutability', async () => {
		const response1 = error(404, 'Not Found');
		const response2 = error(404, 'Not Found');

		// Should be different instances
		expect(response1).not.toBe(response2);

		// But same content
		expect(response1.status).toBe(response2.status);
		expect(await response1.clone().json()).toEqual(await response2.clone().json());
	});
});
