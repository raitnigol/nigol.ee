import { useEffect, useRef, useState } from "preact/hooks";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import {
	EffectCoverflow,
	Keyboard,
	Mousewheel
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { useRouter } from "next/router";
import useSWR from "swr";

import { listedPhysicalMediaCollection } from "../data/physicalMedia";
import { sampleCoverAccent } from "../lib/coverColor";
import {
	findOwnedPhysicalMedia,
	getPhysicalMediaIdFromHash,
	getListedPhysicalMediaIndex,
	physicalMediaAlbumHref
} from "../lib/physicalMediaMatch";
import type { NowPlayingResponseSuccess } from "../pages/api/nowPlaying";
import type { PhysicalMediaAlbumMeta } from "../pages/api/physicalMedia";

import "swiper/swiper-bundle.css";

const FALLBACK_ACCENT = "rgb(52 211 153)";

const nowPlayingFetcher = (url: string) => fetch(url).then(res => res.json());

function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveFocusIndex(focusId?: string | null): number {
	if (focusId) {
		const index = getListedPhysicalMediaIndex(focusId);
		if (index >= 0) return index;
	}

	if (typeof window === "undefined") return 0;
	const hashId = getPhysicalMediaIdFromHash(window.location.hash);
	if (!hashId) return 0;
	const hashIndex = getListedPhysicalMediaIndex(hashId);
	return hashIndex >= 0 ? hashIndex : 0;
}

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
							? meta.albumType.charAt(0).toUpperCase() +
								meta.albumType.slice(1)
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
	/** Album id from `/physical-media/[id]` — sets initial slide + disc-pull. */
	focusId?: string | null;
	/** Keep the URL in sync with the active disc (album deep-link pages). */
	syncUrl?: boolean;
};

export function PhysicalMediaCoverflow({
	focusId = null,
	syncUrl = false
}: PhysicalMediaCoverflowProps) {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [accentColor, setAccentColor] = useState(FALLBACK_ACCENT);
	const [spotifyMeta, setSpotifyMeta] = useState<
		Record<string, PhysicalMediaAlbumMeta>
	>({});
	const [spotifyLoaded, setSpotifyLoaded] = useState(false);
	const [discPull, setDiscPull] = useState(false);
	const swiperRef = useRef<SwiperInstance | null>(null);
	const initialSlideRef = useRef(0);
	const skipUrlSyncRef = useRef(true);

	const total = listedPhysicalMediaCollection.length;
	const canNavigate = total > 1;
	const loop = total > 2;

	const { data: nowPlaying } = useSWR<NowPlayingResponseSuccess>(
		mounted ? "/api/nowPlaying" : null,
		nowPlayingFetcher,
		{
			refreshInterval: data => {
				if (!data || "error" in data) return 60_000;
				return data.isPlayingNow ? 15_000 : 60_000;
			}
		}
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
		const index = resolveFocusIndex(focusId);
		initialSlideRef.current = index;
		setActiveIndex(index);
		setMounted(true);

		if (focusId && index >= 0 && !prefersReducedMotion()) {
			setDiscPull(true);
		}
	}, [focusId]);

	useEffect(() => {
		const onHashChange = () => {
			const id = getPhysicalMediaIdFromHash(window.location.hash);
			if (!id) return;
			const index = getListedPhysicalMediaIndex(id);
			if (index < 0) return;
			const swiper = swiperRef.current;
			if (!swiper) return;
			if (loop) swiper.slideToLoop(index);
			else swiper.slideTo(index);
		};

		window.addEventListener("hashchange", onHashChange);
		return () => window.removeEventListener("hashchange", onHashChange);
	}, [loop]);

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

	useEffect(() => {
		if (!syncUrl || !mounted) return;

		const item = listedPhysicalMediaCollection[activeIndex];
		if (!item) return;

		const nextPath = physicalMediaAlbumHref(item.id);
		const currentPath = router.asPath.split("?")[0]?.split("#")[0] ?? "";
		if (currentPath === nextPath) {
			skipUrlSyncRef.current = false;
			return;
		}

		// Skip the first sync right after mount — URL already matches focusId.
		if (skipUrlSyncRef.current) {
			skipUrlSyncRef.current = false;
			return;
		}

		void router.replace(nextPath, undefined, { shallow: true, scroll: false });
	}, [activeIndex, mounted, router, syncUrl]);

	if (!mounted || total === 0) {
		return <div className="album-coverflow min-h-[20rem]" aria-hidden />;
	}

	const activeItem = listedPhysicalMediaCollection[activeIndex];
	const activeSpotify = activeItem ? spotifyMeta[activeItem.id] : undefined;
	const activeCredit = activeSpotify
		? formatAlbumCredit(activeSpotify)
		: null;
	const progress = total <= 1 ? 1 : activeIndex / (total - 1);

	const goToSlide = (index: number) => {
		const swiper = swiperRef.current;
		if (!swiper) return;
		if (loop) swiper.slideToLoop(index);
		else swiper.slideTo(index);
	};

	const syncActiveIndex = (swiper: SwiperInstance) => {
		setActiveIndex(loop ? swiper.realIndex : swiper.activeIndex);
	};

	const handleDiscPullEnd = () => {
		setDiscPull(false);
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
					initialSlide={initialSlideRef.current}
					loop={loop}
					loopAdditionalSlides={loop ? 3 : 0}
					rewind={!loop && canNavigate}
					slideToClickedSlide
					watchSlidesProgress
					speed={220}
					keyboard={{ enabled: true }}
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
					onSlideChangeTransitionEnd={syncActiveIndex}
				>
					{listedPhysicalMediaCollection.map((item, index) => {
						const isNowPlayingCd =
							nowPlayingOwned?.id === item.id && nowPlaying?.isPlayingNow;
						const meta = spotifyMeta[item.id];
						const coverUrl = meta?.coverImageUrl;
						const coverAlt = meta?.name ?? item.title ?? "Album cover";
						const distance = Math.min(
							Math.abs(index - activeIndex),
							total - Math.abs(index - activeIndex)
						);
						const loadEager = distance <= 2;

						return (
							<SwiperSlide
								key={item.id}
								className={
									isNowPlayingCd
										? "album-coverflow__slide album-coverflow__slide--now-playing"
										: "album-coverflow__slide"
								}
							>
								<div
									className={
										discPull && index === activeIndex
											? "album-coverflow__cover album-coverflow__cover--disc-pull"
											: "album-coverflow__cover"
									}
									onAnimationEnd={
										discPull && index === activeIndex
											? handleDiscPullEnd
											: undefined
									}
								>
									{coverUrl ? (
										<img
											src={coverUrl}
											alt={`${coverAlt} cover`}
											width={600}
											height={600}
											className="album-coverflow__cover-image"
											loading={loadEager ? "eager" : "lazy"}
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
							<p
								className={
									spotifyLoaded
										? "album-coverflow__blurb"
										: "album-coverflow__blurb album-coverflow__blurb--loading"
								}
							>
								{spotifyLoaded ? "\u00a0" : "Loading album details…"}
							</p>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
