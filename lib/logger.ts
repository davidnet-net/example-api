// lib/logger.ts
import { ensureDir, exists } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import config from "../config.ts";

const LOG_DIR = config.log_dir;
const LATEST_LOG = join(LOG_DIR, "latest.log");
const LOG_EXTENSION = ".log";
const DATE_FORMAT = new Intl.DateTimeFormat("nl-NL", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const logQueue: string[] = [];
let isWriting = false;

function formatDate(date: Date): string {
	return DATE_FORMAT.format(date).replace(/\//g, "-"); // e.g., "07-08-2025"
}

async function getNextAvailableLogName(base: string): Promise<string> {
	let counter = 0;
	let filename = `${base}${LOG_EXTENSION}`;
	let filepath = join(LOG_DIR, filename);

	while (await exists(filepath)) {
		counter++;
		filename = `${base}_${counter}${LOG_EXTENSION}`;
		filepath = join(LOG_DIR, filename);
	}

	return filepath;
}

async function rotateLogs() {
	if (!(await exists(LATEST_LOG))) return;

	const todayBase = formatDate(new Date());
	const targetPath = await getNextAvailableLogName(todayBase);

	await Deno.rename(LATEST_LOG, targetPath);

	// Delete old logs
	const now = Date.now();
	const maxAge = config.keep_log_days * 24 * 60 * 60 * 1000;

	for await (const entry of Deno.readDir(LOG_DIR)) {
		if (entry.isFile && entry.name.endsWith(LOG_EXTENSION) && entry.name !== "latest.log") {
			const filePath = join(LOG_DIR, entry.name);
			const stat = await Deno.stat(filePath);
			if (stat.mtime && now - stat.mtime.getTime() > maxAge) {
				await Deno.remove(filePath);
			}
		}
	}
}

await ensureDir(LOG_DIR);
await rotateLogs();

async function processLogQueue() {
	if (isWriting || logQueue.length === 0) return;

	isWriting = true;
	const toWrite = logQueue.join("");
	logQueue.length = 0;

	try {
		await Deno.writeTextFile(LATEST_LOG, toWrite, { append: true });
	} catch (err) {
		console.error("Logger error:", err);
	} finally {
		isWriting = false;
		processLogQueue(); // continue if new logs added while writing
	}
}

export function log(...args: unknown[]) {
	if (config.log_to_terminal) {
		console.log(...args);
	}

	const entry = {
		level: "log",
		timestamp: new Date().toISOString(),
		data: args.length === 1 ? args[0] : args,
	};

	logQueue.push(JSON.stringify(entry) + "\n");
	processLogQueue();
}

export function warn(...args: unknown[]) {
	if (config.log_to_terminal) {
		console.warn(...args);
	}

	const entry = {
		level: "warn",
		timestamp: new Date().toISOString(),
		data: args.length === 1 ? args[0] : args,
	};

	logQueue.push(JSON.stringify(entry) + "\n");
	processLogQueue();
}

export function log_error(...args: unknown[]) {
	if (config.log_to_terminal) {
		console.error(...args);
	}

	const entry = {
		level: "error",
		timestamp: new Date().toISOString(),
		data: args.length === 1 ? args[0] : args,
	};

	logQueue.push(JSON.stringify(entry) + "\n");
	processLogQueue();
}