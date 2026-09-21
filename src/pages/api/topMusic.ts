import { NextApiRequest, NextApiResponse } from "next";

import { withSpotifyUserClient } from "../../lib/spotifyUserServer";

export type TopMusicResponseSuccess = {
	short: SpotifyApi.UsersTopTracksResponse;
	medium: SpotifyApi.UsersTopTracksResponse;
	long: SpotifyApi.UsersTopTracksResponse;
	/** All-time top artists (used by the artists carousel). */
	artists: SpotifyApi.UsersTopArtistsResponse;
	/** Top artists by time range — used for genre summaries. */
	artistsByRange: {
		short: SpotifyApi.UsersTopArtistsResponse;
		medium: SpotifyApi.UsersTopArtistsResponse;
		long: SpotifyApi.UsersTopArtistsResponse;
	};
};
export type TopMusicResponseError = { error: string };
export type TopMusicResponse = TopMusicResponseSuccess | TopMusicResponseError;

let cachedTime = 0;
let cached: TopMusicResponseSuccess | undefined;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<TopMusicResponse>
) {
	if (req.method !== "GET") {
		res.setHeader("Allow", "GET");
		res.status(405).json({ error: "Method not allowed." });
		return;
	}

	try {
		if (!cached || Date.now() > cachedTime) {
			const [
				short,
				medium,
				long,
				artistsShort,
				artistsMedium,
				artistsLong
			] = await withSpotifyUserClient(api =>
				Promise.all([
					api.getMyTopTracks({ limit: 24, time_range: "short_term" }),
					api.getMyTopTracks({
						limit: 24,
						time_range: "medium_term"
					}),
					api.getMyTopTracks({ limit: 24, time_range: "long_term" }),
					api.getMyTopArtists({
						limit: 24,
						time_range: "short_term"
					}),
					api.getMyTopArtists({
						limit: 24,
						time_range: "medium_term"
					}),
					api.getMyTopArtists({ limit: 24, time_range: "long_term" })
				])
			);

			cached = {
				short: short.body,
				medium: medium.body,
				long: long.body,
				artists: artistsLong.body,
				artistsByRange: {
					short: artistsShort.body,
					medium: artistsMedium.body,
					long: artistsLong.body
				}
			};

			cachedTime = Date.now() + 24 * 60 * 60 * 1000;
		}

		res.setHeader(
			"Cache-Control",
			"public, s-maxage=3600, stale-while-revalidate=86400"
		);
		res.status(200).json(cached);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error(`Unable to load Spotify listening data: ${message}`);
		res.setHeader("Cache-Control", "no-store");
		res.status(503).json({
			error: "Spotify listening data is temporarily unavailable."
		});
	}
}
