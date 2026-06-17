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
		<div className="spotify-widget flex items-center gap-2 text-base leading-snug">
			<div className="spotify-widget__art relative h-16 w-16 flex-shrink-0 md:h-20 md:w-20">
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
						className={`h-full w-full rounded-lg object-cover object-center${
							ownedPhysicalMedia ? " spotify-widget__art-image--owned" : ""
						}`}
					/>
				) : (
					<div
						className="h-full w-full rounded-lg bg-slate-800"
						aria-hidden
					/>
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
			<div className="basis-full">
				<p>
					{data?.track ? (
						<>
							<a
								href={data.track.external_urls.spotify}
								target="_blank"
								rel="noopener noreferrer"
								className="font-bold border-b border-[#fff4] transition hover:border-white"
							>
								{data.track.name}
							</a>{" "}
							by{" "}
							{data.track.artists.map((artist, i) => (
								<span key={data.track?.id + artist.id}>
									<a
										href={artist.external_urls.spotify}
										target="_blank"
										rel="noopener noreferrer"
										className="border-b border-[#fff4] transition hover:border-white"
									>
										{artist.name}
									</a>
									{i < data.track?.artists.length! - 1
										? ", "
										: null}
								</span>
							))}
						</>
					) : (
						"Not Listening to Anything"
					)}
				</p>
				<p className="opacity-80">
					{data?.track ? (
						<>
							on{" "}
							<a
								href={data.track.album.external_urls.spotify}
								target="_blank"
								rel="noopener noreferrer"
								className="border-b border-[#fff4] transition hover:border-white"
							>
								{data.track.album.name}
							</a>
						</>
					) : null}
				</p>
				{showProgress && data?.track ? (
					<div className="opacity-80 mt-2 w-full max-w-sm">
						<span className="block h-0.5 rounded overflow-hidden bg-[#5e5e5e]">
							<span
								className="block h-full bg-white"
								style={{
									width: `${
										(progressMs / data.track.duration_ms) * 100
									}%`
								}}
							/>
						</span>
						<span className="flex items-center text-sm mt-2 gap-1">
							<span className="basis-full">
								{formatDuration(progressMs)}
							</span>
							<span className="flex items-center justify-center">
								{data.isPlayingNow ? (
									data.isPaused ? (
										<PlayIcon className="text-white h-4 w-4" />
									) : (
										<PauseIcon className="text-white h-4 w-4" />
									)
								) : (
									<Image
										src={SPOTIFY_LOGO}
										alt=""
										width={16}
										height={16}
										className="w-4 h-4"
									/>
								)}
							</span>
							<span className="basis-full text-right">
								{formatDuration(data.track.duration_ms)}
							</span>
						</span>
						{!data.isPlayingNow ? (
							<p className="text-sm mt-1 text-gray-400">
								{data.playedAt
									? `Last played ${formatPlayedAt(data.playedAt)}`
									: "Last played on Spotify"}
							</p>
						) : null}
					</div>
				) : (
					<p className="opacity-80 flex items-center gap-1">
						<span className="w-4 h-4 relative block flex-shrink-0">
							<Image
								src={SPOTIFY_LOGO}
								alt=""
								width={16}
								height={16}
								className="w-4 h-4"
							/>
						</span>
						Spotify
					</p>
				)}
			</div>
		</div>
	);
}
