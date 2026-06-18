import Link from "next/link";
import { PauseIcon, PlayIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { useEffect, useState } from "preact/hooks";
import useSWR from "swr";

import { findOwnedPhysicalMedia } from "../lib/physicalMediaMatch";
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

const SPOTIFY_LOGO = "/images/logos/spotify.png";
const EMPTY_ALBUM_ART = "/images/emptysong.jpg";

function getAlbumArtUrl(track: SpotifyApi.TrackObjectFull | null | undefined) {
	const images = track?.album?.images;
	if (!images?.length) return EMPTY_ALBUM_ART;
	return images[1]?.url ?? images[0]?.url ?? images.at(-1)?.url ?? EMPTY_ALBUM_ART;
}

export default function Spotify() {
	const { data } = useSWR<NowPlayingResponseSuccess, NowPlayingResponseError>(
		"/api/nowPlaying",
		fetcher,
		{ refreshInterval: 5000 }
	);

	const [time, setTime] = useState(0);

	useEffect(() => {
		if (!data?.track) return;

		if (!data.isPlayingNow) {
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
		}, 100);

		return () => clearInterval(interval);
	}, [data]);

	const albumArtUrl = data?.track ? getAlbumArtUrl(data.track) : null;
	const isRemoteAlbumArt = albumArtUrl?.startsWith("http") ?? false;
	const showProgress = Boolean(data?.track);
	const progressMs = data?.isPlayingNow ? time : 0;
	const ownedPhysicalMedia =
		data?.track && data.isPlayingNow
			? findOwnedPhysicalMedia(data.track.album.id)
			: undefined;

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
						priority={true}
						unoptimized={isRemoteAlbumArt}
						className={`spotify-widget__image${
							ownedPhysicalMedia ? " spotify-widget__image--owned" : ""
						}`}
					/>
				) : (
					<div className="spotify-widget__image spotify-widget__image--empty" aria-hidden />
				)}
				{ownedPhysicalMedia ? (
					<Link
						href="/physical-media"
						className="spotify-widget__shelf-link focus-ring"
						aria-label="This album is on my CD shelf"
					>
						<span className="spotify-widget__shelf-disc" aria-hidden />
						<span>On shelf</span>
					</Link>
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
