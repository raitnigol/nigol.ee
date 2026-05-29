import { useEffect, useState } from "preact/hooks";

import GenericMeta from "../components/GenericMeta";
import { TrackList } from "../components/TrackList";
import type { TopMusicResponseSuccess } from "./api/topMusic";

const sections = [
	{ id: "short", title: "Past Month", tracksKey: "short" as const },
	{ id: "medium", title: "Past 6 Months", tracksKey: "medium" as const },
	{ id: "long", title: "All Time", tracksKey: "long" as const }
];

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

	return (
		<>
			<GenericMeta
				title="Music"
				description="My all-time top tracks on Spotify."
				path="/music"
			/>

			<h1 className="heading mb-2">MUSIC</h1>

			<p className="text-lg mb-8 text-gray-300">
				My all-time top tracks on Spotify.
			</p>

			{sections.map((section, index) => (
				<section key={section.id} className="mb-4">
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
		</>
	);
}
