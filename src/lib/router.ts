import { internalServerError, notFound } from '$lib/response';

type Flatten<T> = {
	[K in keyof T]: T[K];
} & {};

type Maybe<T> = T | undefined | null | void;

type MaybePromise<T> = Maybe<T> | Promise<Maybe<T>>;

export interface Platform<Props = unknown> {
	ctx: Flatten<Omit<ExecutionContext, 'props'> & { props: Props }>;
	env: Cloudflare.Env;
}

type RouteParams<T extends string> = Flatten<
	T extends `${string}:${infer Param}+${infer Rest}`
		? { [K in Param]: string } & RouteParams<Rest>
		: T extends `${string}:${infer Param}/${infer Rest}`
		? { [K in Param]: string } & RouteParams<`/${Rest}`>
		: T extends `${string}:${infer Param}`
		? { [K in Param]: string }
		: object
>;

export interface RequestEvent<Route extends string = string, Props = unknown> {
	params: RouteParams<Route>;
	platform: Platform<Props>;
	request: Request;
	url: URL;
}

export type RequestHandler<Route extends string = string, Props = unknown> = (
	event: RequestEvent<Route, Props>
) => MaybePromise<Response>;

type Router<Props = unknown> = Flatten<
	{
		fetch: ExportedHandlerFetchHandler<Cloudflare.Env>;
	} & {
		[K in 'all' | 'delete' | 'get' | 'options' | 'patch' | 'post' | 'put']: <
			Route extends string
		>(
			route: Route,
			...handlers: RequestHandler<Route, Props>[]
		) => Router<Props>;
	}
>;

export const router = <Props = unknown>({
	base = '',
	onError = internalServerError,
}: {
	base?: string;
	onError?: (error: unknown, request: Request) => Response | Promise<Response>;
} = {}) => {
	const routes: { handlers: RequestHandler<string, Props>[]; re: RegExp }[] =
		[];

	return new Proxy(
		{
			async fetch(req, env, ctx) {
				const url = new URL(req.url);
				const route = `${req.method} ${url.pathname}`;

				try {
					for (const { handlers, re } of routes) {
						const match = route.match(re);

						if (match) {
							const params = match.groups || {};

							for (const handler of handlers) {
								const res = await handler({
									params,
									platform: { ctx, env },
									request: req,
									url,
								});

								if (res instanceof Response) {
									return req.method === 'HEAD' && res.bodyUsed
										? new Response(null, res)
										: res;
								}
							}
						}
					}
					return notFound();
				} catch (error) {
					return onError(error, req);
				}
			},
		} as Router<Props>,
		{
			get(target, p: keyof Router<Props>, receiver) {
				return p in target
					? target[p]
					: <Route extends string>(
							route: Route,
							...handlers: RequestHandler<Route, Props>[]
					  ) => {
							routes.push({
								handlers,
								re: new RegExp(
									`^${
										p === 'all'
											? '[A-Z]+'
											: p === 'get'
											? '(?:GET|HEAD)'
											: p.toUpperCase()
									} ${
										(base + route)
											// Normalize consecutive slashes: //+ -> /
											.replace(/\/+/g, '/')
											// Convert catch-all parameters: :param+ -> (?<param>.*)
											.replace(/:(\w+)\+/g, '(?<$1>.*)')
											// Convert regular parameters: :param -> (?<param>[^/]+)
											.replace(/:(\w+)/g, '(?<$1>[^/]+)')
											// Escape literal dots
											.replace(/\./g, '\\.')
											// Convert wildcards: * -> .*
											.replace(/\*/g, '.*') +
										// Handle optional trailing slash
										'/?'
									}$`
								),
							});
							return receiver;
					  };
			},
		}
	) as Router<Props>;
};
