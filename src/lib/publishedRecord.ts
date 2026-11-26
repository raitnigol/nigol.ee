export interface PublishedRecord {
	id: string;
	copyId: string;
	collectionId: string;
	title: string;
	artist: string;
	format: "cd" | "vinyl" | "mixed";
	year: string | null;
	image: string;
	imageSource: string | null;
	spotifyUrl: string | null;
	spotifyType: string | null;
	spotifyId: string | null;
	label: string | null;
	tracks: number | null;
	description: string;
	metadataKind: "digital" | "physical" | "manual";
	editionConfirmed: boolean;
	editionDate: string | null;
	country: string | null;
	catalogNumber: string | null;
	packaging: string | null;
	color: string | null;
	mediaCount: number | null;
	featured: boolean;
	grail: boolean;
	sortOrder: number;
	references: { provider: "discogs" | "musicbrainz"; url: string }[];
}

function text(value: unknown) {
	return typeof value === "string" && value.trim() ? value : null;
}

function number(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function httpsUrl(value: unknown) {
	if (typeof value !== "string" || !/^https:\/\//i.test(value)) return null;
	try {
		const url = new URL(value);
		return url.protocol === "https:" && !url.username && !url.password
			? url
			: null;
	} catch {
		return null;
	}
}

function references(value: unknown): PublishedRecord["references"] {
	if (!Array.isArray(value)) return [];
	const links: PublishedRecord["references"] = [];
	for (const entry of value) {
		const provider = entry?.provider;
		if (provider !== "discogs" && provider !== "musicbrainz") continue;
		const url = httpsUrl(entry.url);
		const domain =
			provider === "discogs" ? "discogs.com" : "musicbrainz.org";
		if (
			url &&
			(url.hostname === domain || url.hostname === "www." + domain)
		) {
			links.push({ provider, url: url.href });
		}
	}
	return links;
}

// Construct the public shape explicitly even if an upstream release adds fields.
export function parsePublishedRecords(
	value: unknown,
	resolveArtwork: (path: unknown) => string
): PublishedRecord[] {
	if (!Array.isArray(value)) throw new Error("Invalid published collection");
	const records: PublishedRecord[] = [];
	for (const row of value) {
		if (!row || typeof row !== "object" || Array.isArray(row)) {
			throw new Error("Invalid published record");
		}
		if (
			row.archived === true ||
			row.published === false ||
			(row.status !== undefined &&
				!["owned", "loaned"].includes(row.status))
		)
			continue;
		const id = text(row.id);
		const copyId = text(row.copyId);
		const title = text(row.title);
		const artist = text(row.artist);
		if (
			!id ||
			!copyId ||
			!title ||
			!artist ||
			!["cd", "vinyl", "mixed"].includes(row.format)
		) {
			throw new Error("Invalid published record");
		}
		const edition = row.editionConfirmed === true;
		const spotify = httpsUrl(row.spotifyUrl);
		const match =
			spotify?.origin === "https://open.spotify.com" &&
			/^\/(?:intl-[a-z]+\/)?(album|show|track|artist)\/([a-zA-Z0-9]+)\/?$/.exec(
				spotify.pathname
			);
		records.push({
			id,
			copyId,
			collectionId: text(row.collectionId) || id,
			title,
			artist,
			format: row.format,
			year: text(row.year),
			image: resolveArtwork(row.image),
			imageSource: text(row.imageSource),
			spotifyUrl: match
				? "https://open.spotify.com/" + match[1] + "/" + match[2]
				: null,
			spotifyType: match ? match[1] : null,
			spotifyId: match ? match[2] : null,
			label: text(row.label),
			tracks: number(row.tracks),
			description: text(row.description) || "",
			metadataKind:
				row.metadataKind === "digital" ||
				row.metadataKind === "physical"
					? row.metadataKind
					: "manual",
			editionConfirmed: edition,
			editionDate: edition ? text(row.editionDate) : null,
			country: edition ? text(row.country) : null,
			catalogNumber: edition ? text(row.catalogNumber) : null,
			packaging: edition ? text(row.packaging) : null,
			color: edition ? text(row.color) : null,
			mediaCount: number(row.mediaCount),
			featured: row.featured === true,
			grail: row.grail === true,
			sortOrder: number(row.sortOrder) ?? 0,
			references: references(row.references)
		});
	}
	return records.sort(
		(a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
	);
}
