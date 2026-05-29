import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

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

	const trackGrid = (
		<div
			ref={scrollRef}
			className="overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
			onPointerDown={handleActivate}
		>
			<div className="grid w-max grid-flow-col grid-rows-2 gap-3 md:gap-x-4 md:gap-y-6 auto-cols-[8.25rem] xs:auto-cols-[9rem] md:auto-cols-[10rem] lg:auto-cols-[10.5rem]">
				{tracks
					? tracks.map(track => (
							<Track
								key={track.id}
								track={track}
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
	);

	if (!isActive) {
		return (
			<section
				className="mb-12 min-w-0 rounded-xl transition-opacity duration-300 opacity-75 hover:opacity-90"
				aria-label="Top tracks"
				onPointerDown={handleActivate}
			>
				{trackGrid}
			</section>
		);
	}

	return (
		<section
			className="mb-12 min-w-0"
			aria-label="Top tracks"
			aria-roledescription="carousel"
		>
			<div className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 items-center">
				<div className="flex min-h-[11rem] w-10 flex-shrink-0 items-center justify-end sm:w-12 md:min-h-[15rem] md:min-w-[2.75rem] md:flex-1 md:max-w-[max(2.75rem,calc((100vw-700px)/2))] lg:max-w-[max(2.75rem,calc((100vw-800px)/2))]">
					<CarouselArrow
						direction="left"
						disabled={!canScrollLeft}
						onClick={() => scrollBy("left")}
						label="Scroll tracks left"
					/>
				</div>

				<div className="min-w-0 w-full flex-shrink-0 md:w-[700px] lg:w-[800px]">
					{trackGrid}
				</div>

				<div className="flex min-h-[11rem] w-10 flex-shrink-0 items-center justify-start sm:w-12 md:min-h-[15rem] md:min-w-[2.75rem] md:flex-1 md:max-w-[max(2.75rem,calc((100vw-700px)/2))] lg:max-w-[max(2.75rem,calc((100vw-800px)/2))]">
					<CarouselArrow
						direction="right"
						disabled={!canScrollRight}
						nudge={canScrollRight}
						onClick={() => scrollBy("right")}
						label="Scroll tracks right"
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
			className="p-2 text-white transition-[opacity,transform] duration-200 enabled:opacity-90 enabled:hover:opacity-100 disabled:cursor-default disabled:opacity-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
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

interface TrackProps {
	track: SpotifyApi.TrackObjectFull;
	priority: boolean;
}

function Track({ track, priority }: TrackProps) {
	const coverUrl = track.album.images[0]?.url;
	const isRemoteCover = coverUrl?.startsWith("http") ?? false;
	const artistLine = track.artists.map(artist => artist.name).join(", ");

	return (
		<a
			href={track.external_urls.spotify}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex snap-start snap-always flex-col"
		>
			<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-900">
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
						<p className="mt-0.5 text-xs leading-tight text-gray-300 line-clamp-2">
							{artistLine}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-2 hidden min-w-0 flex-col md:flex">
				<p className="font-bold text-sm leading-snug text-white line-clamp-2 transition group-hover:text-violet-300">
					{track.name}
				</p>
				<p className="mt-0.5 text-xs leading-snug text-gray-400 line-clamp-2">
					{artistLine}
				</p>
			</div>
		</a>
	);
}
