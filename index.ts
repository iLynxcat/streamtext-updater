import "@jxa/global-type";

import { run } from "@jxa/run";
import { argv } from "bun";
import { homedir } from "os";
import path from "path";

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

async function getCurrentTrack(): Promise<string> {
	// Using native macOS JavaScript for Automation (JXA), we
	// ask the Music app for its current track then return it.
	return await run(() => {
		const musicApp = Application("Music");

		if (!musicApp.running()) {
			return "Nothing is playing";
		}

		let currentTrack, title, artist;

		try {
			currentTrack = musicApp.currentTrack();

			title = currentTrack.name();
			artist = currentTrack.artist();
		} catch (err) {
			// If there's no current track or there's an error retrieving it,
			// fall back to "Nothing is playing"
			return "Nothing is playing";
		}

		return `${artist} - ${title}`;

		// ++ ORIGINAL APPLESCRIPT VERSION: ++
		// if application "Music" is running then
		// 	try
		// 		tell application "Music"
		// 			set songTitle to the name of the current track
		// 			set songArtist to the artist of the current track
		// 			return songArtist & " — " & songTitle
		// 		end tell
		// 	end try
		// end if
		// return "Nothing is playing"
	});
}

async function getCurrentTime(): Promise<string> {
	const now = new Date();

	return now.toLocaleTimeString(["en-CA"], {
		timeStyle: "short",
		hour12: false,
	});
}
