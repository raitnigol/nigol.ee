import { useEffect, useMemo, useState } from "preact/hooks";

import { ArtistList } from "./ArtistList";
import { TrackList } from "./TrackList";
import type { TopMusicResponseSuccess } from "../pages/api/topMusic";

const trackSections = [
	{
		id: "short",
		title: "Top tracks · Past month",
		tracksKey: "short" as const,
		artistsKey: "short" as const,
		genreLabel: "Past month"
	},
	{
		id: "medium",
		title: "Top tracks · Past 6 months",
		tracksKey: "medium" as const,
		artistsKey: "medium" as const,
		genreLabel: "Past 6 months"
	},
	{
		id: "long",
		title: "Top tracks · All time",
		tracksKey: "long" as const,
		artistsKey: "long" as const,
		genreLabel: "All time"
	}
];

const ARTISTS_SECTION_INDEX = trackSections.length;

const chapterHeadingClass =
	"scroll-anchor mb-8 font-heading text-3xl font-extrabold uppercase tracking-[0.06em] text-white md:mb-10 md:text-4xl md:tracking-[0.08em] lg:text-5xl";

const statHeadingClass =
	"mb-4 font-heading text-xl font-bold tracking-tight transition-colors duration-300 md:text-2xl";

type GenreCount = { name: string; count: number };

function rankGenres(
	artists: SpotifyApi.ArtistObjectFull[] | undefined,
	limit = 8
): GenreCount[] {
	if (!artists?.length) return [];

	const counts = new Map<string, number>();
	for (const artist of artists) {
		for (const genre of artist.genres ?? []) {
			const key = genre.trim().toLowerCase();
			if (!key) continue;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
	}

	return Array.from(counts.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
		.slice(0, limit);
}

function formatGenreList(genres: GenreCount[]): string {
	const names = genres.map(genre => genre.name);
	if (names.length === 0) return "";
	if (names.length === 1) return names[0];
	if (names.length === 2) return `${names[0]} and ${names[1]}`;
	return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function genreIntro(label: string): string {
	if (label === "Past month") return "This month leans toward";
	if (label === "Past 6 months") return "Over the past six months it's been";
	return "Across everything, it keeps coming back to";
}

function TopGenresLine({
	label,
	genres
}: {
	label: string;
	genres: GenreCount[];
}) {
	if (genres.length === 0) return null;

	return (
		<p className="mb-8 max-w-3xl text-base leading-relaxed text-secondary md:text-lg">
			{genreIntro(label)}{" "}
			<span className="text-white">{formatGenreList(genres)}</span>.
		</p>
	);
}

export function SpotifyListeningSection() {
	const [topMusic, setTopMusic] = useState<TopMusicResponseSuccess | null>(
		null
	);
	const [activeCarousel, setActiveCarousel] = useState(0);

	useEffect(() => {
		fetch("/api/topMusic")
			.then(res => res.json())
			.then(info => {
				if (info.error) return;
				setTopMusic(info);
			})
			.catch(console.error);
	}, []);

	const genreRangeKey =
		activeCarousel >= ARTISTS_SECTION_INDEX
			? "long"
			: trackSections[activeCarousel]?.artistsKey ?? "long";

	const genreLabel =
		activeCarousel >= ARTISTS_SECTION_INDEX
			? "All time"
			: trackSections[activeCarousel]?.genreLabel ?? "All time";

	const genreArtists = useMemo(() => {
		if (!topMusic) return undefined;
		return (
			topMusic.artistsByRange?.[genreRangeKey]?.items ??
			topMusic.artists?.items
		);
	}, [topMusic, genreRangeKey]);

	const genres = useMemo(() => rankGenres(genreArtists), [genreArtists]);

	return (
		<div className="mt-16 md:mt-20">
			<h2 id="spotify-listening" className={chapterHeadingClass}>
				On Spotify
				<span
					className="mt-3 block h-px w-14 bg-violet-400/75 md:mt-4 md:w-16"
					aria-hidden
				/>
			</h2>

			{topMusic ? (
				<TopGenresLine label={genreLabel} genres={genres} />
			) : null}

			{trackSections.map((section, index) => (
				<section key={section.id} className="mb-4 min-w-0 overflow-hidden">
					<h3
						className={`${statHeadingClass} ${
							activeCarousel === index ? "text-white" : "text-subtle"
						}`}
					>
						{section.title}
					</h3>
					<TrackList
						tracks={topMusic?.[section.tracksKey].items}
						priority={index === 0}
						isActive={activeCarousel === index}
						onActivate={() => setActiveCarousel(index)}
					/>
				</section>
			))}

			<section className="mb-4 min-w-0 overflow-hidden">
				<h3
					className={`${statHeadingClass} ${
						activeCarousel === ARTISTS_SECTION_INDEX
							? "text-white"
							: "text-subtle"
					}`}
				>
					Top artists · All time
				</h3>
				<ArtistList
					artists={topMusic?.artists.items}
					isActive={activeCarousel === ARTISTS_SECTION_INDEX}
					onActivate={() => setActiveCarousel(ARTISTS_SECTION_INDEX)}
				/>
			</section>
		</div>
	);
}
