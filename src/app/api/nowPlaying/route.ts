import { after, connection } from "next/server";

import { matchOwnedRecords } from "../../../lib/matchOwnedRecords";
import { createPlaybackResponder } from "../../../lib/playbackResponse";
import type { NowPlayingResponseSuccess } from "../../../lib/nowPlaying";
import { getPublishedCollection } from "../../../lib/publishedCollection";
import { withSpotifyUserClient } from "../../../lib/spotifyUserServer";

// Give a cold catalogue read time to finish after the response. Its cached
// result can then supply the link on the next poll without delaying playback.
async function findShelfRecords(track: SpotifyApi.TrackObjectFull) {
	const lookup = getPublishedCollection()
		.then(records => matchOwnedRecords(records, track))
		.catch(() => undefined);
	const timeout = Symbol("shelf-timeout");
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const result = await Promise.race([
			lookup,
			new Promise<typeof timeout>(resolve => {
				timer = setTimeout(() => resolve(timeout), 1500);
			})
		]);
		if (result !== timeout) return result;
		after(async () => {
			await lookup;
		});
	} finally {
		clearTimeout(timer);
	}
}

async function loadPlayback(): Promise<NowPlayingResponseSuccess> {
	const result = await withSpotifyUserClient(
		async (api): Promise<NowPlayingResponseSuccess> => {
			const state: NowPlayingResponseSuccess = {
				isPlayingNow: false,
				isPaused: false,
				progressMs: 0,
				progessMs: 0,
				playedAt: null,
				track: null
			};
			const { body } = await api.getMyCurrentPlayingTrack();
			if (body?.item && "album" in body.item) {
				state.isPlayingNow = true;
				state.isPaused = !body.is_playing;
				state.progressMs = state.progessMs = body.progress_ms ?? 0;
				state.track = body.item;
			} else {
				const recent = await api.getMyRecentlyPlayedTracks({
					limit: 1
				});
				const item = recent.body?.items[0];
				if (item?.track) {
					state.track = item.track as SpotifyApi.TrackObjectFull;
					state.playedAt = item.played_at ?? null;
				}
			}
			return state;
		}
	);
	if (result.track) {
		const records = await findShelfRecords(result.track);
		if (records !== undefined) {
			result.shelfRecords = records;
			result.ownedPhysicalMedia = records.length > 0;
		}
	}
	return result;
}

const playbackResponse = createPlaybackResponder(loadPlayback);

export async function GET() {
	await connection();
	return playbackResponse();
}
