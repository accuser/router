# @agilearn/router

A lightweight, TypeScript-first router for Cloudflare Workers with support for
dynamic routes, middleware, and type-safe route parameters.

## Features

- 🚀 **Lightweight**: Minimal overhead, perfect for edge computing
- 🔧 **TypeScript First**: Full type safety with route parameter inference
- 🛣️ **Dynamic Routes**: Support for parameters (`:id`) and catch-all routes
  (`:path+`)
- 🔌 **Middleware Support**: Built-in CORS, error handling, and custom
  middleware
- ⚡ **Cloudflare Workers**: Optimized for Cloudflare Workers runtime
- 📦 **Monorepo Ready**: Works seamlessly in monorepo setups

## Installation

```bash
npm install @agilearn/router
# or
pnpm add @agilearn/router
# or
yarn add @agilearn/router
```

## Quick Start

```typescript
import { router, text } from "@agilearn/router";

// Create a router
const app = router<{ MY_SECRET: string }>();

// Add routes
app
  .get("/", () => text("Hello World!"))
  .get("/users/:id", ({ params }) => text(`User ID: ${params.id}`))
  .post("/users", ({ request }) => text("Creating user..."))
  .all("/api/*", () => text("API endpoint"));

// Export for Cloudflare Workers
export default app;
```

## Route Parameters

The router supports dynamic route parameters with full TypeScript inference:

```typescript
// Simple parameter
app.get("/users/:id", ({ params }) => {
  // params.id is typed as string
  return text(`User: ${params.id}`);
});

// Multiple parameters
app.get("/users/:userId/posts/:postId", ({ params }) => {
  // params.userId and params.postId are both typed as string
  return text(`User: ${params.userId}, Post: ${params.postId}`);
});

// Catch-all parameter
app.get("/files/:path+", ({ params }) => {
  // params.path captures everything after /files/
  return text(`File path: ${params.path}`);
});
```

## Middleware & Utilities

### Error Handling

```typescript
import { router, notFound, internalServerError } from "@agilearn/router";

const app = router({
  onError: (error, request) => {
    console.error("Router error:", error);
    return internalServerError("Something went wrong");
  },
});

// Built-in error responses
app.get("/not-found", () => notFound());
app.get("/error", () => internalServerError());
```

### Custom Response Helpers

```typescript
import { text } from "@agilearn/router";

// Simple text response
return text("Hello World!");

// Text with custom status and headers
return text("Created!", {
  status: 201,
  headers: { "X-Custom": "value" },
});
```

## Request Context

Each route handler receives a context object with:

```typescript
interface RequestEvent<Route, Env, Ctx> {
  params: RouteParams<Route>; // Type-safe route parameters
  platform: {
    // Cloudflare Workers platform objects
    ctx: Ctx;
    env: Env;
  };
  request: Request; // Standard Request object
  url: URL; // Parsed URL object
}
```

## Type Safety

Define your environment types for full type safety:

```typescript
interface Env {
  MY_SECRET: string;
  DATABASE_URL: string;
}

const app = router<Env>();

app.get("/secret", ({ platform }) => {
  // platform.env.MY_SECRET is typed as string
  return text(platform.env.MY_SECRET);
});
```

## Advanced Usage

### Base Path

```typescript
const api = router({ base: "/api/v1" });

// Routes will be prefixed with /api/v1
api.get("/users", handler); // Matches /api/v1/users
```

### Multiple Handlers

```typescript
app.get("/protected", authMiddleware, validateMiddleware, mainHandler);
```

### HTTP Methods

All standard HTTP methods are supported:

- `app.get(path, ...handlers)`
- `app.post(path, ...handlers)`
- `app.put(path, ...handlers)`
- `app.delete(path, ...handlers)`
- `app.patch(path, ...handlers)`
- `app.options(path, ...handlers)`
- `app.all(path, ...handlers)` - matches any method

## API Reference

### `router(options?)`

Creates a new router instance.

**Options:**

- `base?: string` - Base path for all routes
- `onError?: (error: Error, request: Request) => Response | Promise<Response>` -
  Global error handler

### Response Helpers

- `text(body, options?)` - Creates a text response
- `notFound(body?)` - Creates a 404 response
- `internalServerError(body?)` - Creates a 500 response

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
