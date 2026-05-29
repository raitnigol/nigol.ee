import { useEffect, useState } from "preact/hooks";

import { ArtistList } from "../components/ArtistList";
import GenericMeta from "../components/GenericMeta";
import PohhuSection from "../components/PohhuSection";
import { SectionDivider } from "../components/SectionDivider";
import { TrackList } from "../components/TrackList";
import { scrollToHashElement } from "../lib/scrollToHash";
import type { TopMusicResponseSuccess } from "./api/topMusic";

const trackSections = [
	{ id: "short", title: "Past Month", tracksKey: "short" as const },
	{ id: "medium", title: "Past 6 Months", tracksKey: "medium" as const },
	{ id: "long", title: "All Time", tracksKey: "long" as const }
];

const ARTISTS_SECTION_INDEX = trackSections.length;

export default function Music() {
	const [topMusic, setTopMusic] = useState<TopMusicResponseSuccess | null>(
		null
	);
	const [activeCarousel, setActiveCarousel] = useState(0);

	useEffect(() => {
		fetch(`/api/topMusic`)
			.then(res => res.json())
			.then(info => {
				if (info.error) return;
				setTopMusic(info);
			})
			.catch(console.error);
	}, []);

	useEffect(() => {
		const scrollToHash = () => {
			if (window.location.hash) {
				scrollToHashElement(window.location.hash);
			}
		};

		scrollToHash();
		window.addEventListener("hashchange", scrollToHash);
		return () => window.removeEventListener("hashchange", scrollToHash);
	}, []);

	return (
		<>
			<GenericMeta
				title="$.pohhu¥"
				description="$.pohhu¥ — creative collective from Tartu. Manifesto, funded physical releases in Estonia, Kivi Baar art show, certified artists, and personal Spotify listening stats."
				path="/music"
			/>

			<SectionDivider label="Manifesto" className="mb-8 mt-0" />

			<PohhuSection />

			<SectionDivider label="Listening" />

			<h1 id="spotify-listening" className="heading scroll-anchor mb-2">
				MUSIC
			</h1>

			<p className="text-lg mb-8 text-gray-300">
				My top tracks and artists on Spotify — past month, past six months, and
				all time.
			</p>

			{trackSections.map((section, index) => (
				<section key={section.id} className="mb-4 min-w-0 overflow-hidden">
					<h2
						className={`font-bold text-3xl mb-4 transition-colors duration-300 ${
							activeCarousel === index
								? "text-white"
								: "text-gray-500"
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
							: "text-gray-500"
					}`}
				>
					Top Artists
				</h2>
				<p className="mb-4 text-sm text-gray-500">All time</p>
				<ArtistList
					artists={topMusic?.artists.items}
					isActive={activeCarousel === ARTISTS_SECTION_INDEX}
					onActivate={() => setActiveCarousel(ARTISTS_SECTION_INDEX)}
				/>
			</section>
		</>
	);
}
