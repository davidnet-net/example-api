import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { health } from "../controllers/health.ts";

const router = new Router();

router
	.get("/", health);

export default router;
