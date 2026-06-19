import type { GetStaticProps } from "next";
import fs from "fs";
import path from "path";

import GenericMeta from "../components/GenericMeta";
import PohhuSection from "../components/PohhuSection";
import type { SpotifyArtistsMetaFile } from "../lib/spotifyArtistMeta";

const ARTISTS_META_FILE = path.join(
	process.cwd(),
	"data/generated/spotifyArtistsMeta.json"
);

type MusicPageProps = {
	artistMeta: SpotifyArtistsMetaFile;
};

export default function Music({ artistMeta }: MusicPageProps) {
	return (
		<>
			<GenericMeta
				title="$.pohhu¥"
				description="$.pohhu¥ — creative collective from Tartu. Manifesto, funded physical releases in Estonia, Kivi Baar art show, and certified artists."
				path="/music"
			/>

			<PohhuSection artistMeta={artistMeta} />
		</>
	);
}

export const getStaticProps: GetStaticProps<MusicPageProps> = async () => {
	if (!fs.existsSync(ARTISTS_META_FILE)) {
		throw new Error(
			`Missing ${ARTISTS_META_FILE}. Run: yarn spotify:sync`
		);
	}

	const artistMeta = JSON.parse(
		fs.readFileSync(ARTISTS_META_FILE, "utf8")
	) as SpotifyArtistsMetaFile;

	return {
		props: {
			artistMeta
		}
	};
};
