import type { GetStaticProps } from "next";

import GenericMeta from "../components/GenericMeta";
import { PhysicalMediaCoverflow } from "../components/PhysicalMediaCoverflow";
import { SpotifyListeningSection } from "../components/SpotifyListeningSection";
import { loadPhysicalMediaMeta } from "../lib/loadPhysicalMediaMeta";
import type { PhysicalMediaAlbumMeta } from "../lib/physicalMediaSpotifyMeta";

type PhysicalMediaPageProps = {
	spotifyMeta: Record<string, PhysicalMediaAlbumMeta>;
};

export default function PhysicalMedia({ spotifyMeta }: PhysicalMediaPageProps) {
	return (
		<>
			<GenericMeta
				title="CD Collection"
				description="My physical CD collection — discs I own and keep on the shelf, plus Spotify top tracks and artists."
				path="/physical-media"
			/>

			<div className="mb-10">
				<h1 className="mb-5 font-heading text-3xl font-extrabold uppercase tracking-[0.06em] text-white md:mb-6 md:text-4xl md:tracking-[0.08em] lg:text-5xl">
					My physical CD collection
					<span
						className="mt-3 block h-px w-14 bg-violet-400/75 md:mt-4 md:w-16"
						aria-hidden
					/>
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-secondary md:text-lg">
					One of my hobbies is collecting CDs from my favourite artists. Below is
					the full catalogue of discs I own and keep on the shelf.
				</p>
			</div>

			<PhysicalMediaCoverflow spotifyMeta={spotifyMeta} />

			<SpotifyListeningSection />
		</>
	);
}

export const getStaticProps: GetStaticProps<PhysicalMediaPageProps> = async () => {
	const meta = loadPhysicalMediaMeta();

	return {
		props: {
			spotifyMeta: meta.albums
		}
	};
};
