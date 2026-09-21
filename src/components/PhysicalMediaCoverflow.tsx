import { useEffect, useRef, useState } from "preact/hooks";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { EffectCoverflow, Keyboard, Mousewheel, Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import useSWR from "swr";

import type { PhysicalMediaItem } from "../data/physicalMedia";
import { findOwnedPhysicalMedia } from "../lib/physicalMediaMatch";
import type { PhysicalMediaAlbumMeta } from "../lib/physicalMediaSpotifyMeta";
import type { NowPlayingResponse } from "../pages/api/nowPlaying";

import "swiper/swiper-bundle.css";

const nowPlayingFetcher = async (url: string): Promise<NowPlayingResponse> => {
	const response = await fetch(url);
	return response.json() as Promise<NowPlayingResponse>;
};

function formatAlbumSentence(
	meta: PhysicalMediaAlbumMeta,
	fallbackArtists?: string
): string {
	const artists = meta.artists || fallbackArtists || "an unknown artist";
	const year = meta.releaseYear;
	const count = meta.totalTracks;
	const isShow = meta.albumType === "show";
	const kind =
		meta.albumType === "album"
			? "Album"
			: meta.albumType === "single"
			? "Single"
			: meta.albumType === "compilation"
			? "Compilation"
			: meta.albumType === "show"
			? "Audiobook"
			: meta.albumType
			? meta.albumType.charAt(0).toUpperCase() + meta.albumType.slice(1)
			: "Release";

	const fromWord = isShow ? "by" : "from";
	let sentence = `${kind} ${fromWord} ${artists}`;

	if (year) {
		sentence += ` released in ${year}`;
	}

	if (count > 0) {
		const unit = isShow
			? count === 1
				? "episode"
				: "episodes"
			: count === 1
			? "track"
			: "tracks";
		sentence += `, with a total of ${count} ${unit}`;
	}

	return `${sentence}.`;
}

function formatAlbumCredit(meta: PhysicalMediaAlbumMeta): string | null {
	const parts = [meta.label, meta.copyright].filter(Boolean);
	if (parts.length === 0) return null;
	// Prefer a single credit line; copyright often already includes the label.
	if (meta.copyright) return meta.copyright;
	return meta.label;
}

type PhysicalMediaCoverflowProps = {
	items: PhysicalMediaItem[];
	spotifyMeta: Record<string, PhysicalMediaAlbumMeta>;
	ariaLabel: string;
	showNowPlaying?: boolean;
};

function StaticPhysicalMediaCoverflow({
	items,
	spotifyMeta,
	ariaLabel,
	eager
}: Pick<PhysicalMediaCoverflowProps, "items" | "spotifyMeta" | "ariaLabel"> & {
	eager: boolean;
}) {
	const item = items[0];
	if (!item) return null;

	const meta = spotifyMeta[item.id];
	const title = meta?.name ?? item.title ?? "Physical media item";
	const coverUrl = item.coverImageUrl ?? meta?.coverImageUrl;
	const formatLabel = item.format === "vinyl" ? "Vinyl" : "CD";

	return (
		<div className="album-coverflow">
			<div className="album-coverflow__stage">
				<div className="album-coverflow__stage-glow" aria-hidden />
				<div className="album-coverflow__static">
					<div className="album-coverflow__cover">
						{coverUrl ? (
							<Image
								src={coverUrl}
								alt={`${title} cover`}
								width={600}
								height={600}
								className="album-coverflow__cover-image"
								priority={eager}
								sizes="(min-width: 768px) 24vw, 88vw"
								draggable={false}
							/>
						) : (
							<div
								className="album-coverflow__cover-image album-coverflow__cover-image--placeholder"
								role="img"
								aria-label={`${title} artwork coming soon`}
							>
								<span className="album-coverflow__placeholder-format">
									{formatLabel}
								</span>
								<span className="album-coverflow__placeholder-note">
									Artwork coming soon
								</span>
							</div>
						)}
					</div>
				</div>
				<div className="album-coverflow__shelf" aria-hidden>
					<div className="album-coverflow__shelf-edge" />
				</div>
			</div>

			<div className="album-coverflow__footer">
				<div className="album-coverflow__progress">
					<div
						className="album-coverflow__progress-track"
						role="progressbar"
						aria-valuemin={1}
						aria-valuemax={items.length}
						aria-valuenow={1}
						aria-label="Collection position"
					>
						<div
							className="album-coverflow__progress-fill"
							style={{ transform: `scaleX(${1 / items.length})` }}
						/>
					</div>
					<p className="album-coverflow__progress-count">
						<span className="album-coverflow__progress-current">
							01
						</span>
						<span className="album-coverflow__progress-sep">/</span>
						<span>{String(items.length).padStart(2, "0")}</span>
					</p>
				</div>
				<div className="album-coverflow__caption">
					<p className="album-coverflow__title">{title}</p>
					<p className="album-coverflow__blurb">
						{meta
							? formatAlbumSentence(meta, item.artists)
							: item.description ??
							  `${formatLabel}${
									item.artists ? ` from ${item.artists}` : ""
							  }.`}
					</p>
				</div>
			</div>

			<noscript>
				<section
					className="album-coverflow__noscript"
					aria-label={`${ariaLabel} catalogue`}
				>
					<h3>Full catalogue</h3>
					<ol>
						{items.map(catalogueItem => (
							<li key={catalogueItem.id}>
								{spotifyMeta[catalogueItem.id]?.name ??
									catalogueItem.title ??
									catalogueItem.id}
							</li>
						))}
					</ol>
				</section>
			</noscript>
		</div>
	);
}

export function PhysicalMediaCoverflow({
	items,
	spotifyMeta,
	ariaLabel,
	showNowPlaying = false
}: PhysicalMediaCoverflowProps) {
	const [mounted, setMounted] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const swiperRef = useRef<SwiperInstance | null>(null);

	const total = items.length;
	const canNavigate = total > 1;
	const loop = total > 2;

	const { data: nowPlayingResponse } = useSWR<NowPlayingResponse>(
		mounted && showNowPlaying ? "/api/nowPlaying" : null,
		nowPlayingFetcher,
		{
			refreshInterval: data => {
				if (!data || "error" in data) return 60_000;
				return data.isPlayingNow ? 15_000 : 60_000;
			}
		}
	);
	const nowPlaying =
		nowPlayingResponse && "track" in nowPlayingResponse
			? nowPlayingResponse
			: undefined;

	const nowPlayingOwned =
		showNowPlaying && nowPlaying?.isPlayingNow && nowPlaying.track
			? findOwnedPhysicalMedia(nowPlaying.track.album.id)
			: undefined;

	const nowPlayingIndex = nowPlayingOwned
		? items.findIndex(item => item.id === nowPlayingOwned.id)
		: -1;

	useEffect(() => {
		setMounted(true);
	}, []);

	if (total === 0) {
		return null;
	}

	if (!mounted) {
		return (
			<StaticPhysicalMediaCoverflow
				items={items}
				spotifyMeta={spotifyMeta}
				ariaLabel={ariaLabel}
				eager={showNowPlaying}
			/>
		);
	}

	const activeItem = items[activeIndex];
	const activeSpotify = activeItem ? spotifyMeta[activeItem.id] : undefined;
	const activeCredit = activeSpotify
		? formatAlbumCredit(activeSpotify)
		: null;
	const progress = (activeIndex + 1) / total;

	const goToSlide = (index: number) => {
		const swiper = swiperRef.current;
		if (!swiper) return;
		if (loop) swiper.slideToLoop(index);
		else swiper.slideTo(index);
	};

	const syncActiveIndex = (swiper: SwiperInstance) => {
		setActiveIndex(loop ? swiper.realIndex : swiper.activeIndex);
	};

	return (
		<div
			className={
				nowPlayingIndex >= 0 &&
				nowPlayingOwned &&
				nowPlaying?.isPlayingNow &&
				nowPlaying.track
					? "album-coverflow album-coverflow--live group/carousel"
					: "album-coverflow group/carousel"
			}
		>
			{nowPlayingIndex >= 0 &&
			nowPlayingOwned &&
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

			<div className="album-coverflow__stage">
				<div className="album-coverflow__stage-glow" aria-hidden />

				{canNavigate ? (
					<button
						type="button"
						className="album-coverflow__nav album-coverflow__nav--prev focus-ring"
						aria-label={`Previous item in ${ariaLabel}`}
						onClick={() => swiperRef.current?.slidePrev()}
					>
						<ChevronLeftIcon className="h-7 w-7 md:h-8 md:w-8" />
					</button>
				) : null}

				<Swiper
					className="album-coverflow__swiper"
					aria-label={ariaLabel}
					aria-roledescription="carousel"
					modules={[EffectCoverflow, Keyboard, Mousewheel, Virtual]}
					effect="coverflow"
					grabCursor={canNavigate}
					centeredSlides
					initialSlide={0}
					loop={loop}
					loopAdditionalSlides={loop ? 3 : 0}
					rewind={!loop && canNavigate}
					slideToClickedSlide
					watchSlidesProgress
					virtual={{
						addSlidesBefore: 2,
						addSlidesAfter: 2,
						slidesPerViewAutoSlideSize: 406
					}}
					speed={220}
					keyboard={{ enabled: true, onlyInViewport: true }}
					mousewheel={{
						forceToAxis: true,
						releaseOnEdges: true,
						thresholdDelta: 20
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
				>
					{items.map((item, index) => {
						const isNowPlayingCd =
							nowPlayingOwned?.id === item.id &&
							nowPlaying?.isPlayingNow;
						const meta = spotifyMeta[item.id];
						const coverUrl =
							item.coverImageUrl ?? meta?.coverImageUrl;
						const coverAlt =
							item.title ?? meta?.name ?? "Album cover";
						const formatLabel =
							item.format === "vinyl" ? "Vinyl" : "CD";
						const distance = Math.min(
							Math.abs(index - activeIndex),
							total - Math.abs(index - activeIndex)
						);
						const loadEager = distance <= 2;

						return (
							<SwiperSlide
								key={item.id}
								virtualIndex={index}
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
											loading={
												loadEager ? "eager" : "lazy"
											}
											decoding="async"
											draggable={false}
										/>
									) : (
										<div
											className="album-coverflow__cover-image album-coverflow__cover-image--placeholder"
											role="img"
											aria-label={`${coverAlt} artwork coming soon`}
										>
											<span className="album-coverflow__placeholder-format">
												{formatLabel}
											</span>
											<span className="album-coverflow__placeholder-note">
												Artwork coming soon
											</span>
										</div>
									)}
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>

				{canNavigate ? (
					<button
						type="button"
						className="album-coverflow__nav album-coverflow__nav--next focus-ring"
						aria-label={`Next item in ${ariaLabel}`}
						onClick={() => swiperRef.current?.slideNext()}
					>
						<ChevronRightIcon className="h-7 w-7 md:h-8 md:w-8" />
					</button>
				) : null}

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
							<span className="album-coverflow__progress-sep">
								/
							</span>
							<span>{String(total).padStart(2, "0")}</span>
						</p>
					</div>

					<div className="album-coverflow__caption">
						<p className="album-coverflow__title">
							{activeSpotify?.name ??
								activeItem.title ??
								"\u00a0"}
						</p>
						{activeSpotify ? (
							<>
								<p className="album-coverflow__blurb">
									{formatAlbumSentence(
										activeSpotify,
										activeItem.artists
									)}
								</p>
								<p className="album-coverflow__credit">
									{activeCredit ? (
										<>
											<span>{activeCredit}</span>
											<span
												className="album-coverflow__details-sep"
												aria-hidden
											>
												·
											</span>
										</>
									) : null}
									<a
										href={activeSpotify.spotifyUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="album-coverflow__spotify-link focus-ring"
									>
										Listen on Spotify
									</a>
								</p>
							</>
						) : (
							<p className="album-coverflow__blurb">
								{activeItem.description ??
									`${
										activeItem.format === "vinyl"
											? "Vinyl"
											: "CD"
									}${
										activeItem.artists
											? ` from ${activeItem.artists}`
											: ""
									}.`}
							</p>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
