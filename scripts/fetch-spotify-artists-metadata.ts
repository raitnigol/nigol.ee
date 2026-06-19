import fs from "fs";
import path from "path";

import { certifiedArtists } from "../src/data/pohhu";
import {
	pickSpotifyImageUrl,
	type SpotifyArtistMeta,
	type SpotifyArtistsMetaFile
} from "../src/lib/spotifyArtistMeta";
import { withSpotifyClient } from "../src/lib/spotifyServer";

const OUTPUT_PATH = path.join(
	process.cwd(),
	"data/generated/spotifyArtistsMeta.json"
);

function loadEnvFile(filePath: string) {
	if (!fs.existsSync(filePath)) return;

	for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const separator = trimmed.indexOf("=");
		if (separator === -1) continue;

		const key = trimmed.slice(0, separator).trim();
		let value = trimmed.slice(separator + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (!process.env[key]) process.env[key] = value;
	}
}

async function main() {
	loadEnvFile(path.join(process.cwd(), ".env"));
	loadEnvFile(path.join(process.cwd(), ".env.local"));

	if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
		throw new Error(
			"Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env / .env.local"
		);
	}

	const artists: Record<string, SpotifyArtistMeta> = {};
	const failed: string[] = [];

	console.log(
		`Fetching metadata for ${certifiedArtists.length} certified artist(s)…`
	);

	await withSpotifyClient(async client => {
		for (const profile of certifiedArtists) {
			try {
				const response = await client.getArtist(profile.spotifyId);
				const artist = response.body;

				artists[profile.spotifyId] = {
					spotifyId: profile.spotifyId,
					name: artist.name,
					followers: artist.followers.total,
					genres: artist.genres,
					imageUrl: pickSpotifyImageUrl(artist.images),
					spotifyUrl: artist.external_urls.spotify
				};

				console.log(`✓ ${profile.spotifyId} (${artist.name})`);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				failed.push(`${profile.spotifyId}: ${message}`);
				console.error(`✗ ${profile.spotifyId}: ${message}`);
			}
		}
	});

	const loaded = Object.keys(artists).length;
	const payload: SpotifyArtistsMetaFile = {
		generatedAt: new Date().toISOString(),
		source: "spotify-artist",
		total: certifiedArtists.length,
		loaded,
		complete: loaded === certifiedArtists.length,
		failed,
		artists
	};

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);

	console.log(`\nWrote ${loaded}/${certifiedArtists.length} artists to ${OUTPUT_PATH}`);

	if (failed.length > 0) {
		process.exitCode = 1;
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
