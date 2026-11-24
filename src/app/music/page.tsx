import artistMetadata from "../../../data/generated/spotifyArtistsMeta.json";
import PohhuSection from "../../components/PohhuSection";
import { pageMetadata } from "../../lib/metadata";
import "../../styles/music-modern.css";
import { isSpotifyArtistsMetaFile } from "../../lib/spotifyArtistMeta";

export const metadata = pageMetadata(
	"$.pohhu¥",
	"$.pohhu¥ — creative collective from Tartu. Manifesto, funded physical releases in Estonia, Kivi Baar art show, and certified artists.",
	"/music"
);

export default function MusicPage() {
	if (!isSpotifyArtistsMetaFile(artistMetadata)) {
		throw new Error("Invalid data/generated/spotifyArtistsMeta.json");
	}
	return (
		<div className="site-shell site-main">
			<PohhuSection artistMeta={artistMetadata} />
		</div>
	);
}
