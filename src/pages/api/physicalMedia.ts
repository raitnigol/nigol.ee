import { NextApiRequest, NextApiResponse } from "next";
import Spotify from "spotify-web-api-node";

import { physicalMediaCollection } from "../../data/physicalMedia";
import {
	getAlbumCoverUrl,
	getReleaseYear,
	getShowCoverUrl
} from "../../lib/spotify";
import { withSpotifyClient } from "../../lib/spotifyServer";

export type PhysicalMediaAlbumMeta = {
	collectionId: string;
	name: string;
	artists: string;
	coverImageUrl: string | null;
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

type SpotifyShow = {
	name: string;
	publisher: string;
	images: SpotifyApi.ImageObject[];
	total_episodes: number;
	external_urls: { spotify: string };
};

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
		coverImageUrl: getAlbumCoverUrl(album),
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

function mapShowMeta(
	collectionId: string,
	show: SpotifyShow
): PhysicalMediaAlbumMeta {
	return {
		collectionId,
		name: show.name,
		artists: show.publisher,
		coverImageUrl: getShowCoverUrl(show),
		releaseYear: null,
		releaseDate: "",
		label: show.publisher ?? null,
		totalTracks: show.total_episodes,
		albumType: "show",
		spotifyUrl: show.external_urls.spotify,
		copyright: null
	};
}

async function fetchShow(
	client: Spotify,
	showId: string
): Promise<SpotifyShow> {
	const token = client.getAccessToken();
	const response = await fetch(
		`https://api.spotify.com/v1/shows/${showId}?market=EE`,
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch show ${showId}`);
	}

	return response.json();
}

async function resolveAlbumMeta(
	client: Spotify,
	collectionId: string,
	spotifyAlbumId: string
): Promise<PhysicalMediaAlbumMeta> {
	try {
		const response = await client.getAlbum(spotifyAlbumId, {
			market: "EE"
		});
		return mapAlbumMeta(collectionId, response.body);
	} catch {
		const track = await client.getTrack(spotifyAlbumId);
		const album = await client.getAlbum(track.body.album.id, {
			market: "EE"
		});
		return mapAlbumMeta(collectionId, album.body);
	}
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
							if (item.spotifyShowId) {
								const show = await fetchShow(client, item.spotifyShowId);
								albums[item.id] = mapShowMeta(item.id, show);
								return;
							}

							if (item.spotifyAlbumId) {
								albums[item.id] = await resolveAlbumMeta(
									client,
									item.id,
									item.spotifyAlbumId
								);
							}
						} catch {
							// Skip entries Spotify cannot resolve.
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
