import fs from "fs";
import path from "path";

import {
	isPhysicalMediaListed,
	physicalMediaCollection
} from "../data/physicalMedia";
import type {
	PhysicalMediaAlbumMeta,
	PhysicalMediaSpotifyMetaFile
} from "./physicalMediaSpotifyMeta";

const META_FILE = path.join(
	process.cwd(),
	"data/generated/physicalMediaSpotifyMeta.json"
);

const listedTotal = physicalMediaCollection.filter(isPhysicalMediaListed).length;

function isValidAlbumMeta(value: unknown): value is PhysicalMediaAlbumMeta {
	if (!value || typeof value !== "object") return false;

	const meta = value as Record<string, unknown>;
	return (
		typeof meta.collectionId === "string" &&
		typeof meta.name === "string" &&
		typeof meta.artists === "string" &&
		(meta.coverImageUrl === null || typeof meta.coverImageUrl === "string") &&
		(meta.releaseYear === null || typeof meta.releaseYear === "string") &&
		typeof meta.releaseDate === "string" &&
		(meta.label === null || typeof meta.label === "string") &&
		typeof meta.totalTracks === "number" &&
		typeof meta.albumType === "string" &&
		typeof meta.spotifyUrl === "string" &&
		(meta.copyright === null || typeof meta.copyright === "string")
	);
}

/** Build-time load of generated Spotify meta for the CD shelf. */
export function loadPhysicalMediaMeta(): PhysicalMediaSpotifyMetaFile {
	if (!fs.existsSync(META_FILE)) {
		throw new Error(
			`Missing generated metadata at ${META_FILE}. Run: yarn spotify:sync`
		);
	}

	const raw = fs.readFileSync(META_FILE, "utf8");
	const data = JSON.parse(raw) as Partial<PhysicalMediaSpotifyMetaFile>;

	if (!data.albums || typeof data.albums !== "object") {
		throw new Error(`Malformed generated metadata in ${META_FILE}`);
	}

	for (const [id, meta] of Object.entries(data.albums)) {
		if (!isValidAlbumMeta(meta)) {
			throw new Error(`Malformed album metadata for "${id}" in ${META_FILE}`);
		}
	}

	const albums = data.albums;
	const loaded = Object.keys(albums).length;

	return {
		albums,
		loaded,
		total: listedTotal,
		complete: loaded >= listedTotal,
		generatedAt:
			typeof data.generatedAt === "string"
				? data.generatedAt
				: new Date(0).toISOString(),
		source: typeof data.source === "string" ? data.source : "unknown",
		failed: Array.isArray(data.failed)
			? data.failed.filter((entry): entry is string => typeof entry === "string")
			: []
	};
}
