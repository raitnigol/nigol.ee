"use client";

import Link from "next/link";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import useSWR from "swr";

import { formatPlayedAt } from "../lib/spotify";
import type { NowPlayingResponseSuccess } from "../lib/nowPlaying";
import { formatNames } from "./collection/RecordArt";

const formatDuration = (ms: number) => {
	const seconds = Math.floor((ms / 1000) % 60)
		.toString()
		.padStart(2, "0");
	const minutes = Math.floor(ms / 1000 / 60);

	return `${minutes}:${seconds}`;
};

const EMPTY_ALBUM_ART = "/images/physical-media/covers/placeholder.jpg";
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

function copyHref(copyId: string) {
	return `/physical-media#record=${encodeURIComponent(copyId)}`;
}

type SpotifyProps = {
	showArtwork?: boolean;
};

function getAlbumArtUrl(track: SpotifyApi.TrackObjectFull | null | undefined) {
	const images = track?.album?.images;
	if (!images?.length) return EMPTY_ALBUM_ART;
	return (
		images[1]?.url ??
		images[0]?.url ??
		images.at(-1)?.url ??
		EMPTY_ALBUM_ART
	);
}

function useInViewport(rootRef: RefObject<HTMLElement | null>) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const element = rootRef.current;
		if (!element) return;

		let inView = false;
		const update = () => setIsVisible(inView && !document.hidden);
		const observer = new IntersectionObserver(
			([entry]) => {
				inView = entry.isIntersecting;
				update();
			},
			{ rootMargin: "48px" }
		);

		observer.observe(element);
		document.addEventListener("visibilitychange", update);
		return () => {
			observer.disconnect();
			document.removeEventListener("visibilitychange", update);
		};
	}, [rootRef]);

	return isVisible;
}

function useNowPlaying(rootRef: RefObject<HTMLElement | null>) {
	const isVisible = useInViewport(rootRef);
	const { data: sample } = useSWR<PlaybackSample>(
		isVisible ? NOW_PLAYING_KEY : null,
		fetchPlayback,
		{ keepPreviousData: true, refreshInterval: isVisible ? refreshInterval : 0 }
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

	const albumArtUrl = data?.track ? getAlbumArtUrl(data.track) : null;
	const progressMs = tick && tick.source === data ? tick.ms : initialProgress;
	return {
		data,
		failed: sample?.available === false,
		isLoading: !sample,
		albumArtUrl,
		progressMs
	};
}

function TerminalRow({
	label,
	children
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="spotify-terminal__row">
			<span className="spotify-terminal__label">{label}:</span>
			<span className="spotify-terminal__value">{children}</span>
		</div>
	);
}

function TerminalSkeleton({ width }: { width: string }) {
	return (
		<span
			className="spotify-terminal__skeleton"
			style={{ width }}
			aria-hidden
		/>
	);
}

function SpotifyTerminal({
	showArtwork = true,
	nowPlaying
}: {
	showArtwork?: boolean;
	nowPlaying: ReturnType<typeof useNowPlaying>;
}) {
	const { data, failed, isLoading, albumArtUrl, progressMs } = nowPlaying;

	const track = data?.track;
	const copies = data?.shelfRecords;
	const singleCopy = copies?.length === 1 ? copies[0] : undefined;
	const isPlayingNow = Boolean(track && data?.isPlayingNow);
	const playedAt = data?.playedAt;
	const artistNames = track
		? track.artists.map(artist => artist.name).join(", ")
		: null;

	let statusText: React.ReactNode = "loading…";
	if (failed) statusText = "temporarily unavailable";
	else if (isLoading) statusText = <TerminalSkeleton width="7.5rem" />;
	else if (!track) statusText = "offline";
	else
		statusText = isPlayingNow
			? data?.isPaused
				? "paused"
				: "currently playing"
			: "last played";

	return (
		<div
			className="spotify-terminal home-terminal__text"
			aria-busy={isLoading || undefined}
		>
			<div className="spotify-terminal__layout">
				{showArtwork ? (
					<figure className="spotify-terminal__preview">
						<figcaption className="spotify-terminal__preview-label">
							album-art.jpg
						</figcaption>
						<div className="spotify-terminal__preview-frame">
							{albumArtUrl ? (
								<Image
									src={albumArtUrl}
									alt=""
									width={96}
									height={96}
									className="spotify-terminal__preview-image"
								/>
							) : (
								<div
									className={
										isLoading
											? "spotify-terminal__preview-image spotify-terminal__preview-image--skeleton"
											: "spotify-terminal__preview-image spotify-terminal__preview-image--empty"
									}
									aria-hidden
								/>
							)}
						</div>
					</figure>
				) : null}

				<div className="spotify-terminal__meta">
					<TerminalRow label="Status">{statusText}</TerminalRow>
					<TerminalRow label="Track">
						{track ? (
							<a
								className="home__link home__link--pro focus-ring"
								href={track.external_urls.spotify}
							>
								{track.name}
							</a>
						) : isLoading ? (
							<TerminalSkeleton width="9rem" />
						) : (
							"—"
						)}
					</TerminalRow>
					<TerminalRow label="Artist">
						{artistNames ??
							(isLoading ? (
								<TerminalSkeleton width="7rem" />
							) : (
								"—"
							))}
					</TerminalRow>
					<TerminalRow label="Album">
						{track && singleCopy ? (
							<Link
								className="home__link home__link--pro focus-ring"
								href={copyHref(singleCopy.copyId)}
							>
								{track.album.name}
							</Link>
						) : track ? (
							track.album.name
						) : isLoading ? (
							<TerminalSkeleton width="8rem" />
						) : (
							"—"
						)}
					</TerminalRow>
					<TerminalRow label="Shelf">
						{copies?.length ? (
							copies.map((copy, index) => {
								const sameFormat = copies.filter(
									record => record.format === copy.format
								);
								const format = formatNames[copy.format];
								const label =
									sameFormat.length > 1
										? `${format} (copy ${
												sameFormat.indexOf(copy) + 1
										  })`
										: format;
								return (
									<Fragment key={copy.copyId}>
										{index > 0 ? ", " : ""}
										<Link
											href={copyHref(copy.copyId)}
											className="home__link home__link--pro focus-ring"
											aria-label={`${label} of ${copy.title} in the collection`}
										>
											{label}
										</Link>
									</Fragment>
								);
							})
						) : isLoading ? (
							<TerminalSkeleton width="3rem" />
						) : track && !copies ? (
							"unavailable"
						) : (
							"—"
						)}
					</TerminalRow>
					{isPlayingNow && track ? (
						<TerminalRow label="Time">
							<span className="spotify-terminal__time">
								{formatDuration(progressMs)} /{" "}
								{formatDuration(track.duration_ms)}
							</span>
							<span
								className="spotify-terminal__playback-icon"
								aria-hidden
							>
								{data?.isPaused ? (
									<PauseIcon className="h-3 w-3" />
								) : (
									<PlayIcon className="h-3 w-3" />
								)}
							</span>
						</TerminalRow>
					) : (
						<TerminalRow label="Played">
							{failed ? (
								"unable to fetch"
							) : track ? (
								playedAt ? (
									formatPlayedAt(playedAt)
								) : (
									"recently on Spotify"
								)
							) : isLoading ? (
								<TerminalSkeleton width="6.5rem" />
							) : (
								"no recent activity"
							)}
						</TerminalRow>
					)}
				</div>
			</div>
		</div>
	);
}

export default function Spotify({ showArtwork = true }: SpotifyProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const nowPlaying = useNowPlaying(rootRef);

	return (
		<div ref={rootRef} className="spotify-root">
			<SpotifyTerminal
				showArtwork={showArtwork}
				nowPlaying={nowPlaying}
			/>
		</div>
	);
}
