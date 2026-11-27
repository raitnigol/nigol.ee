import type { NowPlayingResponseSuccess } from "../nowPlaying";

export type PlinthTrack = {
	id: string;
	title: string;
	artist: string;
	album: string;
	art: string;
};

function coverUrl(images: SpotifyApi.ImageObject[] | undefined) {
	let best = "",
		width = -1;
	for (const image of images || []) {
		try {
			const url = new URL(image.url);
			const size = image.width || 0;
			if (
				url.protocol === "https:" &&
				!url.username &&
				!url.password &&
				size > width
			) {
				best = url.href;
				width = size;
			}
		} catch {
			/* Sparse metadata falls back to the printed label. */
		}
	}
	return best;
}

/** A display projection only. No Spotify token, device or command is accepted. */
export function plinthDisplay(
	data: NowPlayingResponseSuccess | undefined,
	progressMs: number
) {
	const track = data?.track;
	const duration = Math.max(0, track?.duration_ms || 0);
	const current = Boolean(track && data?.isPlayingNow);
	return {
		playing: current && !data?.isPaused,
		progress:
			current && duration > 0
				? Math.max(0, Math.min(1, progressMs / duration))
				: 0,
		track: track
			? {
					id: track.id,
					title: track.name,
					artist: track.artists.map(artist => artist.name).join(", "),
					album: track.album.name,
					art: coverUrl(track.album.images)
			  }
			: null
	};
}

export function playbackTime(ms: number) {
	const seconds = Math.floor(
		Math.max(0, Number.isFinite(ms) ? ms : 0) / 1000
	);
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(
		2,
		"0"
	)}`;
}
