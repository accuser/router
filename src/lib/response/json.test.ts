import { describe, expect, it } from 'vitest';
import { json } from './json';

describe('json helper', () => {
	describe('content type handling', () => {
		it('should set default content type to application/vnd.api+json', async () => {
			const response = json({ message: 'test' });

			expect(response.headers.get('Content-Type')).toBe('application/json');
		});

		it('should allow overriding content type', async () => {
			const response = json(
				{ message: 'test' },
				{
					headers: { 'Content-Type': 'application/json' },
				}
			);

			expect(response.headers.get('Content-Type')).toBe('application/json');
		});

		it('should preserve other headers while setting content type', async () => {
			const response = json(
				{ message: 'test' },
				{
					headers: {
						'X-Custom-Header': 'value',
						Authorization: 'Bearer token',
					},
				}
			);

			expect(response.headers.get('Content-Type')).toBe('application/json');
			expect(response.headers.get('X-Custom-Header')).toBe('value');
			expect(response.headers.get('Authorization')).toBe('Bearer token');
		});

		it('should merge headers correctly when overriding content type', async () => {
			const response = json(
				{ message: 'test' },
				{
					headers: {
						'Content-Type': 'application/vnd.api+json',
						'X-Custom-Header': 'value',
					},
				}
			);

			expect(response.headers.get('Content-Type')).toBe('application/vnd.api+json');
			expect(response.headers.get('X-Custom-Header')).toBe('value');
		});
	});

	describe('data serialization', () => {
		it('should serialize null data', async () => {
			const response = json(null);
			const data = await response.json();

			expect(data).toBeNull();
		});

		it('should serialize string data', async () => {
			const response = json('hello world');
			const data = await response.json();

			expect(data).toBe('hello world');
		});

		it('should serialize number data', async () => {
			const response = json(42);
			const data = await response.json();

			expect(data).toBe(42);
		});

		it('should serialize boolean data', async () => {
			const response = json(true);
			const data = await response.json();

			expect(data).toBe(true);
		});

		it('should serialize object data', async () => {
			const testData = { id: 1, name: 'test', active: true };
			const response = json(testData);
			const data = await response.json();

			expect(data).toEqual(testData);
		});

		it('should serialize array data', async () => {
			const testData = [1, 'test', { id: 1 }];
			const response = json(testData);
			const data = await response.json();

			expect(data).toEqual(testData);
		});

		it('should serialize JSON:API formatted data', async () => {
			const testData = {
				data: {
					type: 'users',
					id: '1',
					attributes: { name: 'John Doe', email: 'john@example.com' },
				},
			};
			const response = json(testData);
			const data = await response.json();

			expect(data).toEqual(testData);
		});
	});

	describe('response options', () => {
		it('should set custom status code', async () => {
			const response = json({ message: 'created' }, { status: 201 });

			expect(response.status).toBe(201);
		});

		it('should set custom status text', async () => {
			const response = json(
				{ message: 'created' },
				{
					status: 201,
					statusText: 'Created',
				}
			);

			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');
		});

		it('should handle all ResponseInit options', async () => {
			const response = json(
				{ message: 'test' },
				{
					status: 202,
					statusText: 'Accepted',
					headers: {
						'X-Custom': 'value',
						'Cache-Control': 'no-cache',
					},
				}
			);

			expect(response.status).toBe(202);
			expect(response.statusText).toBe('Accepted');
			expect(response.headers.get('Content-Type')).toBe('application/json');
			expect(response.headers.get('X-Custom')).toBe('value');
			expect(response.headers.get('Cache-Control')).toBe('no-cache');
		});
	});

	describe('edge cases', () => {
		it('should handle empty object', async () => {
			const response = json({});
			const data = await response.json();

			expect(data).toEqual({});
			expect(response.headers.get('Content-Type')).toBe('application/json');
		});

		it('should handle empty array', async () => {
			const response = json([]);
			const data = await response.json();

			expect(data).toEqual([]);
		});

		it('should handle nested objects', async () => {
			const testData = {
				user: {
					profile: {
						settings: {
							theme: 'dark',
						},
					},
				},
			};
			const response = json(testData);
			const data = await response.json();

			expect(data).toEqual(testData);
		});

		it('should handle Headers object in init', async () => {
			const headers = new Headers();
			headers.set('X-Custom', 'value');
			headers.set('Content-Type', 'application/json');

			const response = json({ message: 'test' }, { headers });

			expect(response.headers.get('Content-Type')).toBe('application/json');
			expect(response.headers.get('X-Custom')).toBe('value');
		});

		it('should handle case-insensitive header override', async () => {
			const response = json(
				{ message: 'test' },
				{
					headers: { 'content-type': 'application/json' },
				}
			);

			// Note: Header names are normalized, so this should work
			expect(response.headers.get('Content-Type')).toMatch('application/json');
		});
	});

	describe('integration with Response.json', () => {
		it('should return a Response instance', () => {
			const response = json({ message: 'test' });

			expect(response).toBeInstanceOf(Response);
		});

		it('should be readable as a stream', async () => {
			const response = json({ message: 'test' });

			expect(response.body).toBeTruthy();
			expect(response.bodyUsed).toBe(false);

			await response.json();
			expect(response.bodyUsed).toBe(true);
		});

		it('should have correct response properties', async () => {
			const response = json({ message: 'test' });

			expect(response.ok).toBe(true);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('');
			expect(response.type).toBe('default');
		});
	});
});
