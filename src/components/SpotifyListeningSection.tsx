import { useEffect, useState } from "preact/hooks";

import { ArtistList } from "./ArtistList";
import { TrackList } from "./TrackList";
import type { TopMusicResponseSuccess } from "../pages/api/topMusic";

const trackSections = [
	{
		id: "short",
		title: "Top tracks · Past month",
		tracksKey: "short" as const
	},
	{
		id: "medium",
		title: "Top tracks · Past 6 months",
		tracksKey: "medium" as const
	},
	{
		id: "long",
		title: "Top tracks · All time",
		tracksKey: "long" as const
	}
];

const ARTISTS_SECTION_INDEX = trackSections.length;

const chapterHeadingClass =
	"scroll-anchor mb-8 font-heading text-3xl font-extrabold uppercase tracking-[0.06em] text-white md:mb-10 md:text-4xl md:tracking-[0.08em] lg:text-5xl";

const statHeadingClass =
	"mb-4 font-heading text-xl font-bold tracking-tight transition-colors duration-300 md:text-2xl";

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

	return (
		<div className="mt-16 md:mt-20">
			<h2 id="spotify-listening" className={chapterHeadingClass}>
				On Spotify
				<span
					className="mt-3 block h-px w-14 bg-violet-400/75 md:mt-4 md:w-16"
					aria-hidden
				/>
			</h2>

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
