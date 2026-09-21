import { NextApiRequest, NextApiResponse } from "next";

import { withSpotifyUserClient } from "../../lib/spotifyUserServer";

export interface NowPlayingResponseSuccess {
	/**
	 * Whether the track is from recently played or currently playing.
	 */
	isPlayingNow: boolean;
	isPaused: boolean;
	progressMs: number;
	/** @deprecated Typo kept for cached clients; use progressMs. */
	progessMs: number;
	/** ISO 8601 timestamp when the track was last played (recently-played fallback only). */
	playedAt: string | null;
	track: SpotifyApi.TrackObjectFull | null;
}
export type NowPlayingResponseError = { error: string };
export type NowPlayingResponse =
	| NowPlayingResponseSuccess
	| NowPlayingResponseError;

/** Keep edge/CDN responses warm between client polls (15s while playing). */
const CACHE_MS = 12_000;

let cachedTime = 0;
let cached: NowPlayingResponseSuccess | undefined;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<NowPlayingResponse>
) {
	if (req.method !== "GET") {
		res.setHeader("Allow", "GET");
		res.status(405).json({ error: "Method not allowed." });
		return;
	}

	try {
		if (cached && Date.now() < cachedTime) {
			res.setHeader(
				"Cache-Control",
				"public, s-maxage=15, stale-while-revalidate=60"
			);
			res.status(200).json(cached);
			return;
		}

		const response = await withSpotifyUserClient(
			async (api): Promise<NowPlayingResponseSuccess> => {
				const result: NowPlayingResponseSuccess = {
					isPlayingNow: false,
					isPaused: false,
					progressMs: 0,
					progessMs: 0,
					playedAt: null,
					track: null
				};
				const playing = await api.getMyCurrentPlayingTrack();

				if (playing.body?.item && "album" in playing.body.item) {
					result.isPlayingNow = true;
					result.track = playing.body.item;
					result.isPaused = !playing.body.is_playing;
					result.progressMs = playing.body.progress_ms ?? 0;
					result.progessMs = result.progressMs;
				} else {
					const lastPlayed = await api.getMyRecentlyPlayedTracks({
						limit: 1
					});

					const lastItem = lastPlayed.body?.items[0];
					if (lastItem?.track) {
						result.track =
							lastItem.track as SpotifyApi.TrackObjectFull;
						result.playedAt = lastItem.played_at ?? null;
					}
				}

				return result;
			}
		);

		cached = response;
		cachedTime = Date.now() + CACHE_MS;

		res.setHeader(
			"Cache-Control",
			"public, s-maxage=15, stale-while-revalidate=60"
		);
		res.status(200).json(response);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error(`Unable to load now-playing data: ${message}`);
		res.setHeader("Cache-Control", "no-store");
		res.status(503).json({
			error: "Now-playing data is temporarily unavailable."
		});
	}
}
