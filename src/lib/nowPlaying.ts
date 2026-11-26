import type { ShelfRecord } from "./matchOwnedRecords";

export interface NowPlayingResponseSuccess {
	/**
	 * Whether the track is from recently played or currently playing.
	 */
	isPlayingNow: boolean;
	isPaused: boolean;
	progressMs: number;
	/** @deprecated Typo kept for cached clients; use progressMs. */
	progessMs: number;
	/** ISO 8601 timestamp when the track was last played (recently-played fallback only). */
	playedAt: string | null;
	track: SpotifyApi.TrackObjectFull | null;
	/** Present when the public shelf could be checked for this Spotify album. */
	ownedPhysicalMedia?: boolean;
	/** Undefined when unavailable. An empty array is a verified miss. */
	shelfRecords?: ShelfRecord[];
}
export type NowPlayingResponseError = { error: string };
export type NowPlayingResponse =
	| NowPlayingResponseSuccess
	| NowPlayingResponseError;
