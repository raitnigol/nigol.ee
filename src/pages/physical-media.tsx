import { useEffect } from "preact/hooks";

import GenericMeta from "../components/GenericMeta";
import { PhysicalMediaCoverflow } from "../components/PhysicalMediaCoverflow";
import { SpotifyListeningSection } from "../components/SpotifyListeningSection";
import { scrollToHashElement } from "../lib/scrollToHash";

export default function PhysicalMedia() {
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
				title="CD Collection"
				description="Physical CD copies from my favourite artists, plus Spotify top tracks and artists."
				path="/physical-media"
			/>

			<div className="mb-10">
				<p className="mb-4">
					<span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
						Work in progress
					</span>
				</p>
				<p className="text-lg text-secondary">
					Physical copies of CDs from my favourite artists — the ones I actually
					own and keep on the shelf.
				</p>
			</div>

			<PhysicalMediaCoverflow />

			<SpotifyListeningSection />
		</>
	);
}
