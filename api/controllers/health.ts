import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import uptime from "../lib/uptime.ts";
import { getDBClient } from "../lib/db.ts";

export const health = async (ctx: Context) => {
	let DatabaseHealthy = true;

	try {
		const client = await getDBClient();
		if (!client) throw "No DB client available";
		await client.execute("SELECT 1");
	} catch (_) {
		DatabaseHealthy = false;
	}

	const status = DatabaseHealthy ? "healthy" : "degraded";
	const uptimeMS = uptime();
	const timestamp = new Date().toISOString();

	ctx.response.body = { status, uptimeMS, timestamp, DatabaseHealthy };
};


export default health;