import { useEffect, useState } from "preact/hooks";

import { ArtistList } from "./ArtistList";
import { SectionDivider } from "./SectionDivider";
import { TrackList } from "./TrackList";
import type { TopMusicResponseSuccess } from "../pages/api/topMusic";

const trackSections = [
	{ id: "short", title: "Past Month", tracksKey: "short" as const },
	{ id: "medium", title: "Past 6 Months", tracksKey: "medium" as const },
	{ id: "long", title: "All Time", tracksKey: "long" as const }
];

const ARTISTS_SECTION_INDEX = trackSections.length;

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
		<>
			<SectionDivider label="Listening" className="mt-12 mb-8" />

			<p
				id="spotify-listening"
				className="scroll-anchor text-lg mb-8 text-secondary"
			>
				My top tracks and artists on Spotify — past month, past six months, and
				all time.
			</p>

			{trackSections.map((section, index) => (
				<section key={section.id} className="mb-4 min-w-0 overflow-hidden">
					<h2
						className={`font-bold text-3xl mb-4 transition-colors duration-300 ${
							activeCarousel === index
								? "text-white"
								: "text-subtle"
						}`}
					>
						{section.title}
					</h2>
					<TrackList
						tracks={topMusic?.[section.tracksKey].items}
						priority={index === 0}
						isActive={activeCarousel === index}
						onActivate={() => setActiveCarousel(index)}
					/>
				</section>
			))}

			<SectionDivider label="Artists" />

			<section className="mb-4 min-w-0 overflow-hidden">
				<h2
					className={`font-bold text-3xl mb-4 transition-colors duration-300 ${
						activeCarousel === ARTISTS_SECTION_INDEX
							? "text-white"
							: "text-subtle"
					}`}
				>
					Top Artists
				</h2>
				<p className="mb-4 text-sm text-subtle">All time</p>
				<ArtistList
					artists={topMusic?.artists.items}
					isActive={activeCarousel === ARTISTS_SECTION_INDEX}
					onActivate={() => setActiveCarousel(ARTISTS_SECTION_INDEX)}
				/>
			</section>
		</>
	);
}
