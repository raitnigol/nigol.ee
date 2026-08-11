import fs from "fs";
import path from "path";

import type {
	PhysicalMediaAlbumMeta,
	PhysicalMediaSpotifyMetaFile
} from "./physicalMediaSpotifyMeta";

const META_FILE = path.join(
	process.cwd(),
	"data/generated/physicalMediaSpotifyMeta.json"
);

export function loadPhysicalMediaMetaFile(): PhysicalMediaSpotifyMetaFile | null {
	try {
		if (!fs.existsSync(META_FILE)) return null;
		const raw = fs.readFileSync(META_FILE, "utf8");
		return JSON.parse(raw) as PhysicalMediaSpotifyMetaFile;
	} catch {
		return null;
	}
}

export function getGeneratedAlbumMeta(
	id: string
): PhysicalMediaAlbumMeta | null {
	const file = loadPhysicalMediaMetaFile();
	const meta = file?.albums?.[id];
	return meta ?? null;
}
