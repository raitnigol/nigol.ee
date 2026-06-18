import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { getReleaseYear } from "../lib/spotify";
import { RankBadge } from "./RankBadge";

interface TrackListProps {
	tracks?: SpotifyApi.TrackObjectFull[];
	priority?: boolean;
	isActive?: boolean;
	onActivate?: () => void;
}

export function TrackList({
	tracks,
	priority = false,
	isActive = false,
	onActivate
}: TrackListProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateScrollState = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;

		const { scrollLeft, scrollWidth, clientWidth } = el;
		setCanScrollLeft(scrollLeft > 4);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
	}, []);

	useEffect(() => {
		updateScrollState();

		const el = scrollRef.current;
		if (!el) return;

		const onScroll = () => {
			onActivate?.();
			updateScrollState();
		};

		el.addEventListener("scroll", onScroll, { passive: true });
		const resizeObserver = new ResizeObserver(updateScrollState);
		resizeObserver.observe(el);

		return () => {
			el.removeEventListener("scroll", onScroll);
			resizeObserver.disconnect();
		};
	}, [tracks, updateScrollState, onActivate]);

	const scrollBy = (direction: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;

		onActivate?.();
		el.scrollBy({
			left:
				direction === "left"
					? -el.clientWidth * 0.85
					: el.clientWidth * 0.85,
			behavior: "smooth"
		});
	};

	const handleActivate = () => onActivate?.();

	return (
		<section
			className={`group/carousel relative mb-12 min-w-0 transition-opacity duration-300 ${
				isActive ? "opacity-100" : "opacity-75 hover:opacity-90"
			}`}
			aria-label="Top tracks"
			aria-roledescription="carousel"
			onPointerDown={handleActivate}
		>
			<div
				ref={scrollRef}
				className="overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
			>
				<div className="grid w-max grid-flow-col grid-rows-2 gap-3 md:gap-x-4 md:gap-y-6 auto-cols-[8.25rem] xs:auto-cols-[9rem] md:auto-cols-[10rem] lg:auto-cols-[10.5rem]">
					{tracks
						? tracks.map((track, index) => (
								<Track
									key={track.id}
									track={track}
									rank={index + 1}
									priority={priority}
								/>
						  ))
						: [...new Array(24)].map((_, i) => (
								<div
									key={i}
									className="snap-start snap-always flex flex-col animate-pulse"
								>
									<div className="aspect-square w-full rounded-lg bg-slate-900" />
									<div className="mt-2 hidden flex-col gap-1.5 md:flex">
										<div className="h-3.5 w-full rounded bg-slate-800" />
										<div className="h-3 w-4/5 rounded bg-slate-800" />
									</div>
								</div>
						  ))}
				</div>
			</div>

			<CarouselArrow
				direction="left"
				disabled={!canScrollLeft}
				onClick={() => scrollBy("left")}
				label="Scroll tracks left"
			/>
			<CarouselArrow
				direction="right"
				disabled={!canScrollRight}
				onClick={() => scrollBy("right")}
				label="Scroll tracks right"
			/>
		</section>
	);
}

interface CarouselArrowProps {
	direction: "left" | "right";
	disabled: boolean;
	onClick: () => void;
	label: string;
}

function CarouselArrow({
	direction,
	disabled,
	onClick,
	label
}: CarouselArrowProps) {
	const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={event => {
				event.stopPropagation();
				onClick();
			}}
			aria-label={label}
			className={`focus-ring absolute top-1/2 z-10 -translate-y-1/2 rounded-lg bg-black/60 p-2 text-white backdrop-blur-sm transition-opacity duration-200 hover:bg-black/75 ${
				direction === "left" ? "left-1 md:left-2" : "right-1 md:right-2"
			} ${
				disabled
					? "pointer-events-none opacity-0"
					: "pointer-events-none opacity-0 group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:opacity-100"
			}`}
		>
			<Icon className="h-7 w-7 md:h-8 md:w-8" />
		</button>
	);
}

interface TrackProps {
	track: SpotifyApi.TrackObjectFull;
	rank: number;
	priority: boolean;
}

function Track({ track, rank, priority }: TrackProps) {
	const coverUrl = track.album.images[0]?.url;
	const isRemoteCover = coverUrl?.startsWith("http") ?? false;
	const artistLine = track.artists.map(artist => artist.name).join(", ");
	const releaseYear = getReleaseYear(track.album.release_date);

	return (
		<a
			href={track.external_urls.spotify}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex snap-start snap-always flex-col"
		>
			<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-900">
				<RankBadge rank={rank} />
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={track.name}
						width={512}
						height={512}
						priority={priority}
						unoptimized={isRemoteCover}
						className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
					/>
				) : null}

				<div className="absolute inset-0 z-10 flex flex-col justify-end rounded-lg bg-black/0 p-2 transition duration-300 group-hover:bg-black/50 md:hidden">
					<div className="translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
						<p className="font-bold text-base leading-tight line-clamp-2">
							{track.name}
						</p>
						<p className="mt-0.5 text-xs leading-tight text-secondary line-clamp-2">
							{artistLine}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-2 hidden min-w-0 flex-col md:flex">
				<p className="font-bold text-sm leading-snug text-white line-clamp-2 transition group-hover:text-violet-300">
					{track.name}
				</p>
				<p className="mt-0.5 text-xs leading-snug text-muted line-clamp-2">
					{artistLine}
				</p>
				{releaseYear ? (
					<p className="mt-0.5 text-xs text-subtle">{releaseYear}</p>
				) : null}
			</div>
		</a>
	);
}
