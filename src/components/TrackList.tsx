import Image from "next/future/image";

interface TrackListProps {
	tracks?: SpotifyApi.TrackObjectFull[];
	priority?: boolean;
}

export function TrackList({ tracks, priority = false }: TrackListProps) {
	return (
		<section className="relative mb-12 min-w-0" aria-label="Top tracks">
			<div
				className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-black to-transparent"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black to-transparent"
				aria-hidden
			/>

			<div className="overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1">
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
