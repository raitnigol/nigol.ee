import type { PublishedRecord } from "./publishedRecord";

export type ShelfRecord = Pick<
	PublishedRecord,
	"id" | "copyId" | "title" | "format"
>;

type MatchableRecord = ShelfRecord &
	Pick<
		PublishedRecord,
		| "artist"
		| "spotifyType"
		| "spotifyId"
		| "collectionId"
		| "sortOrder"
		| "year"
	>;

type ArtistCredit = { name?: string | null };
interface PlaybackTrack {
	album?: {
		id?: string | null;
		name?: string | null;
		artists?: readonly ArtistCredit[];
		album_type?: string;
		release_date?: string;
	} | null;
	artists?: readonly ArtistCredit[];
}

function textKey(value: string): string {
	const text = value
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.trim();
	// Some album titles consist entirely of punctuation, such as XXXTENTACION's "?".
	if (!/[\p{L}\p{N}]/u.test(text)) return text;
	return text
		.replace(/['’‘ʼ]/g, "")
		.replace(/(?<=\p{L})\$(?=\p{L})/gu, "s")
		.replace(/&/g, " and ")
		.replace(/[^\p{L}\p{N}]+/gu, " ")
		.trim();
}

function artistKey(names: readonly string[]): string {
	return names
		.flatMap(name => name.split(/\s*(?:[,;&]|\band\b|\s[×/]\s)\s*/i))
		.map(name => textKey(name).replace(/\s/g, ""))
		.filter(Boolean)
		.sort()
		.join("|");
}

// Only remove delimited physical/digital edition labels. Live recordings, remixes,
// volumes, and subtitles can be different releases in the same artist's catalogue.
const editionSuffix =
	/\s*(?:\(([^()]*)\)|\[([^\[\]]*)\]|\s[-–—]\s([^()[\]–—-]+))$/;
const editionLabel =
	/^(?:(?:\d{4}|\d+(?:st|nd|rd|th)) )?(?:(?:super )?deluxe|expanded|special|standard|anniversary|remaster(?:ed)?|explicit|clean|collectors?|bonus tracks?)(?: (?:edition|version|remaster(?:ed)?|deluxe|\d{4}))*$/;

function albumKey(title: string): string {
	let base = title.trim();
	while (base) {
		const suffix = editionSuffix.exec(base);
		if (
			!suffix ||
			!editionLabel.test(
				textKey(suffix[1] || suffix[2] || suffix[3] || "")
			)
		)
			break;
		const shorter = base.slice(0, suffix.index).trim();
		if (!shorter) break;
		base = shorter;
	}
	return textKey(base);
}

function matchesByMetadata(
	records: readonly MatchableRecord[],
	track: PlaybackTrack,
	byId: readonly MatchableRecord[]
): readonly MatchableRecord[] {
	const album = track.album;
	if (!album?.name?.trim()) return [];
	const credits = album.artists?.length
		? album.artists
		: album.album_type === "compilation"
		? []
		: track.artists;
	const artist = artistKey((credits || []).map(credit => credit.name || ""));
	if (!artist || artist === "variousartists" || artist === "various")
		return [];
	const base = albumKey(album.name);
	const matchesIdentity = (record: MatchableRecord) =>
		record.spotifyType !== "show" &&
		artistKey([record.artist]) === artist &&
		albumKey(record.title) === base;
	// An exact ID wins even when Spotify credits or titles disagree. In that
	// case metadata cannot independently identify additional catalogue entries.
	if (byId.length && !byId.some(matchesIdentity)) return [];
	const candidates = records.filter(matchesIdentity);
	if (new Set(candidates.map(record => record.collectionId)).size < 2)
		return candidates;

	// Distinct editions can have different years. Two independently catalogued
	// albums with the same full title in different years need disambiguation.
	const yearsByTitle = new Map<string, string>();
	let repeatedTitle = false;
	for (const record of candidates) {
		if (!record.year) continue;
		const title = textKey(record.title);
		const year = yearsByTitle.get(title);
		if (year && year !== record.year) repeatedTitle = true;
		yearsByTitle.set(title, record.year);
	}
	const selfTitled = base.replace(/\s/g, "") === artist;
	if (!repeatedTitle && !selfTitled) return candidates;
	const anchor = byId.find(record => matchesIdentity(record) && record.year);
	const year = anchor?.year || album.release_date?.slice(0, 4);
	return year ? candidates.filter(record => record.year === year) : [];
}

export function matchOwnedRecords(
	records: readonly MatchableRecord[],
	track: PlaybackTrack | null
): ShelfRecord[] {
	if (!track?.album) return [];
	const albumId = track.album.id;
	const byId = albumId
		? records.filter(
				record =>
					record.spotifyType === "album" &&
					record.spotifyId === albumId
		  )
		: [];
	const matched = [...byId, ...matchesByMetadata(records, track, byId)];
	// A confirmed release may have further physical copies with no Spotify URL.
	const groups = new Set(matched.map(record => record.collectionId));
	const copies = records
		.filter(
			record =>
				groups.has(record.collectionId) && record.spotifyType !== "show"
		)
		.sort(
			(a, b) =>
				a.sortOrder - b.sortOrder ||
				a.copyId.localeCompare(b.copyId) ||
				a.id.localeCompare(b.id)
		);
	const seen = new Set<string>();
	return copies
		.filter(record => {
			if (seen.has(record.copyId)) return false;
			seen.add(record.copyId);
			return true;
		})
		.map(({ id, copyId, title, format }) => ({
			id,
			copyId,
			title,
			format
		}));
}
