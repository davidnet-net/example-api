import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import config from "./config.ts";
import { log } from "./lib/logger.ts";
import router from "./routes/router.ts";
import correlationID from "./middlewares/correlationID.ts";
import errorHandler from "./middlewares/errorHandler.ts";
import requestLogger from "./middlewares/requestLogger.ts";

if (import.meta.main) {
	const app = new Application();

	// Global middlewares
	app.use(correlationID);
	app.use(errorHandler);
	app.use(requestLogger);

	app.use(router.routes());
	app.use(router.allowedMethods());

	log("Server running on http://localhost:" + config.port);
	await app.listen({ port: config.port });
}
