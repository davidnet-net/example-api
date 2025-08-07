import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import uptime from "../lib/uptime.ts";

export const health = (ctx: Context) => {
	let DatabaseHealthy = true;
	try {
		//await someDatabase.ping();
	} catch (_) {
		DatabaseHealthy = false;
	}

	const status = DatabaseHealthy ? "healty" : "degraded";
	const uptimeMS = uptime();
	const timestamp = new Date().toISOString();

	ctx.response.body = { status, uptimeMS, timestamp, DatabaseHealthy };
};
