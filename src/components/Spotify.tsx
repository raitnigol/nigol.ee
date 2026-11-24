"use client";

import Link from "next/link";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import useSWR from "swr";

import { formatPlayedAt } from "../lib/spotify";
import type { NowPlayingResponseSuccess } from "../lib/nowPlaying";

const formatDuration = (ms: number) => {
	const seconds = Math.floor((ms / 1000) % 60)
		.toString()
		.padStart(2, "0");
	const minutes = Math.floor(ms / 1000 / 60);

	return `${minutes}:${seconds}`;
};

async function fetcher(url: string): Promise<NowPlayingResponseSuccess> {
	const response = await fetch(url);
	if (!response.ok) throw new Error("Spotify is temporarily unavailable");
	return response.json();
}

const EMPTY_ALBUM_ART = "/images/physical-media/covers/placeholder.jpg";
const NOW_PLAYING_KEY = "/api/nowPlaying";
const PLAYING_POLL_MS = 15_000;
const IDLE_POLL_MS = 60_000;
const PROGRESS_TICK_MS = 1_000;

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

		const observer = new IntersectionObserver(
			([entry]) => setIsVisible(entry.isIntersecting),
			{ rootMargin: "48px" }
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [rootRef]);

	return isVisible;
}

function useNowPlaying(rootRef: RefObject<HTMLElement | null>) {
	const isVisible = useInViewport(rootRef);
	const { data, error } = useSWR<NowPlayingResponseSuccess, Error>(
		isVisible ? NOW_PLAYING_KEY : null,
		fetcher,
		{
			keepPreviousData: true,
			errorRetryCount: 2,
			refreshInterval: data => {
				if (!data) return IDLE_POLL_MS;
				return data.isPlayingNow ? PLAYING_POLL_MS : IDLE_POLL_MS;
			}
		}
	);

	const isLoading = !data && !error;
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
			if (!document.hidden) {
				setTick({
					source: data,
					ms: Math.min(
						initialProgress + Date.now() - started,
						duration
					)
				});
			}
		}, PROGRESS_TICK_MS);

		return () => window.clearInterval(interval);
	}, [data, isVisible, initialProgress]);

	const albumArtUrl = data?.track ? getAlbumArtUrl(data.track) : null;
	const progressMs = tick && tick.source === data ? tick.ms : initialProgress;
	const ownedPhysicalMedia = data?.ownedPhysicalMedia;

	return {
		data,
		error,
		isLoading,
		albumArtUrl,
		progressMs,
		ownedPhysicalMedia
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
	const {
		data,
		error,
		isLoading,
		albumArtUrl,
		progressMs,
		ownedPhysicalMedia
	} = nowPlaying;

	const track = data?.track;
	const failed = Boolean(error && !track);
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
						{track?.album.name ??
							(isLoading ? (
								<TerminalSkeleton width="8rem" />
							) : (
								"—"
							))}
					</TerminalRow>
					{ownedPhysicalMedia ? (
						<TerminalRow label="Shelf">
							<Link
								href="/physical-media"
								className="home__link home__link--pro focus-ring"
							>
								owned (physical copy)
							</Link>
						</TerminalRow>
					) : (
						<TerminalRow label="Shelf">
							{isLoading ? (
								<TerminalSkeleton width="3rem" />
							) : (
								"—"
							)}
						</TerminalRow>
					)}
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
