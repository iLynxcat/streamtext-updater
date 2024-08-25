# streamtext-updater

A simple utility to update stream text files for use in OBS text sources.

## Building

- install Bun
- clone this repository
- install dependencies with `bun install`
- bundle the binary with `bun compile`
- move the generated `streamtext-update` executable to the directory you'd like
  the generated text files to be
- edit your crontab with recommended options from below

## Running

At present, there are two modes you can run `streamtext-update` in: time and
music.

### Music mode

> [!NOTE]  
> Music mode only supports Apple Music on macOS.

Using JavaScript for Automation (JXA), a native automation technology for macOS,
the `streamtext-update` binary fetches the currently playing track details from
the Music app and writes it to `current_track.txt` in the
`Artist Name - Track Title` format.

The recommended crontab entry for music mode is:

```
* * * * * path/to/streamtext-update music
```

Unless you change `index.ts` before compilation, music mode will update every 5
seconds for a minute before terminating because Cron does not run jobs any more
frequent than a minute.

#### Testing music mode

If you'd like to check to make sure music mode is working properly, run
`streamtext-update music --print` and it'll print the output instead of writing
it to disk.

### Time mode

Time mode simply writes the current time to `current_time.txt` in 24-hour format
(i.e. `09:41`, `20:30`) and exits.

The recommended crontab entry for time mode is:

```
* * * * * path/to/streamtext-update time
```
