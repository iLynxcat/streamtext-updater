const VERBOSE = Bun.argv.includes("--verbose");

export function debug(msg: string | object) {
	if (!VERBOSE) return;

	if (typeof msg === "string") return void console.debug(msg);

	return void console.debug(JSON.stringify(msg));
}
