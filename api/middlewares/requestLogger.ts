import { Context, Middleware } from "https://deno.land/x/oak@v12.6.1/mod.ts";

export const requestLogger: Middleware = async (ctx: Context, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	console.log(`${ctx.request.method} - ${ctx.request.url} - ${ms}ms`);
};

export default requestLogger;
