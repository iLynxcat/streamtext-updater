import { run as runJxa } from "@jxa/run";
import { debug } from "./log";

declare function Application(applicationName: "Music"): {
	running(): boolean;
	currentTrack(): { name(): string; artist(): string };
};

export async function getCurrentTrack(): Promise<string | null> {
	debug("Getting current track via JXA");
	debug("NOTE: No logs will come from the script.");

	// Using native macOS JavaScript for Automation (JXA), we
	// ask the Music app for its current track then return it.
	return await runJxa(() => {
		const musicApp = Application("Music");

		if (!musicApp.running()) {
			return null;
		}

		let currentTrack, title, artist;

		try {
			currentTrack = musicApp.currentTrack();

			title = currentTrack.name();
			artist = currentTrack.artist();
		} catch (err) {
			// If there's no current track or there's an error retrieving it,
			// fall back to "Nothing is playing"
			return null;
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
