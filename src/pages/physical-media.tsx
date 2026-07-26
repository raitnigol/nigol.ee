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
