import { NextApiRequest, NextApiResponse } from "next";
import Spotify from "spotify-web-api-node";

export type SpotifyArtistResponseSuccess = SpotifyApi.ArtistObjectFull;
export type SpotifyArtistResponseError = { error: unknown };
export type SpotifyArtistResponse =
	| SpotifyArtistResponseSuccess
	| SpotifyArtistResponseError;

const api = new Spotify({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});
let expirationTime = 0;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<SpotifyArtistResponse>
) {
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed." });
		return;
	}

	const { id } = req.query;

	if (!id || Array.isArray(id)) {
		res.status(400).json({ error: "Missing or invalid 'id' query parameter." });
		return;
	}

	try {
		if (Date.now() > expirationTime) {
			const response = await api.clientCredentialsGrant();
			api.setAccessToken(response.body.access_token);

			expirationTime = Date.now() + response.body.expires_in * 1000;
		}

		const response = await api.getArtist(id);
		res.setHeader(
			"Cache-Control",
			"public, s-maxage=3600, stale-while-revalidate=86400"
		);
		res.status(200).json(response.body);
	} catch (err) {
		res.status(500).json({ error: (err as any)?.message });
	}
}
