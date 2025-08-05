# Router

A type-safe, lightweight router designed specifically for Cloudflare Workers with built-in JSON:API support. Inspired by [itty-router](https://github.com/kwhitley/itty-router) and [SvelteKit](https://github.com/sveltejs/kit).

## Features

- 🔥 **Zero dependencies** - Lightweight and fast
- 🛡️ **Type-safe** - Full TypeScript support with route parameter inference
- 🌐 **Cloudflare Workers optimized** - Built for the edge
- 📡 **JSON:API compliant** - Follows JSON:API specification
- 🚀 **Simple API** - Intuitive method chaining
- 🔄 **Dynamic routes** - Support for parameters, wildcards, and catch-all routes
- ⚡ **High performance** - Minimal overhead with efficient route matching
- 🛠️ **Optional response helpers** - Built-in helpers for common responses and errors

## Installation

```bash
npm install @agilearn/router
```

## Quick Start

```typescript
import { router, json, error, notFound, internalServerError } from '@agilearn/router';

const app = router();

// Simple route
app.get('/hello', () => json({ message: 'Hello, World!' }));

// Route with parameters
app.get('/users/:id', ({ params }) => {
	return json({
		data: {
			type: 'users',
			id: params.id,
			attributes: { name: 'John Doe' },
		},
	});
});

// Handle not found
app.get('/missing', () => notFound());

// Handle errors
app.post('/users', () => {
	try {
		// Some operation that might fail
		throw new Error('Database error');
	} catch (err) {
		return internalServerError(err);
	}
});

export default app;
```

## Response Helpers

The router includes several built-in response helpers for common HTTP responses:

### JSON Responses

```typescript
import { json, created } from '@agilearn/router/response';

// JSON response with data (200 OK)
json({ message: 'Success' });

// JSON with custom status and headers
created(
	{ data: user },
	{
		headers: { Location: '/users/123' },
	}
);
```

### Error Responses

```typescript
import { error } from '@agilearn/router';

// Basic error (follows JSON:API error format)
error(404, 'Not Found');

// Error with description
error(400, 'Bad Request', 'Invalid email format');

// Error with Error object
error(500, 'Internal Server Error', new Error('Database failed'));
```

### Common HTTP Responses

```typescript
import { notFound, internalServerError } from '@agilearn/router/response';

// 404 Not Found
app.get('/missing', () => notFound());

// 500 Internal Server Error
app.get('/error', () => internalServerError());

// 500 with custom error
app.get('/custom-error', () => internalServerError(new Error('Custom error')));
```

## API Reference

### Router Creation

```typescript
const app = router<Options>({
  base?: string;
  onError?: (error: unknown, request: Request) => Response | Promise<Response>;
});
```

**Options:**

- `base` - Base path for all routes (optional). Must start with '/'.
- `onError` - Custom error handler (optional, defaults to `internalServerError`)

### HTTP Methods

The router supports all standard HTTP methods:

```typescript
app.get(path, ...handlers);
app.post(path, ...handlers);
app.put(path, ...handlers);
app.patch(path, ...handlers);
app.delete(path, ...handlers);
app.head(path, ...handlers);
app.options(path, ...handlers);
app.trace(path, ...handlers);
```

### Route Patterns

#### Static Routes

```typescript
app.get('/users', handler);
app.post('/api/v1/posts', handler);
```

#### Parameters

```typescript
// Single parameter
app.get('/users/:id', ({ params }) => {
	console.log(params.id); // Type-safe!
});

// Multiple parameters
app.get('/users/:userId/posts/:postId', ({ params }) => {
	console.log(params.userId, params.postId);
});
```

#### Catch-all Parameters

```typescript
// Matches everything after /files/
app.get('/files/:path+', ({ params }) => {
	console.log(params.path); // Could be "docs/readme.txt"
});
```

#### Wildcards

```typescript
// Matches any path
app.get('/api/*', handler);
```

### Request Handler

```typescript
type RequestHandler<Options, Pathname> = (
	event: RequestEvent<Options, Pathname>
) => Response | Promise<Response> | void;

interface RequestEvent<Options, Pathname> {
	params: RouteParams<Pathname>; // Route parameters (type-safe)
	platform: Platform<Options>; // Cloudflare Workers context
	request: Request; // Original request
	url: URL; // Parsed URL
}
```

## Advanced Usage

### Custom Types

```typescript
interface MyEnv {
	DATABASE_URL: string;
	API_KEY: string;
}

interface MyProps {
	userId: string;
}

const app = router<{
	env: MyEnv;
	props: MyProps;
}>();

app.get('/protected', ({ platform }) => {
	// platform.env is typed as MyEnv
	// platform.ctx.props is typed as MyProps
	const dbUrl = platform.env.DATABASE_URL;
	return json({ success: true });
});
```

### Error Handling

```typescript
import { internalServerError } from '@agilearn/router/response';

const app = router({
	onError: (error, request) => {
		console.error('Router error:', error);
		return internalServerError(error);
	},
});
```

### Middleware Pattern

```typescript
import { error } from '@agilearn/router/response';

const authenticate = ({ request, platform }) => {
	const token = request.headers.get('Authorization');
	if (!token) {
		throw error(401, 'Unauthorized');
	}
	// Continue to next handler by returning void/undefined
};

const getUser = ({ params }) => {
	return json({
		data: {
			type: 'users',
			id: params.id,
		},
	});
};

// Chain handlers
app.get('/users/:id', authenticate, getUser);
```

### Error Handling Best Practices

```typescript
import { badRequest, internalServerError, notFound } from '@agilearn/router';

app.get('/users/:id', async ({ params, platform }) => {
	try {
		const user = await getUser(params.id, platform.env.DATABASE_URL);

		if (!user) {
			return notFound();
		}

		return json({
			data: {
				type: 'users',
				id: user.id,
				attributes: user,
			},
		});
	} catch (err) {
		if (err instanceof ValidationError) {
			return badRequest(err.message);
		}

		return internalServerError(err);
	}
});
```

## JSON:API Compliance

This router is designed for JSON:API applications and includes:

- Structured error responses following JSON:API error object format
- Support for JSON:API document structure

```typescript
// JSON:API compliant response
app.get('/users/:id', ({ params }) => {
	return json(
		{
			data: {
				type: 'users',
				id: params.id,
				attributes: {
					name: 'John Doe',
					email: 'john@example.com',
				},
			},
		},
		{
			headers: { 'Content-Type': 'application/vnd.api+json' },
		}
	);
});
```

## Deployment

### Cloudflare Workers

```typescript
// wrangler.toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# src/index.ts
import { json, router } from '@agilearn/router';

const app = router();

app.get('/', () => json({ message: 'Hello World!' }));

export default app;
```

Then deploy:

```bash
npx wrangler deploy
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.
