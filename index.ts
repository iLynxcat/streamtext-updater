import { argv } from "bun";
import { homedir } from "os";
import path from "path";
import { getCurrentTrack } from "./jxa";

const MS_PER_MINUTE = 1_000 * 60;
const UPDATE_TIMES_PER_MINUTE = 12; // run for 55 seconds (on the 60th second a new instance will be called!)

const startTime = Date.now();

const workPath = (...segments: string[]) =>
	path.join(homedir(), ".stream", ...segments);

let args = argv.slice(2);

switch (args[0]) {
	case "--music":
		if (args[1] === "--print") {
			console.log(await getCurrentTrack());
			break;
		}

		console.log(`Music mode @ ${Date.now() - startTime}ms`);

		let timesRun = 0;
		setInterval(() => {
			if (timesRun >= UPDATE_TIMES_PER_MINUTE - 1) {
				return void process.exit(0);
			}

			console.log(`Run #${timesRun + 1} @ ${Date.now() - startTime}ms`);

			updateMusicFile();

			timesRun++;
		}, MS_PER_MINUTE / UPDATE_TIMES_PER_MINUTE);
		break;
	case "--time":
		if (args[1] === "--print") {
			console.log(await getCurrentTime());
			break;
		}

		updateTimeFile();
		break;
	default:
		break;
}

async function updateMusicFile(): Promise<void> {
	Bun.write(workPath("current_track.txt"), await getCurrentTrack(), {
		createPath: true,
	});
}

async function updateTimeFile(): Promise<void> {
	Bun.write(workPath("current_time.txt"), await getCurrentTime(), {
		createPath: true,
	});
}

async function getCurrentTime(): Promise<string> {
	const now = new Date();

	return now.toLocaleTimeString(["en-CA"], {
		timeStyle: "short",
		hour12: false,
	});
}
