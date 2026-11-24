import { connection } from "next/server";

import type { NowPlayingResponseSuccess } from "../../../lib/nowPlaying";
import { getPublishedCollection } from "../../../lib/publishedCollection";
import { withSpotifyUserClient } from "../../../lib/spotifyUserServer";

const CACHE_MS = 12_000;
const SHELF_DEADLINE_MS = 750;
let cached: { until: number; data: NowPlayingResponseSuccess } | undefined;
let pending: Promise<NowPlayingResponseSuccess> | undefined;

async function findOwnedAlbum(albumId: string): Promise<boolean | undefined> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			getPublishedCollection().then(records =>
				records.some(
					record =>
						record.spotifyType === "album" &&
						record.spotifyId === albumId
				)
			),
			new Promise<undefined>(resolve => {
				timer = setTimeout(() => resolve(undefined), SHELF_DEADLINE_MS);
			})
		]);
	} catch {
		return undefined;
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
	if (result.track?.album.id) {
		result.ownedPhysicalMedia = await findOwnedAlbum(result.track.album.id);
	}
	return result;
}

export async function GET() {
	await connection();
	try {
		if (!cached || cached.until <= Date.now()) {
			pending ??= loadPlayback().finally(() => {
				pending = undefined;
			});
			const data = await pending;
			cached = { data, until: Date.now() + CACHE_MS };
		}
		return Response.json(cached.data, {
			headers: {
				"Cache-Control":
					"public, max-age=0, s-maxage=15, stale-while-revalidate=60"
			}
		});
	} catch {
		return Response.json(
			{ error: "Now-playing data is temporarily unavailable." },
			{ status: 503, headers: { "Cache-Control": "no-store" } }
		);
	}
}
