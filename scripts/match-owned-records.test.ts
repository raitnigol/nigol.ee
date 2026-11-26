import assert from "node:assert/strict";
import { test } from "node:test";
import { matchOwnedRecords } from "../src/lib/matchOwnedRecords";

const cd = {
	id: "cd-kreayshawn",
	copyId: "cd-copy",
	collectionId: "kreayshawn-first-album",
	title: "Somethin ’Bout Kreay",
	artist: "Kreayshawn",
	format: "cd" as const,
	sortOrder: 1,
	spotifyType: null,
	spotifyId: null,
	year: "2012"
};

function playing(name: string, ...artists: string[]) {
	return {
		album: {
			id: "streaming-edition",
			name,
			artists: artists.map(name => ({ name }))
		}
	};
}

test("link a newly published manual copy by album title and credited artist", () => {
	const track = playing("SOMETHIN' BOUT KREAY", "Kreayshawn");
	assert.deepEqual(matchOwnedRecords([cd], track), [
		{ id: cd.id, copyId: cd.copyId, format: "cd", title: cd.title }
	]);
	assert.deepEqual(
		matchOwnedRecords([cd], playing(track.album.name, "Other artist")),
		[]
	);
	assert.deepEqual(
		matchOwnedRecords([cd], playing("Gucci Gucci", cd.artist)),
		[]
	);
});

test("exact Spotify album IDs take precedence and include each owned copy in shelf order", () => {
	const vinyl = {
		...cd,
		id: "lp",
		copyId: "lp-copy",
		format: "vinyl" as const,
		sortOrder: 0,
		spotifyType: "album",
		spotifyId: "same-id"
	};
	const decoy = {
		...cd,
		id: "decoy",
		collectionId: "other",
		copyId: "other",
		title: "Same Name",
		artist: "Same Artist"
	};
	const track = playing(decoy.title, decoy.artist);
	track.album.id = "same-id";
	assert.deepEqual(
		matchOwnedRecords([cd, decoy, vinyl, cd], track).map(
			record => record.copyId
		),
		[vinyl.copyId, cd.copyId]
	);
	assert.deepEqual(
		matchOwnedRecords(
			[{ ...decoy, spotifyType: "track", spotifyId: "same-id" }],
			{ album: { id: "same-id" } }
		),
		[]
	);
});

test("handle known edition labels and joint artist credits without matching different releases", () => {
	const album = {
		...cd,
		title: "Watch the Throne (Deluxe Edition)",
		artist: "JAŸ-Z, Kanye West"
	};
	assert.equal(
		matchOwnedRecords(
			[album],
			playing("Watch The Throne - 2011 Remaster", "Kanye West", "JAY-Z")
		).length,
		1
	);
	for (const title of [
		"Watch The Throne (Live)",
		"Watch The Throne (Remixes)",
		"Watch The Throne II"
	]) {
		assert.deepEqual(
			matchOwnedRecords([album], playing(title, "JAY-Z", "Kanye West")),
			[]
		);
	}
	const feature = {
		...playing("Watch The Throne", "Someone Else"),
		artists: [{ name: "Kanye West" }, { name: "JAY-Z" }]
	};
	assert.deepEqual(matchOwnedRecords([album], feature), []);
	assert.deepEqual(
		matchOwnedRecords([album], playing("Watch The Throne", "Kanye West")),
		[]
	);
});

test("preserve punctuation-only album titles and reject ambiguous or missing metadata", () => {
	const question = { ...cd, title: "?", artist: "XXXTentacion" };
	assert.equal(
		matchOwnedRecords([question], playing("? (Deluxe)", "XXXTENTACION"))
			.length,
		1
	);
	assert.deepEqual(
		matchOwnedRecords([question], playing("!", "XXXTENTACION")),
		[]
	);
	assert.deepEqual(matchOwnedRecords([cd], null), []);
	assert.deepEqual(
		matchOwnedRecords([cd], { album: { name: cd.title } }),
		[]
	);
	assert.deepEqual(
		matchOwnedRecords(
			[{ ...cd, artist: "Various Artists" }],
			playing(cd.title, "Various Artists")
		),
		[]
	);
	const newer = {
		...cd,
		collectionId: "another-album",
		id: "new",
		copyId: "new",
		year: "2020"
	};
	const track = playing(cd.title, cd.artist);
	assert.deepEqual(matchOwnedRecords([cd, newer], track), []);
	assert.deepEqual(
		matchOwnedRecords([cd, newer], {
			album: { ...track.album, release_date: "2012-09-14" }
		}).map(record => record.copyId),
		[cd.copyId]
	);
});

test("an ID match also links independently catalogued editions when the streaming metadata agrees", () => {
	const linkedCD = {
		...cd,
		spotifyType: "album",
		spotifyId: "streaming-edition"
	};
	const vinyl = {
		...cd,
		id: "vinyl",
		copyId: "vinyl-copy",
		collectionId: "different-catalogue-entry",
		format: "vinyl" as const,
		sortOrder: 2,
		spotifyType: "album",
		spotifyId: "other-market-id"
	};
	const track = playing(cd.title, cd.artist);
	for (const edition of [
		vinyl,
		{ ...vinyl, title: cd.title + " (Expanded Edition)", year: "2022" }
	]) {
		assert.deepEqual(
			matchOwnedRecords([edition, linkedCD], track).map(
				record => record.copyId
			),
			[cd.copyId, vinyl.copyId]
		);
		assert.deepEqual(
			matchOwnedRecords([edition, cd], track).map(
				record => record.copyId
			),
			[cd.copyId, vinyl.copyId]
		);
	}
	const reissue = { ...vinyl, title: cd.title, year: "2020" };
	assert.deepEqual(
		matchOwnedRecords([reissue, linkedCD], track).map(
			record => record.copyId
		),
		[cd.copyId]
	);
	const first = { ...linkedCD, title: "Seal", artist: "Seal", year: "1991" };
	const second = {
		...vinyl,
		title: "Seal (Deluxe)",
		artist: "Seal",
		year: "1994"
	};
	assert.deepEqual(
		matchOwnedRecords([second, first], playing("Seal", "Seal")).map(
			record => record.copyId
		),
		[first.copyId]
	);
});
