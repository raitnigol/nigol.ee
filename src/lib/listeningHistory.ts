import type { TopMusicResponseSuccess } from "../pages/api/topMusic";
import { getArtistImageUrl, getReleaseYear } from "./spotify";

const ranges = ["short", "medium", "long"] as const;
type Range = (typeof ranges)[number];

export interface RankedTrack {
	id: string;
	name: string;
	url: string;
	image: string | null;
	artists: string;
	year: string | null;
}

export interface RankedArtist {
	id: string;
	name: string;
	url: string;
	image: string | null;
}

export interface ListeningHistory {
	tracks: Record<Range, RankedTrack[]>;
	artists: RankedArtist[];
	genres: Record<Range, string[]>;
}

function topGenres(artists: SpotifyApi.ArtistObjectFull[]) {
	const counts = new Map<string, number>();
	for (const artist of artists) {
		for (const genre of artist.genres ?? []) {
			const name = genre.trim().toLowerCase();
			if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
		}
	}
	return [...counts]
		.sort(
			([a, countA], [b, countB]) => countB - countA || a.localeCompare(b)
		)
		.slice(0, 8)
		.map(([name]) => name);
}

// Send only what the public cards and genre summaries actually render.
export function projectListeningHistory(
	data: TopMusicResponseSuccess
): ListeningHistory {
	const history: ListeningHistory = {
		tracks: { short: [], medium: [], long: [] },
		genres: { short: [], medium: [], long: [] },
		artists: data.artists.items.map(artist => ({
			id: artist.id,
			name: artist.name,
			url: artist.external_urls.spotify,
			image: getArtistImageUrl(artist)
		}))
	};
	for (const range of ranges) {
		history.tracks[range] = data[range].items.map(track => ({
			id: track.id,
			name: track.name,
			url: track.external_urls.spotify,
			image: track.album.images[0]?.url ?? null,
			artists: track.artists.map(artist => artist.name).join(", "),
			year: getReleaseYear(track.album.release_date)
		}));
		history.genres[range] = topGenres(data.artistsByRange[range].items);
	}
	return history;
}
