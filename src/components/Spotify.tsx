"use client";

import { IntentLink } from "./IntentLink";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Fragment, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import type { PlaybackState } from "./SpotifyPlayback";
import { formatNames } from "./collection/RecordArt";

const SpotifyPlayback = lazy(() => import("./SpotifyPlayback"));

const formatDuration = (ms: number) => {
	const seconds = Math.floor((ms / 1000) % 60)
		.toString()
		.padStart(2, "0");
	const minutes = Math.floor(ms / 1000 / 60);

	return `${minutes}:${seconds}`;
};

const EMPTY_ALBUM_ART = "/images/physical-media/covers/placeholder.jpg";
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
	const [hasAppeared, setHasAppeared] = useState(false);

	useEffect(() => {
		const element = rootRef.current;
		if (!element) return;

		let inView = false;
		const update = () => {
			const visible = inView && !document.hidden;
			setIsVisible(visible);
			if (visible) setHasAppeared(true);
		};
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

	return { hasAppeared, isVisible };
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
	nowPlaying?: PlaybackState;
}) {
	const {
		data,
		failed,
		isLoading = true,
		playedAgo,
		progressMs = 0
	} = nowPlaying ?? {};

	const track = data?.track;
	const albumArtUrl = track ? getAlbumArtUrl(track) : null;
	const copies = data?.shelfRecords;
	const singleCopy = copies?.length === 1 ? copies[0] : undefined;
	const isPlayingNow = Boolean(track && data?.isPlayingNow);
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
							<IntentLink
								className="home__link home__link--pro focus-ring"
								href={copyHref(singleCopy.copyId)}
							>
								{track.album.name}
							</IntentLink>
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
										<IntentLink
											href={copyHref(copy.copyId)}
											className="home__link home__link--pro focus-ring"
											aria-label={`${label} of ${copy.title} in the collection`}
										>
											{label}
										</IntentLink>
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
								playedAgo ?? "recently on Spotify"
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
	const { hasAppeared, isVisible } = useInViewport(rootRef);
	const loading = <SpotifyTerminal showArtwork={showArtwork} />;

	return (
		<div ref={rootRef} className="spotify-root">
			{hasAppeared ? (
				<Suspense fallback={loading}>
					<SpotifyPlayback isVisible={isVisible}>
						{nowPlaying => (
							<SpotifyTerminal
								showArtwork={showArtwork}
								nowPlaying={nowPlaying}
							/>
						)}
					</SpotifyPlayback>
				</Suspense>
			) : (
				loading
			)}
		</div>
	);
}
