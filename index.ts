import { homedir } from "os";
import path, { basename } from "path";
import { getCurrentTrack } from "./jxa";
import { debug } from "./log";

const MS_PER_MINUTE = 1_000 * 60;
const UPDATE_TIMES_PER_MINUTE = 12; // run for 55 seconds (on the 60th second a new instance will be called!)

const args = Bun.argv.slice(2);
export const DEBUG = args.includes("--verbose") || args.includes("-v");

const startTime = Date.now();

const workPath = (...segments: string[]) =>
	path.join(homedir(), ".stream", ...segments);

switch (args[0]) {
	case "music":
		if (args.includes("--print")) {
			console.log(await getCurrentTrack());
			break;
		}

		debug(`Music mode @ ${Date.now() - startTime}ms`);

		let timesRun = 0;
		setInterval(() => {
			if (timesRun >= UPDATE_TIMES_PER_MINUTE - 1) {
				debug(`Exceeded maximum times run: timesRun=${timesRun}`);
				return void process.exit(0);
			}

			debug(`Run #${timesRun + 1} @ ${Date.now() - startTime}ms`);

			updateMusicFile();

			timesRun++;
		}, MS_PER_MINUTE / UPDATE_TIMES_PER_MINUTE);
		break;
	case "time":
		if (args.includes("--print")) {
			console.log(await getCurrentTime());
			break;
		}

		updateTimeFile();
		break;
	default:
		console.error(
			`Usage: ${basename(Bun.argv[1])} music|time [--print] [--verbose]`
		);
		process.exit(1);
}

async function updateMusicFile(): Promise<void> {
	debug("Updating current track file");
	const track = (await getCurrentTrack()) ?? "Nothing is playing";
	debug(`Track: ${track}`);
	Bun.write(workPath("current_track.txt"), track, {
		createPath: true,
	});
	debug("Updated current track file");
}

async function updateTimeFile(): Promise<void> {
	debug("Updating current time file");
	Bun.write(workPath("current_time.txt"), await getCurrentTime(), {
		createPath: true,
	});
	debug("Updated current time file");
}

async function getCurrentTime(): Promise<string> {
	debug("Fetching current time");
	const now = new Date();

	return now.toLocaleTimeString(["en-CA"], {
		timeStyle: "short",
		hour12: false,
	});
}
