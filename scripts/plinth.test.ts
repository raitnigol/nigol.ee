import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import type { NowPlayingResponseSuccess } from "../src/lib/nowPlaying";
import { plinthDisplay } from "../src/lib/plinth/display";
import upstream from "../src/lib/plinth/upstream.json";

function sample(): NowPlayingResponseSuccess {
	return {
		isPlayingNow: true,
		isPaused: false,
		progressMs: 1_000,
		progessMs: 1_000,
		playedAt: null,
		track: {
			id: "track-a",
			name: "Track A",
			duration_ms: 120_000,
			artists: [{ name: "Artist" }],
			album: { name: "Album" }
		} as SpotifyApi.TrackObjectFull
	};
}

test("the gramophone follows playback, pauses, and replaces a skipped track", () => {
	const data = sample();
	assert.equal(plinthDisplay(data, 60_000).progress, 0.5);
	assert.equal(plinthDisplay(data, 60_000).playing, true);
	data.isPaused = true;
	assert.equal(plinthDisplay(data, 60_000).playing, false);
	data.track = { ...data.track!, id: "track-b", name: "Track B" };
	data.isPaused = false;
	assert.deepEqual(plinthDisplay(data, 0).track, {
		id: "track-b",
		title: "Track B",
		artist: "Artist",
		album: "Album"
	});
});

test("recently played, missing and failed playback never spin a stale record", () => {
	const data = sample();
	data.isPlayingNow = false;
	assert.equal(plinthDisplay(data, 100_000).playing, false);
	assert.equal(plinthDisplay(data, 100_000).progress, 0);
	assert.deepEqual(plinthDisplay(undefined, 10_000), {
		playing: false,
		progress: 0,
		track: null
	});
	data.track = null;
	assert.equal(plinthDisplay(data, 10_000).track, null);
});

test("playback position stays on the record and the display projection carries no credentials", () => {
	assert.equal(plinthDisplay(sample(), -1).progress, 0);
	assert.equal(plinthDisplay(sample(), 999_999).progress, 1);
	const result = plinthDisplay(
		{
			...sample(),
			accessToken: "private",
			deviceId: "private"
		} as NowPlayingResponseSuccess,
		0
	);
	assert.equal(JSON.stringify(result).includes("private"), false);
});

test("pinned Plinth modules and meshes match their digest and omit the private player", async () => {
	const root = new URL(`../public${upstream.basePath}/`, import.meta.url);
	const actual = (await readdir(root, { recursive: true }))
		.filter(name => /\.[a-z]+$/i.test(name))
		.sort();
	assert.deepEqual(actual, Object.keys(upstream.files).sort());
	assert.ok(
		!actual.includes("spotify.js") &&
			!actual.includes("app.js") &&
			!actual.includes("index.html")
	);
	for (const [name, hash] of Object.entries(upstream.files)) {
		const bytes = await readFile(new URL(name, root));
		assert.equal(
			createHash("sha256").update(bytes).digest("hex"),
			hash,
			name
		);
		if (name.endsWith(".js")) {
			assert.doesNotMatch(
				bytes.toString(),
				/accounts\.spotify\.com|api\.spotify\.com|spotify-player\.js|Authorization:/,
				name
			);
			for (const match of bytes
				.toString()
				.matchAll(/(?:from\s*|import\s*\()(['"])(\.\/[^'"]+\.js)\1/g)) {
				assert.ok(
					match[2].slice(2) in upstream.files,
					`Missing renderer dependency: ${match[2]}`
				);
			}
		}
	}
});
