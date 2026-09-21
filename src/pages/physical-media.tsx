import type { GetStaticProps } from "next";

import { FeaturedPhysicalMedia } from "../components/FeaturedPhysicalMedia";
import GenericMeta from "../components/GenericMeta";
import { PhysicalMediaCoverflow } from "../components/PhysicalMediaCoverflow";
import { PhysicalMediaSectionHeader } from "../components/PhysicalMediaSectionHeader";
import { SpotifyListeningSection } from "../components/SpotifyListeningSection";
import {
	featuredVinyl,
	listedPhysicalMediaCollection,
	vinylCollection
} from "../data/physicalMedia";
import { loadPhysicalMediaMeta } from "../lib/loadPhysicalMediaMeta";
import type { PhysicalMediaAlbumMeta } from "../lib/physicalMediaSpotifyMeta";

type PhysicalMediaPageProps = {
	spotifyMeta: Record<string, PhysicalMediaAlbumMeta>;
};

export default function PhysicalMedia({ spotifyMeta }: PhysicalMediaPageProps) {
	const featuredVinylItem = vinylCollection.find(
		item => item.id === featuredVinyl.itemId
	);

	return (
		<>
			<GenericMeta
				title="The $.pohhu¥ Media Collection"
				description={
					'Because I strongly believe in physical media and am against the mindset of "You will own nothing and be happy", I collect physical media in every format and keep track of the records I own.'
				}
				path="/physical-media"
			/>

			<div className="physical-media-page">
				<section
					id="physical-media"
					className="physical-media-section physical-media-section--intro scroll-anchor"
					aria-labelledby="physical-media-heading"
				>
					<PhysicalMediaSectionHeader
						id="physical-media-heading"
						title={
							<>
								The{" "}
								<span className="physical-media-section__brand">
									$.pohhu¥
								</span>{" "}
								media collection
							</>
						}
						description={
							'Because I strongly believe in physical media and am against the mindset of "You will own nothing and be happy", a hobby of mine is to collect physical media no matter the format. This is the place where I keep track of my collection and the records I already own.'
						}
						level={1}
						variant="hero"
					/>

					<nav
						className="physical-media-index"
						aria-label="Physical media collection sections"
					>
						<p className="physical-media-index__label">Browse</p>
						<a
							href="#cds"
							className="physical-media-index__link focus-ring"
						>
							CDs
							<span className="physical-media-index__count">
								{String(
									listedPhysicalMediaCollection.length
								).padStart(2, "0")}
							</span>
						</a>
						<a
							href="#vinyl"
							className="physical-media-index__link focus-ring"
						>
							Vinyl
							<span className="physical-media-index__count">
								{String(vinylCollection.length).padStart(
									2,
									"0"
								)}
							</span>
						</a>
						<a
							href="#spotify-listening"
							className="physical-media-index__link focus-ring"
						>
							Spotify
						</a>
					</nav>
				</section>

				<section
					id="cds"
					className="physical-media-section scroll-anchor"
					aria-labelledby="cds-heading"
				>
					<PhysicalMediaSectionHeader
						id="cds-heading"
						title="CDs"
						description="The full catalogue of discs I own and keep in rotation."
						meta={`${listedPhysicalMediaCollection.length} discs`}
					/>

					<PhysicalMediaCoverflow
						items={listedPhysicalMediaCollection}
						spotifyMeta={spotifyMeta}
						ariaLabel="CD collection"
						showNowPlaying
					/>
				</section>

				<section
					id="vinyl"
					className="physical-media-section scroll-anchor"
					aria-labelledby="vinyl-heading"
				>
					<PhysicalMediaSectionHeader
						id="vinyl-heading"
						title="Vinyl"
						description="A smaller shelf for the records that mean the most."
						meta={`${vinylCollection.length} ${
							vinylCollection.length === 1 ? "record" : "records"
						}`}
					/>

					{featuredVinylItem ? (
						<FeaturedPhysicalMedia
							item={featuredVinylItem}
							feature={featuredVinyl}
							spotifyMeta={spotifyMeta[featuredVinylItem.id]}
							anchorId="holy-grail"
						/>
					) : null}

					<div className="physical-media-section__catalog">
						<h3 className="physical-media-section__catalog-heading">
							Vinyl catalogue
						</h3>
						<PhysicalMediaCoverflow
							items={vinylCollection}
							spotifyMeta={spotifyMeta}
							ariaLabel="Vinyl collection"
						/>
					</div>
				</section>

				<section
					id="spotify-listening"
					className="physical-media-section scroll-anchor"
					aria-labelledby="spotify-listening-heading"
				>
					<SpotifyListeningSection />
				</section>
			</div>
		</>
	);
}

export const getStaticProps: GetStaticProps<
	PhysicalMediaPageProps
> = async () => {
	const meta = loadPhysicalMediaMeta();

	return {
		props: {
			spotifyMeta: meta.albums
		}
	};
};
