import formatDistanceToNow from "date-fns/formatDistanceToNow";

export function getReleaseYear(releaseDate?: string): string | null {
	if (!releaseDate) return null;
	const year = releaseDate.slice(0, 4);
	return /^\d{4}$/.test(year) ? year : null;
}

export function formatPlayedAt(playedAt: string): string {
	return formatDistanceToNow(new Date(playedAt), { addSuffix: true });
}

export function getArtistImageUrl(
	artist: SpotifyApi.ArtistObjectFull | null | undefined
): string | null {
	const images = artist?.images;
	if (!images?.length) return null;
	return images[1]?.url ?? images[0]?.url ?? images.at(-1)?.url ?? null;
}
