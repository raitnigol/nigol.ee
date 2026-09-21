import {
	isAllowedSpotifyImageUrl,
	isAllowedSpotifyLink
} from "./spotifyUrlValidation";

export type SpotifyArtistMeta = {
	spotifyId: string;
	name: string;
	followers: number;
	genres: string[];
	imageUrl: string | null;
	spotifyUrl: string;
};

export type SpotifyArtistsMetaFile = {
	generatedAt: string;
	source: string;
	total: number;
	loaded: number;
	complete: boolean;
	failed: string[];
	artists: Record<string, SpotifyArtistMeta>;
};

function isSpotifyArtistMeta(value: unknown): value is SpotifyArtistMeta {
	if (!value || typeof value !== "object") return false;

	const artist = value as Record<string, unknown>;
	return (
		typeof artist.spotifyId === "string" &&
		typeof artist.name === "string" &&
		typeof artist.followers === "number" &&
		Number.isFinite(artist.followers) &&
		Array.isArray(artist.genres) &&
		artist.genres.every(genre => typeof genre === "string") &&
		(artist.imageUrl === null ||
			(typeof artist.imageUrl === "string" &&
				isAllowedSpotifyImageUrl(artist.imageUrl))) &&
		typeof artist.spotifyUrl === "string" &&
		isAllowedSpotifyLink(artist.spotifyUrl)
	);
}

export function isSpotifyArtistsMetaFile(
	value: unknown
): value is SpotifyArtistsMetaFile {
	if (!value || typeof value !== "object") return false;

	const file = value as Record<string, unknown>;
	if (!file.artists || typeof file.artists !== "object") return false;

	return (
		typeof file.generatedAt === "string" &&
		typeof file.source === "string" &&
		typeof file.total === "number" &&
		typeof file.loaded === "number" &&
		typeof file.complete === "boolean" &&
		Array.isArray(file.failed) &&
		file.failed.every(entry => typeof entry === "string") &&
		Object.values(file.artists).every(isSpotifyArtistMeta)
	);
}

export function pickSpotifyImageUrl(
	images: SpotifyApi.ImageObject[] | undefined
): string | null {
	if (!images?.length) return null;

	const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
	const preferred =
		sorted.find(image => (image.width ?? 0) >= 300) ?? sorted.at(-1);

	return preferred?.url ?? null;
}
