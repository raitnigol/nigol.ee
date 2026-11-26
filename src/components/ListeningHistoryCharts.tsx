"use client";

import { useState } from "react";
import type { ListeningHistory } from "../lib/listeningHistory";
import { ArtistList } from "./ArtistList";
import { TrackList } from "./TrackList";

const trackSections = [
	{
		id: "short",
		title: "Top tracks I've listened to in the past month",
		tracksKey: "short" as const,
		artistsKey: "short" as const,
		genreLabel: "Past month"
	},
	{
		id: "medium",
		title: "Top tracks I've listened to in the past 6 months",
		tracksKey: "medium" as const,
		artistsKey: "medium" as const,
		genreLabel: "Past 6 months"
	},
	{
		id: "long",
		title: "Top tracks I've listened to of all time",
		tracksKey: "long" as const,
		artistsKey: "long" as const,
		genreLabel: "All time"
	}
];

const ARTISTS_SECTION_INDEX = trackSections.length;

const statHeadingClass = "rr-subheading transition-colors duration-300";

function formatGenreList(names: string[]): string {
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

function TopGenresLine({ label, genres }: { label: string; genres: string[] }) {
	if (genres.length === 0) return null;

	return (
		<p className="physical-media-section__description">
			{genreIntro(label)}{" "}
			<span className="text-white">{formatGenreList(genres)}</span>.
		</p>
	);
}

export function ListeningHistoryCharts({
	history
}: {
	history: ListeningHistory | null;
}) {
	const [activeCarousel, setActiveCarousel] = useState(0);
	const genreRangeKey =
		activeCarousel >= ARTISTS_SECTION_INDEX
			? "long"
			: trackSections[activeCarousel]?.artistsKey ?? "long";

	const genreLabel =
		activeCarousel >= ARTISTS_SECTION_INDEX
			? "All time"
			: trackSections[activeCarousel]?.genreLabel ?? "All time";

	const genres = history?.genres[genreRangeKey] ?? [];

	return (
		<>
			<TopGenresLine label={genreLabel} genres={genres} />
			{trackSections.map((section, index) => (
				<section
					key={section.id}
					className="mb-4 min-w-0 overflow-hidden"
				>
					<h3
						className={`${statHeadingClass} ${
							activeCarousel === index
								? "text-white"
								: "text-subtle"
						}`}
					>
						{section.title}
					</h3>
					<TrackList
						tracks={history?.tracks[section.tracksKey]}
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
					{"Top artists I've listened to of all time"}
				</h3>
				<ArtistList
					artists={history?.artists}
					isActive={activeCarousel === ARTISTS_SECTION_INDEX}
					onActivate={() => setActiveCarousel(ARTISTS_SECTION_INDEX)}
				/>
			</section>
		</>
	);
}
