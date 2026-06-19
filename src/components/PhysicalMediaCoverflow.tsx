import { useEffect, useRef, useState } from "preact/hooks";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import {
	EffectCoverflow,
	Keyboard,
	Mousewheel
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import useSWR from "swr";

import { listedPhysicalMediaCollection } from "../data/physicalMedia";
import { sampleCoverAccent } from "../lib/coverColor";
import { findOwnedPhysicalMedia } from "../lib/physicalMediaMatch";
import type { NowPlayingResponseSuccess } from "../pages/api/nowPlaying";
import type { PhysicalMediaAlbumMeta } from "../pages/api/physicalMedia";

import "swiper/swiper-bundle.css";

const FALLBACK_ACCENT = "rgb(52 211 153)";

const nowPlayingFetcher = (url: string) => fetch(url).then(res => res.json());

function formatAlbumMeta(meta: PhysicalMediaAlbumMeta): string {
	const trackLabel =
		meta.albumType === "show"
			? `${meta.totalTracks} episodes`
			: `${meta.totalTracks} tracks`;
	const typeLabel =
		meta.albumType === "album"
			? null
			: meta.albumType === "show"
				? "Audiobook"
				: meta.albumType.charAt(0).toUpperCase() + meta.albumType.slice(1);

	const parts = [
		meta.releaseYear,
		meta.label,
		trackLabel,
		typeLabel
	].filter(Boolean);

	return parts.join(" · ");
}

export function PhysicalMediaCoverflow() {
	const [mounted, setMounted] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [accentColor, setAccentColor] = useState(FALLBACK_ACCENT);
	const [spotifyMeta, setSpotifyMeta] = useState<
		Record<string, PhysicalMediaAlbumMeta>
	>({});
	const [spotifyLoaded, setSpotifyLoaded] = useState(false);
	const swiperRef = useRef<SwiperInstance | null>(null);

	const total = listedPhysicalMediaCollection.length;
	const canNavigate = total > 1;

	const { data: nowPlaying } = useSWR<NowPlayingResponseSuccess>(
		mounted ? "/api/nowPlaying" : null,
		nowPlayingFetcher,
		{ refreshInterval: 5000 }
	);

	const nowPlayingOwned =
		nowPlaying?.isPlayingNow && nowPlaying.track
			? findOwnedPhysicalMedia(nowPlaying.track.album.id)
			: undefined;

	const nowPlayingIndex = nowPlayingOwned
		? listedPhysicalMediaCollection.findIndex(
				item => item.id === nowPlayingOwned.id
			)
		: -1;

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		fetch("/api/physicalMedia")
			.then(res => res.json())
			.then(data => {
				if (data.error || !data.albums) return;
				setSpotifyMeta(data.albums);
			})
			.catch(console.error)
			.finally(() => setSpotifyLoaded(true));
	}, []);

	useEffect(() => {
		if (!mounted || total === 0) return;

		const item = listedPhysicalMediaCollection[activeIndex];
		const cover = item ? spotifyMeta[item.id]?.coverImageUrl : undefined;
		if (!cover) return;

		let cancelled = false;
		sampleCoverAccent(cover).then(color => {
			if (!cancelled) setAccentColor(color);
		});

		return () => {
			cancelled = true;
		};
	}, [activeIndex, mounted, spotifyMeta, total]);

	if (!mounted || total === 0) {
		return <div className="album-coverflow min-h-[20rem]" aria-hidden />;
	}

	const activeItem = listedPhysicalMediaCollection[activeIndex];
	const activeSpotify = activeItem ? spotifyMeta[activeItem.id] : undefined;
	const progress = total <= 1 ? 1 : activeIndex / (total - 1);

	const goToSlide = (index: number) => {
		swiperRef.current?.slideTo(index);
	};

	const syncActiveIndex = (swiper: SwiperInstance) => {
		setActiveIndex(swiper.activeIndex);
	};

	return (
		<div
			className="album-coverflow group/carousel"
			style={
				{
					"--album-accent": accentColor
				} as Record<string, string>
			}
		>
			<div className="album-coverflow__stage">
				<div className="album-coverflow__stage-glow" aria-hidden />

				{nowPlayingOwned &&
				nowPlaying?.isPlayingNow &&
				nowPlaying.track ? (
					<div className="album-coverflow__now-playing" role="status">
						<span
							className="album-coverflow__now-playing-dot"
							aria-hidden
						/>
						<span className="album-coverflow__now-playing-label">
							Now playing
						</span>
						<a
							href={nowPlaying.track.external_urls.spotify}
							target="_blank"
							rel="noopener noreferrer"
							className="album-coverflow__now-playing-track focus-ring"
						>
							{nowPlaying.track.name}
						</a>
						{activeIndex !== nowPlayingIndex ? (
							<>
								<span
									className="album-coverflow__now-playing-sep"
									aria-hidden
								>
									·
								</span>
								<button
									type="button"
									className="album-coverflow__now-playing-jump focus-ring"
									onClick={() => goToSlide(nowPlayingIndex)}
								>
									on {nowPlayingOwned.title}
								</button>
							</>
						) : null}
					</div>
				) : null}

				<button
					type="button"
					className="album-coverflow__nav album-coverflow__nav--prev focus-ring"
					aria-label="Previous album"
					onClick={() => swiperRef.current?.slidePrev()}
				>
					<ChevronLeftIcon className="h-7 w-7 md:h-8 md:w-8" />
				</button>

				<Swiper
					className="album-coverflow__swiper"
					modules={[EffectCoverflow, Keyboard, Mousewheel]}
					effect="coverflow"
					grabCursor={canNavigate}
					centeredSlides
					rewind={canNavigate}
					slideToClickedSlide
					watchSlidesProgress
					speed={180}
					keyboard={{ enabled: true }}
					mousewheel={{
						enabled: true,
						forceToAxis: false,
						releaseOnEdges: true,
						thresholdDelta: 15,
						thresholdTime: 100,
						eventsTarget: ".album-coverflow__stage"
					}}
					spaceBetween={14}
					slidesPerView="auto"
					breakpoints={{
						768: {
							spaceBetween: 22
						}
					}}
					coverflowEffect={{
						rotate: 24,
						stretch: 4,
						depth: 44,
						modifier: 1,
						slideShadows: false
					}}
					onSwiper={(swiper: SwiperInstance) => {
						swiperRef.current = swiper;
						syncActiveIndex(swiper);
					}}
					onSlideChange={syncActiveIndex}
					onSlideChangeTransitionEnd={syncActiveIndex}
				>
					{listedPhysicalMediaCollection.map(item => {
						const isNowPlayingCd =
							nowPlayingOwned?.id === item.id && nowPlaying?.isPlayingNow;
						const meta = spotifyMeta[item.id];
						const coverUrl = meta?.coverImageUrl;
						const coverAlt = meta?.name ?? item.title ?? "Album cover";

						return (
							<SwiperSlide
								key={item.id}
								className={
									isNowPlayingCd
										? "album-coverflow__slide album-coverflow__slide--now-playing"
										: "album-coverflow__slide"
								}
							>
								<div className="album-coverflow__cover">
									{coverUrl ? (
										<img
											src={coverUrl}
											alt={`${coverAlt} cover`}
											width={600}
											height={600}
											className="album-coverflow__cover-image"
											loading="eager"
											decoding="async"
											draggable={false}
										/>
									) : (
										<div
											className="album-coverflow__cover-image album-coverflow__cover-image--loading"
											role="img"
											aria-label={
												spotifyLoaded
													? `${coverAlt} cover unavailable`
													: `Loading ${coverAlt} cover`
											}
										/>
									)}
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>

				<button
					type="button"
					className="album-coverflow__nav album-coverflow__nav--next focus-ring"
					aria-label="Next album"
					onClick={() => swiperRef.current?.slideNext()}
				>
					<ChevronRightIcon className="h-7 w-7 md:h-8 md:w-8" />
				</button>

				<div className="album-coverflow__shelf" aria-hidden>
					<div className="album-coverflow__shelf-edge" />
				</div>
			</div>

			{activeItem ? (
				<div className="album-coverflow__footer">
					<div className="album-coverflow__progress">
						<div
							className="album-coverflow__progress-track"
							role="progressbar"
							aria-valuemin={1}
							aria-valuemax={total}
							aria-valuenow={activeIndex + 1}
							aria-label="Collection position"
						>
							<div
								className="album-coverflow__progress-fill"
								style={{ transform: `scaleX(${progress})` }}
							/>
						</div>
						<p className="album-coverflow__progress-count">
							<span className="album-coverflow__progress-current">
								{String(activeIndex + 1).padStart(2, "0")}
							</span>
							<span className="album-coverflow__progress-sep">/</span>
							<span>{String(total).padStart(2, "0")}</span>
						</p>
					</div>

					<div className="album-coverflow__caption">
						<p className="album-coverflow__title">
							{activeSpotify?.name ?? activeItem.title ?? "\u00a0"}
						</p>
						<p className="album-coverflow__artist">
							{activeSpotify?.artists ??
								activeItem.artists ??
								"\u00a0"}
						</p>
						<p
							className={
								activeSpotify
									? "album-coverflow__meta"
									: "album-coverflow__meta album-coverflow__meta--loading"
							}
						>
							{activeSpotify
								? formatAlbumMeta(activeSpotify)
								: spotifyLoaded
									? "\u00a0"
									: "Loading album details…"}
						</p>
						<p
							className="album-coverflow__copyright"
							aria-hidden={!activeSpotify?.copyright}
						>
							{activeSpotify?.copyright ?? "\u00a0"}
						</p>
						<p className="album-coverflow__spotify-link-slot">
							{activeSpotify ? (
								<a
									href={activeSpotify.spotifyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="album-coverflow__spotify-link focus-ring"
								>
									Listen on Spotify
								</a>
							) : (
								<span
									className="album-coverflow__spotify-link album-coverflow__spotify-link--placeholder"
									aria-hidden
								>
									Listen on Spotify
								</span>
							)}
						</p>
					</div>
				</div>
			) : null}
		</div>
	);
}
