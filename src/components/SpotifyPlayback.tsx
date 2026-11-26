import { useEffect, useState, type ReactNode } from "react";
import useSWR from "swr";

import type { NowPlayingResponseSuccess } from "../lib/nowPlaying";
import { formatPlayedAt } from "../lib/spotify";

const NOW_PLAYING_KEY = "/api/nowPlaying";
const PLAYING_POLL_MS = 5_000;
const IDLE_POLL_MS = 10_000;
const PROGRESS_TICK_MS = 1_000;

type PlaybackSample =
	| { available: true; playback: NowPlayingResponseSuccess }
	| { available: false };

let retryAt = 0;

async function fetchPlayback(url: string): Promise<PlaybackSample> {
	if (Date.now() < retryAt) return { available: false };
	let retryMs = IDLE_POLL_MS;
	try {
		const response = await fetch(url, {
			cache: "no-store",
			signal: AbortSignal.timeout(15_000)
		});
		if (response.ok) {
			return { available: true, playback: await response.json() };
		}
		if (response.status === 429) {
			const seconds = Number(response.headers.get("Retry-After"));
			retryMs =
				(Number.isFinite(seconds) && seconds > 0 ? seconds : 30) *
				1_000;
		}
	} catch {
		// A timed-out or offline request can recover on the next visible poll.
	}
	retryAt = Date.now() + retryMs;
	return { available: false };
}

function refreshInterval(sample?: PlaybackSample) {
	if (sample && !sample.available) {
		return Math.max(
			PROGRESS_TICK_MS,
			Math.min(60_000, retryAt - Date.now())
		);
	}
	if (!sample || (sample.playback.isPlayingNow && !sample.playback.isPaused))
		return PLAYING_POLL_MS;
	return IDLE_POLL_MS;
}

function useNowPlaying(isVisible: boolean) {
	const { data: sample } = useSWR<PlaybackSample>(
		isVisible ? NOW_PLAYING_KEY : null,
		fetchPlayback,
		{
			keepPreviousData: true,
			refreshInterval: isVisible ? refreshInterval : 0
		}
	);

	const data = sample?.available ? sample.playback : undefined;
	const [tick, setTick] = useState<{
		source: NowPlayingResponseSuccess;
		ms: number;
	} | null>(null);
	const initialProgress = data?.progressMs ?? data?.progessMs ?? 0;

	useEffect(() => {
		if (!data?.track || !data.isPlayingNow || data.isPaused || !isVisible)
			return;

		const duration = data.track.duration_ms;
		const started = Date.now();
		const interval = window.setInterval(() => {
			setTick({
				source: data,
				ms: Math.min(initialProgress + Date.now() - started, duration)
			});
		}, PROGRESS_TICK_MS);

		return () => window.clearInterval(interval);
	}, [data, isVisible, initialProgress]);

	const progressMs = tick && tick.source === data ? tick.ms : initialProgress;
	return {
		data,
		failed: sample?.available === false,
		isLoading: !sample,
		playedAgo: data?.playedAt ? formatPlayedAt(data.playedAt) : null,
		progressMs
	};
}

export type PlaybackState = ReturnType<typeof useNowPlaying>;

export default function SpotifyPlayback({
	isVisible,
	children
}: {
	isVisible: boolean;
	children: (state: PlaybackState) => ReactNode;
}) {
	return children(useNowPlaying(isVisible));
}
