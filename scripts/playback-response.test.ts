import assert from "node:assert/strict";
import { test } from "node:test";

import type { NowPlayingResponseSuccess } from "../src/lib/nowPlaying";
import { createPlaybackResponder } from "../src/lib/playbackResponse";

function sample(id: string): NowPlayingResponseSuccess {
	return {
		isPlayingNow: true,
		isPaused: false,
		progressMs: 123,
		progessMs: 123,
		playedAt: null,
		track: { id } as SpotifyApi.TrackObjectFull
	};
}

test("visitors share a sample, then see a skipped track on the next poll", async t => {
	let now = 10_000;
	t.mock.method(Date, "now", () => now);
	let current = "first";
	const read = t.mock.fn(async () => sample(current));
	const respond = createPlaybackResponder(read);
	const [a, b] = await Promise.all([respond(), respond()]);
	assert.equal(read.mock.callCount(), 1);
	assert.equal((await a.json()).track.id, "first");
	assert.equal((await b.json()).track.id, "first");
	assert.match(a.headers.get("cache-control")!, /no-store/);
	current = "second";
	now += 5_000;
	assert.equal((await (await respond()).json()).track.id, "second");
	assert.equal(read.mock.callCount(), 2);
});

test("Spotify throttling suspends upstream reads until Retry-After expires", async t => {
	let now = 10_000;
	t.mock.method(Date, "now", () => now);
	let limit = true;
	const read = t.mock.fn(async () => {
		if (limit) throw { statusCode: 429, headers: { "retry-after": "9" } };
		return sample("recovered");
	});
	const respond = createPlaybackResponder(read);
	const failure = await respond();
	assert.equal(failure.status, 429);
	assert.equal(failure.headers.get("retry-after"), "9");
	assert.match(failure.headers.get("cache-control")!, /no-store/);
	now += 5_000;
	limit = false;
	assert.equal((await respond()).headers.get("retry-after"), "4");
	assert.equal(read.mock.callCount(), 1);
	now += 4_000;
	assert.equal((await (await respond()).json()).track.id, "recovered");
});

test("an upstream failure after a good sample is surfaced and can recover", async t => {
	let now = 10_000;
	t.mock.method(Date, "now", () => now);
	let outage = false;
	const respond = createPlaybackResponder(async () => {
		if (outage) throw new Error("Spotify unavailable");
		return sample("available");
	});
	assert.equal((await respond()).status, 200);
	now += 5_000;
	outage = true;
	const failure = await respond();
	assert.equal(failure.status, 503);
	assert.equal((await failure.json()).track, undefined);
	outage = false;
	assert.equal((await respond()).status, 200);
});
