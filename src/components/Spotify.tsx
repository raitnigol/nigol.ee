import TransitionLink from "./TransitionLink";
import { PauseIcon, PlayIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { useEffect, useRef, useState } from "preact/hooks";
import type { RefObject } from "preact";
import useSWR from "swr";

import {
	findOwnedPhysicalMedia,
	physicalMediaAlbumHref
} from "../lib/physicalMediaMatch";
import { formatPlayedAt } from "../lib/spotify";
import type {
	NowPlayingResponseError,
	NowPlayingResponseSuccess
} from "../pages/api/nowPlaying";

const formatDuration = (ms: number) => {
	const seconds = Math.floor((ms / 1000) % 60)
		.toString()
		.padStart(2, "0");
	const minutes = Math.floor(ms / 1000 / 60);

	return `${minutes}:${seconds}`;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

const SPOTIFY_LOGO = "/images/logos/spotify.svg";
const EMPTY_ALBUM_ART = "/images/emptysong.jpg";
const NOW_PLAYING_KEY = "/api/nowPlaying";
const PLAYING_POLL_MS = 15_000;
const IDLE_POLL_MS = 60_000;
const PROGRESS_TICK_MS = 1_000;

type SpotifyProps = {
	variant?: "default" | "terminal";
	showArtwork?: boolean;
};

function getAlbumArtUrl(track: SpotifyApi.TrackObjectFull | null | undefined) {
	const images = track?.album?.images;
	if (!images?.length) return EMPTY_ALBUM_ART;
	return images[1]?.url ?? images[0]?.url ?? images.at(-1)?.url ?? EMPTY_ALBUM_ART;
}

function useInViewport(rootRef: RefObject<HTMLElement>) {
	const [isVisible, setIsVisible] = useState(true);

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

function useNowPlaying(rootRef: RefObject<HTMLElement>) {
	const isVisible = useInViewport(rootRef);
	const { data, error } = useSWR<
		NowPlayingResponseSuccess,
		NowPlayingResponseError
	>(isVisible ? NOW_PLAYING_KEY : null, fetcher, {
		refreshInterval: data => {
			if (!data || "error" in data) return IDLE_POLL_MS;
			return data.isPlayingNow ? PLAYING_POLL_MS : IDLE_POLL_MS;
		}
	});

	const isLoading = isVisible && !data && !error;
	const [time, setTime] = useState(0);

	useEffect(() => {
		if (!data?.track || !data.isPlayingNow || !isVisible) {
			setTime(0);
			return;
		}

		setTime(data.progessMs ?? 0);

		const started = Date.now();

		const interval = setInterval(() => {
			setTime(
				data.isPaused
					? data.progessMs ?? 0
					: Math.min(
							(data.progessMs ?? 0) + Date.now() - started,
							data.track!.duration_ms
					  )
			);
		}, PROGRESS_TICK_MS);

		return () => clearInterval(interval);
	}, [data, isVisible]);

	const albumArtUrl = data?.track ? getAlbumArtUrl(data.track) : null;
	const showProgress = Boolean(data?.track);
	const progressMs = data?.isPlayingNow ? time : 0;
	const ownedPhysicalMedia = data?.track
		? findOwnedPhysicalMedia(data.track.album.id)
		: undefined;

	return {
		data,
		error,
		isLoading,
		albumArtUrl,
		showProgress,
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

	const failed = Boolean(error || (data && "error" in data));
	const track =
		data && !("error" in data) && data.track ? data.track : null;
	const isPlayingNow = Boolean(track && data && !("error" in data) && data.isPlayingNow);
	const playedAt =
		data && !("error" in data) ? data.playedAt : undefined;
	const artistNames = track
		? track.artists.map(artist => artist.name).join(", ")
		: null;

	let statusText: React.ReactNode = "loading…";
	if (failed) statusText = "error";
	else if (isLoading) statusText = <TerminalSkeleton width="7.5rem" />;
	else if (!track) statusText = "offline";
	else statusText = isPlayingNow ? "currently playing" : "last played";

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
						{track?.name ??
							(isLoading ? <TerminalSkeleton width="9rem" /> : "—")}
					</TerminalRow>
					<TerminalRow label="Artist">
						{artistNames ??
							(isLoading ? <TerminalSkeleton width="7rem" /> : "—")}
					</TerminalRow>
					<TerminalRow label="Album">
						{track?.album.name ??
							(isLoading ? <TerminalSkeleton width="8rem" /> : "—")}
					</TerminalRow>
					{ownedPhysicalMedia ? (
						<TerminalRow label="Shelf">
							<TransitionLink
								href={physicalMediaAlbumHref(ownedPhysicalMedia.id)}
							>
								<a className="home__link home__link--pro focus-ring">
									owned (physical copy)
								</a>
							</TransitionLink>
						</TerminalRow>
					) : (
						<TerminalRow label="Shelf">
							{isLoading ? <TerminalSkeleton width="3rem" /> : "—"}
						</TerminalRow>
					)}
					{isPlayingNow && track ? (
						<TerminalRow label="Time">
							<span className="spotify-terminal__time">
								{formatDuration(progressMs)} /{" "}
								{formatDuration(track.duration_ms)}
							</span>
							<span className="spotify-terminal__playback-icon" aria-hidden>
								{data && !("error" in data) && data.isPaused ? (
									<PlayIcon className="h-3 w-3" />
								) : (
									<PauseIcon className="h-3 w-3" />
								)}
							</span>
						</TerminalRow>
					) : (
						<TerminalRow label="Played">
							{failed
								? "unable to fetch"
								: track
									? playedAt
										? formatPlayedAt(playedAt)
										: "recently on Spotify"
									: isLoading
										? <TerminalSkeleton width="6.5rem" />
										: "no recent activity"}
						</TerminalRow>
					)}
				</div>
			</div>
		</div>
	);
}

function SpotifyWidget({
	nowPlaying
}: {
	nowPlaying: ReturnType<typeof useNowPlaying>;
}) {
	const {
		data,
		albumArtUrl,
		showProgress,
		progressMs,
		ownedPhysicalMedia
	} = nowPlaying;

	return (
		<div className="spotify-widget">
			<div className="spotify-widget__art">
				{albumArtUrl ? (
					<Image
						src={albumArtUrl}
						alt={
							data?.track
								? `${data.track.name} album art`
								: "Spotify album art"
						}
						width={256}
						height={256}
						className={`spotify-widget__image${
							ownedPhysicalMedia ? " spotify-widget__image--owned" : ""
						}`}
					/>
				) : (
					<div className="spotify-widget__image spotify-widget__image--empty" aria-hidden />
				)}
				{ownedPhysicalMedia ? (
					<TransitionLink
						href={physicalMediaAlbumHref(ownedPhysicalMedia.id)}
					>
						<a
							className="spotify-widget__shelf-link focus-ring"
							aria-label="This album is on my CD shelf"
						>
							<span className="spotify-widget__shelf-link-inner">
								<span className="spotify-widget__shelf-disc" aria-hidden />
								<span>On shelf</span>
							</span>
						</a>
					</TransitionLink>
				) : null}
			</div>

			<div className="spotify-widget__body">
				<p className="spotify-widget__track">
					{data?.track ? (
						<>
							<a
								href={data.track.external_urls.spotify}
								target="_blank"
								rel="noopener noreferrer"
								className="spotify-widget__track-name focus-ring"
							>
								{data.track.name}
							</a>
							<span className="spotify-widget__by"> by </span>
							{data.track.artists.map((artist, i) => (
								<span key={data.track?.id + artist.id}>
									<a
										href={artist.external_urls.spotify}
										target="_blank"
										rel="noopener noreferrer"
										className="spotify-widget__artist focus-ring"
									>
										{artist.name}
									</a>
									{i < data.track?.artists.length! - 1 ? ", " : null}
								</span>
							))}
						</>
					) : (
						<span className="spotify-widget__idle">Not listening to anything</span>
					)}
				</p>

				{data?.track ? (
					<p className="spotify-widget__album">
						on{" "}
						<a
							href={data.track.album.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							className="spotify-widget__album-name focus-ring"
						>
							{data.track.album.name}
						</a>
					</p>
				) : null}

				{showProgress && data?.track ? (
					<div className="spotify-widget__progress">
						<div className="spotify-widget__progress-bar">
							<div
								className="spotify-widget__progress-fill"
								style={{
									width: `${
										(progressMs / data.track.duration_ms) * 100
									}%`
								}}
							/>
						</div>
						<div className="spotify-widget__progress-meta">
							<span>{formatDuration(progressMs)}</span>
							<span className="spotify-widget__progress-icon" aria-hidden>
								{data.isPlayingNow ? (
									data.isPaused ? (
										<PlayIcon className="h-3.5 w-3.5" />
									) : (
										<PauseIcon className="h-3.5 w-3.5" />
									)
								) : (
									<Image
										src={SPOTIFY_LOGO}
										alt=""
										width={14}
										height={14}
										className="h-3.5 w-3.5"
									/>
								)}
							</span>
							<span>{formatDuration(data.track.duration_ms)}</span>
						</div>
						{!data.isPlayingNow ? (
							<p className="spotify-widget__last-played">
								{data.playedAt
									? `Last played ${formatPlayedAt(data.playedAt)}`
									: "Last played on Spotify"}
							</p>
						) : null}
					</div>
				) : (
					<p className="spotify-widget__brand">
						<Image
							src={SPOTIFY_LOGO}
							alt=""
							width={14}
							height={14}
							className="h-3.5 w-3.5"
						/>
						Spotify
					</p>
				)}
			</div>
		</div>
	);
}

export default function Spotify({
	variant = "default",
	showArtwork = true
}: SpotifyProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const nowPlaying = useNowPlaying(rootRef);

	return (
		<div ref={rootRef} className="spotify-root">
			{variant === "terminal" ? (
				<SpotifyTerminal showArtwork={showArtwork} nowPlaying={nowPlaying} />
			) : (
				<SpotifyWidget nowPlaying={nowPlaying} />
			)}
		</div>
	);
}
