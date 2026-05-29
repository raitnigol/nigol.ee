import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { getArtistImageUrl } from "../lib/spotify";
import { RankBadge } from "./RankBadge";

interface ArtistListProps {
	artists?: SpotifyApi.ArtistObjectFull[];
	priority?: boolean;
	isActive?: boolean;
	onActivate?: () => void;
}

export function ArtistList({
	artists,
	priority = false,
	isActive = false,
	onActivate
}: ArtistListProps) {
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
	}, [artists, updateScrollState, onActivate]);

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

	const artistGrid = (
		<div
			ref={scrollRef}
			className="overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
			onPointerDown={handleActivate}
		>
			<div className="grid w-max grid-flow-col grid-rows-2 gap-3 md:gap-x-4 md:gap-y-6 auto-cols-[8.25rem] xs:auto-cols-[9rem] md:auto-cols-[10rem] lg:auto-cols-[10.5rem]">
				{artists
					? artists.map((artist, index) => (
							<ArtistCard
								key={artist.id}
								artist={artist}
								rank={index + 1}
								priority={priority}
							/>
					  ))
					: [...new Array(24)].map((_, i) => (
							<div
								key={i}
								className="snap-start snap-always flex flex-col items-center animate-pulse"
							>
								<div className="aspect-square w-full rounded-lg bg-slate-900" />
								<div className="mt-2 h-3 w-full rounded bg-slate-800" />
							</div>
					  ))}
			</div>
		</div>
	);

	if (!isActive) {
		return (
			<section
				className="mb-12 min-w-0 rounded-xl transition-opacity duration-300 opacity-75 hover:opacity-90"
				aria-label="Top artists"
				onPointerDown={handleActivate}
			>
				{artistGrid}
			</section>
		);
	}

	return (
		<section
			className="mb-12 min-w-0"
			aria-label="Top artists"
			aria-roledescription="carousel"
		>
			<div className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 items-center">
				<div className="flex min-h-[11rem] w-10 flex-shrink-0 items-center justify-end sm:w-12 md:min-h-[15rem] md:min-w-[2.75rem] md:flex-1 md:max-w-[max(2.75rem,calc((100vw-700px)/2))] lg:max-w-[max(2.75rem,calc((100vw-800px)/2))]">
					<CarouselArrow
						direction="left"
						disabled={!canScrollLeft}
						onClick={() => scrollBy("left")}
						label="Scroll artists left"
					/>
				</div>

				<div className="min-w-0 w-full flex-shrink-0 md:w-[700px] lg:w-[800px]">
					{artistGrid}
				</div>

				<div className="flex min-h-[11rem] w-10 flex-shrink-0 items-center justify-start sm:w-12 md:min-h-[15rem] md:min-w-[2.75rem] md:flex-1 md:max-w-[max(2.75rem,calc((100vw-700px)/2))] lg:max-w-[max(2.75rem,calc((100vw-800px)/2))]">
					<CarouselArrow
						direction="right"
						disabled={!canScrollRight}
						nudge={canScrollRight}
						onClick={() => scrollBy("right")}
						label="Scroll artists right"
					/>
				</div>
			</div>
		</section>
	);
}

interface CarouselArrowProps {
	direction: "left" | "right";
	disabled: boolean;
	nudge?: boolean;
	onClick: () => void;
	label: string;
}

function CarouselArrow({
	direction,
	disabled,
	nudge = false,
	onClick,
	label
}: CarouselArrowProps) {
	const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			aria-label={label}
			className="focus-ring p-2 text-white transition-[opacity,transform] duration-200 enabled:opacity-90 enabled:hover:opacity-100 disabled:cursor-default disabled:opacity-20"
		>
			<Icon
				className={`h-7 w-7 md:h-8 md:w-8 ${
					nudge
						? "motion-safe:animate-[nudge-right_1.4s_ease-in-out_infinite]"
						: ""
				}`}
			/>
		</button>
	);
}

interface ArtistCardProps {
	artist: SpotifyApi.ArtistObjectFull;
	rank: number;
	priority: boolean;
}

function ArtistCard({ artist, rank, priority }: ArtistCardProps) {
	const imageUrl = getArtistImageUrl(artist);
	const isRemoteImage = imageUrl?.startsWith("http") ?? false;

	return (
		<a
			href={artist.external_urls.spotify}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex snap-start snap-always flex-col"
		>
			<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-900">
				<RankBadge rank={rank} />
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={artist.name}
						width={320}
						height={320}
						priority={priority}
						unoptimized={isRemoteImage}
						className="h-full w-full object-cover rounded-lg transition duration-300 group-hover:scale-[1.02]"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-600">
						{artist.name.charAt(0)}
					</div>
				)}
			</div>
			<p className="mt-2 w-full text-sm font-bold leading-snug text-white line-clamp-2 transition group-hover:text-violet-300">
				{artist.name}
			</p>
		</a>
	);
}
