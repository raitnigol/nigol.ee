import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import Image from "next/future/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { EffectCoverflow, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import useSWR from "swr";

import {
	physicalMediaCollection,
	type PhysicalMediaItem
} from "../data/physicalMedia";
import { sampleCoverAccent } from "../lib/coverColor";
import { findOwnedPhysicalMedia } from "../lib/physicalMediaMatch";
import type { NowPlayingResponseSuccess } from "../pages/api/nowPlaying";
import type { PhysicalMediaAlbumMeta } from "../pages/api/physicalMedia";

import "swiper/swiper-bundle.css";

const FALLBACK_ACCENT = "rgb(52 211 153)";

const nowPlayingFetcher = (url: string) => fetch(url).then(res => res.json());

function edgePadding(count: number) {
	if (count <= 1) return 0;
	return Math.min(2, Math.floor(count / 2));
}

function buildSlides(items: PhysicalMediaItem[], pad: number) {
	if (pad === 0) {
		return items.map(item => ({ item, slideKey: item.id }));
	}

	const head = items.slice(-pad);
	const tail = items.slice(0, pad);

	return [
		...head.map((item, index) => ({
			item,
			slideKey: `head-${item.id}-${index}`
		})),
		...items.map(item => ({ item, slideKey: item.id })),
		...tail.map((item, index) => ({
			item,
			slideKey: `tail-${item.id}-${index}`
		}))
	];
}

function toRealIndex(swiperIndex: number, pad: number, total: number) {
	if (pad === 0) return swiperIndex;
	if (swiperIndex < pad) return swiperIndex + total - pad;
	if (swiperIndex >= pad + total) return swiperIndex - pad - total;
	return swiperIndex - pad;
}

function formatAlbumMeta(meta: PhysicalMediaAlbumMeta): string {
	const parts = [
		meta.releaseYear,
		meta.label,
		`${meta.totalTracks} tracks`,
		meta.albumType !== "album"
			? meta.albumType.charAt(0).toUpperCase() + meta.albumType.slice(1)
			: null
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
	const containerRef = useRef<HTMLDivElement>(null);

	const total = physicalMediaCollection.length;
	const pad = edgePadding(total);
	const slides = useMemo(() => buildSlides(physicalMediaCollection, pad), [pad]);
	const initialIndex = pad;

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
		? physicalMediaCollection.findIndex(item => item.id === nowPlayingOwned.id)
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
		const el = containerRef.current;
		if (!el || !mounted) return;

		let lastStep = 0;

		const onWheel = (event: WheelEvent) => {
			const swiper = swiperRef.current;
			if (!swiper) return;

			if (Math.abs(event.deltaY) < 4) return;
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

			event.preventDefault();

			const now = Date.now();
			if (now - lastStep < 50) return;
			lastStep = now;

			if (event.deltaY > 0) {
				swiper.slideNext();
				return;
			}
			swiper.slidePrev();
		};

		el.addEventListener("wheel", onWheel, { passive: false });

		return () => {
			el.removeEventListener("wheel", onWheel);
		};
	}, [mounted]);

	useEffect(() => {
		if (!mounted || total === 0) return;

		const cover = physicalMediaCollection[activeIndex]?.coverImage;
		if (!cover) return;

		let cancelled = false;
		sampleCoverAccent(cover).then(color => {
			if (!cancelled) setAccentColor(color);
		});

		return () => {
			cancelled = true;
		};
	}, [activeIndex, mounted, total]);

	if (!mounted || total === 0) {
		return <div className="album-coverflow min-h-[20rem]" aria-hidden />;
	}

	const activeItem = physicalMediaCollection[activeIndex];
	const activeSpotify = activeItem ? spotifyMeta[activeItem.id] : undefined;

	const progress = total <= 1 ? 1 : activeIndex / (total - 1);

	const goPrev = () => {
		swiperRef.current?.slidePrev();
	};

	const goNext = () => {
		swiperRef.current?.slideNext();
	};

	const goToSlide = (index: number) => {
		swiperRef.current?.slideTo(index + pad);
	};

	const fixLoopPosition = (swiper: SwiperInstance) => {
		if (pad === 0) return;

		let index = swiper.activeIndex;

		if (index < pad) {
			index += total;
			swiper.slideTo(index, 0, false);
		} else if (index >= pad + total) {
			index -= total;
			swiper.slideTo(index, 0, false);
		}

		setActiveIndex(toRealIndex(index, pad, total));
	};

	return (
		<div
			ref={containerRef}
			className="album-coverflow group/carousel"
			style={
				{
					"--album-accent": accentColor
				} as Record<string, string>
			}
		>
			<div
				className={[
					"album-coverflow__stage",
					nowPlayingOwned && nowPlaying?.isPlayingNow
						? "album-coverflow__stage--now-playing"
						: ""
				]
					.filter(Boolean)
					.join(" ")}
			>
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
					onClick={goPrev}
					aria-label="Previous album"
				>
					<ChevronLeftIcon className="h-7 w-7 md:h-8 md:w-8" />
				</button>

				<Swiper
					className="album-coverflow__swiper"
					modules={[EffectCoverflow, Keyboard]}
					effect="coverflow"
					grabCursor
					centeredSlides
					slideToClickedSlide
					watchSlidesProgress
					speed={280}
					keyboard={{ enabled: true }}
					spaceBetween={20}
					breakpoints={{
						0: {
							slidesPerView: 1,
							spaceBetween: 28
						},
						768: {
							slidesPerView: 3,
							spaceBetween: 20
						}
					}}
					initialSlide={initialIndex}
					coverflowEffect={{
						rotate: 22,
						stretch: 10,
						depth: 40,
						modifier: 1,
						slideShadows: false
					}}
					onSwiper={(swiper: SwiperInstance) => {
						swiperRef.current = swiper;
						swiper.slideTo(initialIndex, 0, false);
						setActiveIndex(0);
					}}
					onSlideChange={(swiper: SwiperInstance) => {
						setActiveIndex(toRealIndex(swiper.activeIndex, pad, total));
					}}
					onSlideChangeTransitionEnd={(swiper: SwiperInstance) => {
						fixLoopPosition(swiper);
					}}
				>
					{slides.map(({ item, slideKey }, index) => {
						const isNowPlayingCd =
							nowPlayingOwned?.id === item.id && nowPlaying?.isPlayingNow;

						return (
							<SwiperSlide
								key={slideKey}
								className={
									isNowPlayingCd
										? "album-coverflow__slide album-coverflow__slide--now-playing"
										: "album-coverflow__slide"
								}
							>
								<div className="album-coverflow__cover">
									<Image
										src={item.coverImage}
										alt={`${item.title} cover`}
										width={600}
										height={600}
										className="album-coverflow__image"
										priority={index >= pad && index < pad + 2}
									/>
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>

				<button
					type="button"
					className="album-coverflow__nav album-coverflow__nav--next focus-ring"
					onClick={goNext}
					aria-label="Next album"
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
							<div className="album-coverflow__progress-ticks">
								{physicalMediaCollection.map((item, index) => (
									<button
										key={item.id}
										type="button"
										className={[
											"album-coverflow__progress-tick",
											index === activeIndex
												? "album-coverflow__progress-tick--active"
												: "",
											index < activeIndex
												? "album-coverflow__progress-tick--passed"
												: "",
											index === nowPlayingIndex &&
											nowPlaying?.isPlayingNow
												? "album-coverflow__progress-tick--now-playing"
												: ""
										]
											.filter(Boolean)
											.join(" ")}
										aria-label={`${item.title}${
											index === activeIndex ? " (current)" : ""
										}`}
										aria-current={index === activeIndex ? "true" : undefined}
										onClick={() => goToSlide(index)}
									/>
								))}
							</div>
						</div>
						<p className="album-coverflow__progress-count">
							<span className="album-coverflow__progress-current">
								{String(activeIndex + 1).padStart(2, "0")}
							</span>
							<span className="album-coverflow__progress-sep">/</span>
							<span>{String(total).padStart(2, "0")}</span>
						</p>
					</div>

					<div className="album-coverflow__caption" key={activeItem.id}>
						<p className="album-coverflow__title">
							{activeSpotify?.name ?? activeItem.title}
						</p>
						<p className="album-coverflow__artist">
							{activeSpotify?.artists ?? activeItem.artists ?? "\u00a0"}
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
