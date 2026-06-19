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

function loadExistingMeta(): SpotifyArtistsMetaFile | null {
	if (!fs.existsSync(OUTPUT_PATH)) return null;

	try {
		return JSON.parse(
			fs.readFileSync(OUTPUT_PATH, "utf8")
		) as SpotifyArtistsMetaFile;
	} catch {
		return null;
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

	const forceRefresh = process.argv.includes("--force");
	const existing = loadExistingMeta();
	const artists: Record<string, SpotifyArtistMeta> = forceRefresh
		? {}
		: { ...(existing?.artists ?? {}) };

	const profilesToFetch = forceRefresh
		? certifiedArtists
		: certifiedArtists.filter(profile => !artists[profile.spotifyId]);

	const skipped = certifiedArtists.length - profilesToFetch.length;

	if (skipped > 0) {
		console.log(`Skipping ${skipped} artist(s) with existing metadata`);
	}

	if (profilesToFetch.length === 0) {
		console.log("Nothing to fetch — metadata is up to date");
		return;
	}

	const fetchFailed: string[] = [];

	console.log(
		`Fetching metadata for ${profilesToFetch.length} certified artist(s)…`
	);

	await withSpotifyClient(async client => {
		for (const profile of profilesToFetch) {
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
				fetchFailed.push(`${profile.spotifyId}: ${message}`);
				console.error(`✗ ${profile.spotifyId}: ${message}`);
			}
		}
	});

	const loaded = Object.keys(artists).length;
	const failed = certifiedArtists
		.filter(profile => !artists[profile.spotifyId])
		.map(profile => {
			const entry = fetchFailed.find(f =>
				f.startsWith(`${profile.spotifyId}:`)
			);
			return entry ?? `${profile.spotifyId}: metadata not synced`;
		});

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
		console.warn(`\n${failed.length} artist(s) still missing metadata:`);
		for (const entry of failed) console.warn(`  - ${entry}`);
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
