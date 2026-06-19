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

export function pickSpotifyImageUrl(
	images: SpotifyApi.ImageObject[] | undefined
): string | null {
	if (!images?.length) return null;

	const sorted = [...images].sort(
		(a, b) => (a.width ?? 0) - (b.width ?? 0)
	);
	const preferred =
		sorted.find(image => (image.width ?? 0) >= 300) ?? sorted.at(-1);

	return preferred?.url ?? null;
}
