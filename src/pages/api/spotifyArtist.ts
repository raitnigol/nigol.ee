import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

import type { SpotifyArtistMeta } from "../../lib/spotifyArtistMeta";

export type SpotifyArtistResponseSuccess = SpotifyArtistMeta;
export type SpotifyArtistResponseError = { error: unknown };
export type SpotifyArtistResponse =
	| SpotifyArtistResponseSuccess
	| SpotifyArtistResponseError;

const META_FILE = path.join(
	process.cwd(),
	"data/generated/spotifyArtistsMeta.json"
);

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<SpotifyArtistResponse>
) {
	if (req.method !== "GET") {
		res.status(405).json({ error: "Method not allowed." });
		return;
	}

	const { id } = req.query;

	if (!id || Array.isArray(id)) {
		res.status(400).json({ error: "Missing or invalid 'id' query parameter." });
		return;
	}

	try {
		if (!fs.existsSync(META_FILE)) {
			throw new Error(
				`Missing generated metadata at ${META_FILE}. Run: yarn spotify:sync`
			);
		}

		const raw = fs.readFileSync(META_FILE, "utf8");
		const data = JSON.parse(raw) as { artists?: Record<string, SpotifyArtistMeta> };
		const meta = data.artists?.[id];

		if (!meta) {
			res.status(404).json({ error: `Artist metadata not found for "${id}".` });
			return;
		}

		res.setHeader(
			"Cache-Control",
			"public, s-maxage=3600, stale-while-revalidate=86400"
		);
		res.status(200).json(meta);
	} catch (err) {
		res.status(500).json({ error: (err as Error).message });
	}
}
