import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

import {
	isPhysicalMediaListed,
	physicalMediaCollection
} from "../../data/physicalMedia";
import type {
	PhysicalMediaAlbumMeta,
	PhysicalMediaApiResponse
} from "../../lib/physicalMediaSpotifyMeta";

export type { PhysicalMediaAlbumMeta, PhysicalMediaApiResponse };

export type PhysicalMediaResponseSuccess = PhysicalMediaApiResponse;

export type PhysicalMediaResponseError = { error: unknown };
export type PhysicalMediaResponse =
	| PhysicalMediaResponseSuccess
	| PhysicalMediaResponseError;

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

function loadGeneratedMeta(): PhysicalMediaApiResponse {
	if (!fs.existsSync(META_FILE)) {
		throw new Error(
			`Missing generated metadata at ${META_FILE}. Run: yarn spotify:sync`
		);
	}

	const raw = fs.readFileSync(META_FILE, "utf8");
	const data = JSON.parse(raw) as Partial<PhysicalMediaApiResponse>;

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
	const generatedAt =
		typeof data.generatedAt === "string"
			? data.generatedAt
			: new Date(0).toISOString();
	const source =
		typeof data.source === "string" ? data.source : "unknown";
	const failed = Array.isArray(data.failed)
		? data.failed.filter((entry): entry is string => typeof entry === "string")
		: [];

	return {
		albums,
		loaded,
		total: listedTotal,
		complete: loaded >= listedTotal,
		generatedAt,
		source,
		failed
	};
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<PhysicalMediaResponse>
) {
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed." });
		return;
	}

	try {
		const response = loadGeneratedMeta();

		res.setHeader(
			"Cache-Control",
			response.complete
				? "public, s-maxage=3600, stale-while-revalidate=86400"
				: "no-store"
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).json({ error: (err as Error).message });
	}
}
