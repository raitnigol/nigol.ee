import { NextApiRequest, NextApiResponse } from "next";
import Spotify from "spotify-web-api-node";

export interface NowPlayingResponseSuccess {
	/**
	 * Whether the track is from recently played or currently playing.
	 */
	isPlayingNow: boolean;
	isPaused: boolean;
	progessMs: number;
	/** ISO 8601 timestamp when the track was last played (recently-played fallback only). */
	playedAt: string | null;
	track: SpotifyApi.TrackObjectFull | null;
}
export type NowPlayingResponseError = { error: unknown };
export type NowPlayingResponse =
	| NowPlayingResponseSuccess
	| NowPlayingResponseError;

const api = new Spotify({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	refreshToken: process.env.SPOTIFY_REFRESH_TOKEN
});

/** Keep edge/CDN responses warm between client polls (15s while playing). */
const CACHE_MS = 12_000;

let expirationTime = 0;
let cachedTime = 0;
let cached: NowPlayingResponseSuccess | undefined;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<NowPlayingResponse>
) {
	if (req.method !== "GET") {
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

		if (Date.now() > expirationTime) {
			const response = await api.refreshAccessToken();
			api.setAccessToken(response.body.access_token);

			expirationTime = Date.now() + response.body.expires_in * 1000;
		}

		let response: NowPlayingResponseSuccess = {
			isPlayingNow: false,
			isPaused: false,
			progessMs: 0,
			playedAt: null,
			track: null
		};
		const playing = await api.getMyCurrentPlayingTrack();

		if (playing.body?.item && "album" in playing.body.item) {
			response.isPlayingNow = true;
			response.track = playing.body.item;
			response.isPaused = !playing.body.is_playing;
			response.progessMs = playing.body.progress_ms ?? 0;
		} else {
			const lastPlayed = await api.getMyRecentlyPlayedTracks({
				limit: 1
			});

			const lastItem = lastPlayed.body?.items[0];
			if (lastItem?.track) {
				response.track = lastItem.track as SpotifyApi.TrackObjectFull;
				response.playedAt = lastItem.played_at ?? null;
			}
		}

		cached = response;
		cachedTime = Date.now() + CACHE_MS;

		res.setHeader(
			"Cache-Control",
			"public, s-maxage=15, stale-while-revalidate=60"
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).json({ error: (err as any)?.message });
	}
}
