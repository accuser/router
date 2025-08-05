import { internalServerError, notFound } from './response';

const HTTP_METHODS = {
	all: '[A-Z]+',
	get: '(?:GET|HEAD)',
} as const;

type Flatten<T> = {
	[K in keyof T]: T[K];
} & {};

type RouteParams<T extends string> = Flatten<
	T extends `${string}:${infer Param}+${infer Rest}`
		? { [K in Param]: string } & RouteParams<Rest>
		: T extends `${string}:${infer Param}/${infer Rest}`
		? { [K in Param]: string } & RouteParams<`/${Rest}`>
		: T extends `${string}:${infer Param}`
		? { [K in Param]: string }
		: object
>;

type Maybe<T> = T | undefined | null | void;
type MaybePromise<T> = Maybe<T> | Promise<Maybe<T>>;

type ValidPathname = `/${string}` | '/';

export interface Platform<Options extends RouterOptions> {
	ctx: Flatten<Omit<ExecutionContext, 'props'> & { props: ExtractProps<Options> }>;
	env: ExtractEnv<Options>;
}

export interface RequestEvent<Options extends RouterOptions, Pathname extends ValidPathname> {
	params: RouteParams<Pathname>;
	platform: Platform<Options>;
	request: Request;
	url: URL;
}

export type DefaultEnv = Cloudflare.Env;
export type DefaultMethods = 'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put' | 'trace';
export type DefaultProps = {};

export type ExtractEnv<T> = T extends { env: infer E extends object } ? E : DefaultEnv;
export type ExtractProps<T> = T extends { props: infer P extends object } ? P : DefaultProps;
export type ExtractMethods<T> = T extends { methods: infer M extends string } ? M : DefaultMethods;

export type RouterOptions = {
	env?: DefaultEnv;
	props?: DefaultProps;
	methods?: DefaultMethods;
};

export type Router<Options extends RouterOptions> = Flatten<{
	[K in ExtractMethods<Options>]: <Pathname extends ValidPathname>(
		pathname: Pathname,
		...handlers: RequestHandler<Options, Pathname>[]
	) => Router<Options>;
}>;

export type RequestHandler<Options extends RouterOptions, Pathname extends ValidPathname> = (
	event: RequestEvent<Options, Pathname>
) => MaybePromise<Response>;

export const router = <Options extends RouterOptions = {}>({
	base,
	onError = internalServerError,
}: {
	base?: ValidPathname;
	onError?: (error: unknown, request: Request) => Response | Promise<Response>;
} = {}) => {
	const routes: { handlers: RequestHandler<Options, ValidPathname>[]; re: RegExp }[] = [];

	return new Proxy(
		{
			fetch: (async (req, env, ctx) => {
				const url = new URL(req.url);
				const route = `${req.method} ${url.pathname}`;

				try {
					for (const { handlers, re } of routes) {
						const match = route.match(re);

						if (match) {
							const params = (match.groups || {}) as RouteParams<ValidPathname>;
							let res: Maybe<Response>;

							for (const handler of handlers) {
								if (
									(res = await handler({
										params,
										platform: { ctx, env },
										request: req,
										url,
									})) instanceof Response
								)
									return req.method === 'HEAD' && res.bodyUsed
										? new Response(null, { headers: res.headers, status: res.status, statusText: res.statusText })
										: res;
							}
						}
					}
					return notFound();
				} catch (e) {
					return e instanceof Response ? e : onError(e, req);
				}
			}) satisfies ExportedHandlerFetchHandler<ExtractEnv<Options>>,
		},
		{
			get: (target, p, receiver) =>
				p in target
					? target[p as keyof typeof target]
					: typeof p === 'string'
					? <Pathname extends ValidPathname>(pathname: Pathname, ...handlers: RequestHandler<Options, Pathname>[]) => {
							routes.push({
								handlers,
								re: new RegExp(
									`^${HTTP_METHODS[p as keyof typeof HTTP_METHODS] || p.toUpperCase()} ${(base
										? base + pathname
										: pathname
									)
										// Normalize consecutive slashes: //+ -> /
										.replace(/\/+/g, '/')
										// Convert catch-all parameters: :param+ -> (?<param>.*)
										.replace(/:(\w+)\+/g, '(?<$1>.*)')
										// Convert regular parameters: :param -> (?<param>[^/]+)
										.replace(/:(\w+)/g, '(?<$1>[^/]+)')
										// Escape literal dots
										.replace(/\./g, '\\.')
										// Convert wildcards: * -> .*
										.replace(/\*/g, '.*')
										// Handle optional trailing slash
										.replace(/\/$/, '/?$')}`
								),
							});
							return receiver;
					  }
					: undefined,
		}
	) as { fetch: ExportedHandlerFetchHandler<ExtractEnv<Options>> } & Router<Options>;
};
