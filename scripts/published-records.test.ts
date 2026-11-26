import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePublishedRecords } from "../src/lib/publishedRecord";

const source = {
	id: "release-1",
	collectionId: "record-1",
	copyId: "copy-1",
	artist: "K.Flay",
	title: "Mono",
	format: "vinyl",
	image: "/assets/covers/example.webp"
};

test("project only public copy details, even if the source includes private fields", () => {
	const [record] = parsePublishedRecords(
		[
			{
				...source,
				purchasePrice: 25,
				store: "Private shop",
				notes: "private note",
				packaging: "gatefold",
				country: "US",
				editionConfirmed: false
			}
		],
		String
	);
	assert.equal(record.artist, "K.Flay");
	assert.equal(record.country, null);
	assert.equal(record.packaging, null);
	for (const key of ["purchasePrice", "store", "notes"])
		assert.equal(key in record, false);
});

test("unpublished, archived and wishlisted copies never enter the showcase", () => {
	const records = parsePublishedRecords(
		[
			{ ...source, published: false },
			{ ...source, archived: true },
			{ ...source, status: "wishlist" }
		],
		String
	);
	assert.deepEqual(records, []);
	assert.deepEqual(parsePublishedRecords([], String), []);
});

test("only supported provider links and Spotify record identifiers reach the page", () => {
	const [record] = parsePublishedRecords(
		[
			{
				...source,
				spotifyUrl:
					"https://open.spotify.com/album/abc123?unused=parameter",
				references: [
					{
						provider: "discogs",
						url: "https://www.discogs.com/release/1234"
					},
					{
						provider: "discogs",
						url: "https://example.org/release/1234"
					}
				]
			}
		],
		String
	);
	assert.equal(record.spotifyUrl, "https://open.spotify.com/album/abc123");
	assert.deepEqual(record.references, [
		{ provider: "discogs", url: "https://www.discogs.com/release/1234" }
	]);
});
