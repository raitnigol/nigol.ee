import fs from "fs";
import path from "path";
import Spotify from "spotify-web-api-node";

import {
	isPhysicalMediaListed,
	physicalMediaCollection
} from "../src/data/physicalMedia";
import {
	mapSearchAlbumMeta,
	mapSearchShowMeta,
	type PhysicalMediaAlbumMeta,
	type PhysicalMediaSpotifyMetaFile
} from "../src/lib/physicalMediaSpotifyMeta";
import { withSpotifyClient } from "../src/lib/spotifyServer";

const OUTPUT_PATH = path.join(
	process.cwd(),
	"data/generated/physicalMediaSpotifyMeta.json"
);

const FETCH_CONCURRENCY = 2;
const REQUEST_GAP_MS = 400;
const SEARCH_LIMIT = 5;
const MARKET = "EE";

type ListedItem = (typeof physicalMediaCollection)[number] & {
	spotifyAlbumId?: string | null;
	spotifyShowId?: string | null;
};

type SpotifySearchShow = {
	id: string;
	name: string;
	publisher: string;
	images: SpotifyApi.ImageObject[];
	total_episodes: number;
	external_urls: { spotify: string };
};

const listedItems = physicalMediaCollection.filter(
	isPhysicalMediaListed
) as ListedItem[];

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

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getErrorStatus(err: unknown): number | null {
	if (typeof err !== "object" || err === null || !("statusCode" in err)) {
		return null;
	}

	const status = (err as { statusCode?: number }).statusCode;
	return typeof status === "number" ? status : null;
}

function getRetryAfterSeconds(err: unknown): number | null {
	if (typeof err !== "object" || err === null || !("headers" in err)) {
		return null;
	}

	const raw = (err as { headers?: Record<string, string> }).headers?.[
		"retry-after"
	];
	if (!raw) return null;

	const seconds = Number(raw);
	return Number.isFinite(seconds) ? seconds : null;
}

function idSlugQuery(item: ListedItem): string {
	return item.id.replace(/-/g, " ");
}

function buildSearchQueries(item: ListedItem): string[] {
	const queries: string[] = [];

	if (item.title && item.artists) {
		queries.push(`${item.title} ${item.artists}`);
	}

	const slugQuery = idSlugQuery(item);
	if (!queries.includes(slugQuery)) {
		queries.push(slugQuery);
	}

	return queries;
}

function expectedSpotifyId(item: ListedItem): string | null {
	return item.spotifyShowId ?? item.spotifyAlbumId ?? null;
}

async function runPool<T>(
	items: T[],
	concurrency: number,
	fn: (item: T) => Promise<void>
) {
	let index = 0;

	async function worker() {
		while (index < items.length) {
			const item = items[index++];
			await fn(item);
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, () =>
			worker()
		)
	);
}

async function searchAlbums(
	client: Spotify,
	query: string
): Promise<SpotifyApi.AlbumObjectSimplified[]> {
	const response = await client.searchAlbums(query, {
		market: MARKET,
		limit: SEARCH_LIMIT
	});

	return response.body.albums?.items ?? [];
}

async function searchShows(
	client: Spotify,
	query: string
): Promise<SpotifySearchShow[]> {
	const response = await client.searchShows(query, {
		market: MARKET,
		limit: SEARCH_LIMIT
	});

	return (response.body.shows?.items ?? []) as SpotifySearchShow[];
}

async function resolveItemMeta(
	client: Spotify,
	item: ListedItem
): Promise<PhysicalMediaAlbumMeta> {
	const queries = buildSearchQueries(item);
	const spotifyId = expectedSpotifyId(item);

	if (!spotifyId || queries.length === 0) {
		throw new Error("Missing search query or Spotify ID");
	}

	if (item.spotifyShowId) {
		for (const query of queries) {
			const results = await searchShows(client, query);
			const match = results.find(show => show.id === item.spotifyShowId);
			if (match) return mapSearchShowMeta(item.id, match);
		}

		throw new Error(
			`No search result with exact show ID ${item.spotifyShowId}`
		);
	}

	for (const query of queries) {
		const results = await searchAlbums(client, query);
		const match = results.find(album => album.id === item.spotifyAlbumId);
		if (match) return mapSearchAlbumMeta(item.id, match);
	}

	throw new Error(
		`No search result with exact album ID ${item.spotifyAlbumId}`
	);
}

async function fetchWithRateLimitRetry<T>(
	fn: () => Promise<T>,
	label: string
): Promise<T> {
	for (let attempt = 0; attempt < 8; attempt++) {
		try {
			return await fn();
		} catch (err) {
			if (getErrorStatus(err) !== 429 || attempt === 7) throw err;

			const retryAfter = getRetryAfterSeconds(err) ?? 30;
			const waitMs = Math.min(retryAfter, 120) * 1000;
			console.warn(
				`Rate limited on ${label}; waiting ${Math.round(waitMs / 1000)}s…`
			);
			await sleep(waitMs);
		}
	}

	throw new Error(`Failed to fetch ${label}`);
}

function loadExistingMeta(): PhysicalMediaSpotifyMetaFile | null {
	if (!fs.existsSync(OUTPUT_PATH)) return null;

	try {
		return JSON.parse(
			fs.readFileSync(OUTPUT_PATH, "utf8")
		) as PhysicalMediaSpotifyMetaFile;
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
	const albums: Record<string, PhysicalMediaAlbumMeta> = forceRefresh
		? {}
		: { ...(existing?.albums ?? {}) };

	const previouslyFailedIds = new Set(
		(existing?.failed ?? []).map(entry => entry.split(":")[0]?.trim())
	);

	const itemsToFetch = forceRefresh
		? listedItems
		: listedItems.filter(item => {
				if (albums[item.id]) return false;
				if (previouslyFailedIds.has(item.id)) return false;
				return true;
			});

	const skippedCached = listedItems.filter(item => albums[item.id]).length;
	const skippedFailed = forceRefresh
		? 0
		: listedItems.filter(
				item => !albums[item.id] && previouslyFailedIds.has(item.id)
			).length;

	if (skippedCached > 0) {
		console.log(`Skipping ${skippedCached} item(s) with existing metadata`);
	}

	if (skippedFailed > 0) {
		console.log(
			`Skipping ${skippedFailed} item(s) with previous sync failures (use --force to retry)`
		);
	}

	if (itemsToFetch.length === 0) {
		console.log("Nothing to fetch — metadata is up to date");
		return;
	}

	const fetchFailed: string[] = [];

	console.log(
		`Fetching metadata for ${itemsToFetch.length} listed item(s) via Spotify Search…`
	);

	await withSpotifyClient(async client => {
		await runPool(itemsToFetch, FETCH_CONCURRENCY, async item => {
			try {
				const meta = await fetchWithRateLimitRetry(
					() => resolveItemMeta(client, item),
					item.id
				);
				albums[item.id] = meta;
				console.log(`✓ ${item.id}`);
				await sleep(REQUEST_GAP_MS);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				fetchFailed.push(`${item.id}: ${message}`);
				console.error(`✗ ${item.id}: ${message}`);
			}
		});
	});

	const loaded = Object.keys(albums).length;
	const failed = listedItems
		.filter(item => !albums[item.id])
		.map(item => {
			const entry =
				fetchFailed.find(f => f.startsWith(`${item.id}:`)) ??
				existing?.failed.find(f => f.startsWith(`${item.id}:`));
			return entry ?? `${item.id}: metadata not synced`;
		});

	const payload: PhysicalMediaSpotifyMetaFile = {
		generatedAt: new Date().toISOString(),
		source: "spotify-search",
		total: listedItems.length,
		loaded,
		complete: loaded === listedItems.length,
		failed,
		albums
	};

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);

	console.log(`\nWrote ${loaded}/${listedItems.length} albums to ${OUTPUT_PATH}`);

	if (failed.length > 0) {
		console.warn(`\n${failed.length} item(s) still missing metadata:`);
		for (const entry of failed) console.warn(`  - ${entry}`);
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
