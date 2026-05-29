import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

interface TrackListProps {
	tracks?: SpotifyApi.TrackObjectFull[];
	priority?: boolean;
}

export function TrackList({ tracks, priority = false }: TrackListProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);

	const updateScrollState = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;

		const { scrollLeft, scrollWidth, clientWidth } = el;
		setCanScrollLeft(scrollLeft > 4);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
	}, []);

	useEffect(() => {
		setHasScrolled(false);
		updateScrollState();

		const el = scrollRef.current;
		if (!el) return;

		const onScroll = () => {
			setHasScrolled(true);
			updateScrollState();
		};

		el.addEventListener("scroll", onScroll, { passive: true });
		const resizeObserver = new ResizeObserver(updateScrollState);
		resizeObserver.observe(el);

		return () => {
			el.removeEventListener("scroll", onScroll);
			resizeObserver.disconnect();
		};
	}, [tracks, updateScrollState]);

	const scrollBy = (direction: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;

		setHasScrolled(true);
		el.scrollBy({
			left:
				direction === "left"
					? -el.clientWidth * 0.85
					: el.clientWidth * 0.85,
			behavior: "smooth"
		});
	};

	return (
		<section className="relative mb-12 min-w-0" aria-label="Top tracks">
			<div
				className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-black transition-opacity duration-300 ${
					canScrollLeft ? "opacity-100" : "opacity-0"
				}`}
				aria-hidden
			/>
			<div
				className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-black via-black/90 to-transparent transition-opacity duration-300 ${
					canScrollRight ? "opacity-100" : "opacity-0"
				}`}
				aria-hidden
			/>

			{canScrollLeft ? (
				<button
					type="button"
					onClick={() => scrollBy("left")}
					className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/85 p-2 text-white shadow-lg ring-1 ring-white/15 transition hover:bg-black hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
					aria-label="Scroll tracks left"
				>
					<ChevronLeftIcon className="h-5 w-5" />
				</button>
			) : null}

			{canScrollRight ? (
				<button
					type="button"
					onClick={() => scrollBy("right")}
					className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/85 p-2 text-white shadow-lg ring-1 ring-white/15 transition hover:bg-black hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
					aria-label="Scroll tracks right"
				>
					<ChevronRightIcon className="h-5 w-5 motion-safe:animate-[nudge-right_1.4s_ease-in-out_infinite]" />
				</button>
			) : null}

			<div
				ref={scrollRef}
				className="overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1 cursor-grab active:cursor-grabbing"
			>
				<div className="grid w-max grid-flow-col grid-rows-2 gap-3 md:gap-4 auto-cols-[8.25rem] xs:auto-cols-[9rem] md:auto-cols-[9.75rem]">
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
									className="snap-start snap-always rounded-lg overflow-hidden animate-pulse"
								>
									<div className="w-full h-0 pt-[100%] bg-slate-900" />
								</div>
						  ))}
				</div>
			</div>

			{canScrollRight && !hasScrolled ? (
				<p className="mt-3 flex items-center gap-1.5 text-sm text-gray-400">
					<span>Scroll or swipe for more</span>
					<ChevronRightIcon className="h-4 w-4 motion-safe:animate-[nudge-right_1.4s_ease-in-out_infinite]" />
				</p>
			) : null}
		</section>
	);
}

interface TrackProps {
	track: SpotifyApi.TrackObjectFull;
	priority: boolean;
}

function Track({ track, priority }: TrackProps) {
	const coverUrl = track.album.images[0]?.url;
	const isRemoteCover = coverUrl?.startsWith("http") ?? false;

	return (
		<a
			href={track.external_urls.spotify}
			target="_blank"
			rel="noopener noreferrer"
			className="group relative snap-start snap-always rounded-lg before:absolute before:inset-0 before:z-10 before:rounded-lg before:bg-black before:opacity-0 before:transition before:duration-300 hover:before:opacity-50"
		>
			<div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={track.name}
						width={512}
						height={512}
						priority={priority}
						unoptimized={isRemoteCover}
						className="h-full w-full object-cover rounded-lg transition duration-300 group-hover:scale-[1.02]"
					/>
				) : null}
			</div>
			<div className="z-20 absolute inset-2 md:inset-3 flex flex-col justify-end transition duration-300 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100">
				<p className="font-bold text-base md:text-lg leading-tight mb-0.5 line-clamp-2">
					{track.name}
				</p>
				{track.artists.map(artist => (
					<p
						key={artist.id}
						className="text-xs md:text-sm leading-tight opacity-80 truncate"
					>
						{artist.name}
					</p>
				))}
			</div>
		</a>
	);
}
