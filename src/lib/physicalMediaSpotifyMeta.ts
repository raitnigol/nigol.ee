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

export type PhysicalMediaSpotifyMetaFile = {
	generatedAt: string;
	source: string;
	total: number;
	loaded: number;
	complete: boolean;
	failed: string[];
	albums: Record<string, PhysicalMediaAlbumMeta>;
};

export type PhysicalMediaApiResponse = PhysicalMediaSpotifyMetaFile;

export function mapSearchAlbumMeta(
	collectionId: string,
	album: SpotifyApi.AlbumObjectSimplified
): PhysicalMediaAlbumMeta {
	return {
		collectionId,
		name: album.name,
		artists: album.artists.map(artist => artist.name).join(", "),
		coverImageUrl: album.images?.[0]?.url ?? null,
		releaseYear: album.release_date?.slice(0, 4) ?? null,
		releaseDate: album.release_date ?? "",
		label: null,
		totalTracks: album.total_tracks,
		albumType: album.album_type,
		spotifyUrl: album.external_urls.spotify,
		copyright: null
	};
}

type SpotifySearchShow = {
	id: string;
	name: string;
	publisher: string;
	images: SpotifyApi.ImageObject[];
	total_episodes: number;
	external_urls: { spotify: string };
};

export function mapSearchShowMeta(
	collectionId: string,
	show: SpotifySearchShow
): PhysicalMediaAlbumMeta {
	return {
		collectionId,
		name: show.name,
		artists: show.publisher,
		coverImageUrl: show.images?.[0]?.url ?? null,
		releaseYear: null,
		releaseDate: "",
		label: null,
		totalTracks: show.total_episodes,
		albumType: "show",
		spotifyUrl: show.external_urls.spotify,
		copyright: null
	};
}
