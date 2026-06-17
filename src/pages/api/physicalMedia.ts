import { NextApiRequest, NextApiResponse } from "next";

import { physicalMediaCollection } from "../../data/physicalMedia";
import { getReleaseYear } from "../../lib/spotify";
import { withSpotifyClient } from "../../lib/spotifyServer";

export type PhysicalMediaAlbumMeta = {
	collectionId: string;
	name: string;
	artists: string;
	releaseYear: string | null;
	releaseDate: string;
	label: string | null;
	totalTracks: number;
	albumType: string;
	spotifyUrl: string;
	copyright: string | null;
};

export type PhysicalMediaResponseSuccess = {
	albums: Record<string, PhysicalMediaAlbumMeta>;
};

export type PhysicalMediaResponseError = { error: unknown };
export type PhysicalMediaResponse =
	| PhysicalMediaResponseSuccess
	| PhysicalMediaResponseError;

let cachedTime = 0;
let cached: PhysicalMediaResponseSuccess | undefined;

function mapAlbumMeta(
	collectionId: string,
	album: SpotifyApi.AlbumObjectFull
): PhysicalMediaAlbumMeta {
	return {
		collectionId,
		name: album.name,
		artists: album.artists.map(artist => artist.name).join(", "),
		releaseYear: getReleaseYear(album.release_date),
		releaseDate: album.release_date,
		label: album.label ?? null,
		totalTracks: album.total_tracks,
		albumType: album.album_type,
		spotifyUrl: album.external_urls.spotify,
		copyright:
			album.copyrights
				?.map(entry => entry.text)
				.filter(Boolean)
				.join(" · ") ?? null
	};
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<PhysicalMediaResponse>
) {
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed." });
		return;
	}

	try {
		if (!cached || Date.now() > cachedTime) {
			const albums: Record<string, PhysicalMediaAlbumMeta> = {};

			await withSpotifyClient(async client => {
				await Promise.all(
					physicalMediaCollection.map(async item => {
						try {
							const response = await client.getAlbum(item.spotifyAlbumId, {
								market: "EE"
							});
							albums[item.id] = mapAlbumMeta(item.id, response.body);
						} catch {
							// Skip albums Spotify cannot resolve; local data still renders.
						}
					})
				);
			});

			cached = { albums };
			cachedTime = Date.now() + 24 * 60 * 60 * 1000;
		}

		res.setHeader(
			"Cache-Control",
			"public, s-maxage=3600, stale-while-revalidate=86400"
		);
		res.status(200).json(cached);
	} catch (err) {
		res.status(500).json({ error: (err as Error)?.message });
	}
}
