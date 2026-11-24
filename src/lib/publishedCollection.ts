import "server-only";
import { unstable_cache } from "next/cache";
import snapshot from "../../data/generated/publishedCollection.json";
import { httpsUrl, parsePublishedRecords } from "./publishedRecord";

const recordRoom = "https://pohhuy-record-room.nixol.chatgpt.site";
const placeholder = "/images/physical-media/covers/placeholder.jpg";
const artRoute = "/api/collection-art/";
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const cacheSeconds = 60;

// These 128 artworks were already public on nigol.ee. Resolve only exact legacy
// paths, so an upload replacing the original artwork always wins.
const legacyArt = new Map(
	snapshot.map(row => ["/assets/covers/" + row.id + ".webp", row.image])
);
const originalRecords = parsePublishedRecords(snapshot, path => String(path));

function artwork(path: unknown) {
	if (typeof path !== "string") return placeholder;
	const knownArt = legacyArt.get(path);
	if (knownArt) return knownArt;
	if (path.startsWith("/media/") && uuid.test(path.slice(7)))
		return artRoute + path.slice(7);
	return httpsUrl(path)?.href || placeholder;
}

function requestOptions(token: string, accept: string): RequestInit {
	return {
		method: "GET",
		headers: {
			Accept: accept,
			"OAI-Sites-Authorization": "Bearer " + token
		},
		cache: "no-store",
		redirect: "error",
		signal: AbortSignal.timeout(15_000)
	};
}

async function readLiveCollection() {
	const token = process.env.RECORD_ROOM_READ_TOKEN;
	if (!token) throw new Error("Record Room access is unavailable");
	const response = await fetch(
		recordRoom + "/api/collection",
		requestOptions(token, "application/json")
	);
	if (
		!response.ok ||
		response.headers.get("content-type")?.split(";")[0].trim() !==
			"application/json"
	) {
		throw new Error("Record Room collection is unavailable");
	}
	return parsePublishedRecords(await response.json(), artwork);
}

let inFlight: Promise<ReturnType<typeof parsePublishedRecords>> | undefined;
function refreshCollection() {
	inFlight ??= readLiveCollection().finally(() => {
		inFlight = undefined;
	});
	return inFlight;
}

// Cache only projected, successfully parsed rows. An empty list is authoritative.
const cachedLiveCollection = unstable_cache(
	async () => {
		const rows = await refreshCollection();
		return { fetchedAt: Date.now(), rows };
	},
	["published-record-room-v1"],
	{ revalidate: cacheSeconds }
);

export async function getPublishedCollection() {
	if (!process.env.RECORD_ROOM_READ_TOKEN) return originalRecords;
	const result = await cachedLiveCollection();
	// Next revalidates stale entries in the background. On this request, verify
	// expired rows synchronously as well so a long outage cannot restore old listings.
	if (Date.now() - result.fetchedAt >= cacheSeconds * 1000)
		return refreshCollection();
	return result.rows;
}

const noStore = {
	"Cache-Control": "private, no-store",
	"X-Content-Type-Options": "nosniff"
};

export async function getPublishedArtwork(id: string): Promise<Response> {
	const token = process.env.RECORD_ROOM_READ_TOKEN;
	if (!uuid.test(id) || !token)
		return new Response(null, { status: 404, headers: noStore });
	try {
		const current = await readLiveCollection();
		if (!current.some(row => row.image === artRoute + id)) {
			return new Response(null, { status: 404, headers: noStore });
		}
		const response = await fetch(
			recordRoom + "/media/" + id,
			requestOptions(token, "image/webp,image/png,image/jpeg")
		);
		if (response.status === 404)
			return new Response(null, { status: 404, headers: noStore });
		const type = response.headers.get("content-type")?.split(";")[0].trim();
		const cachePolicy = response.headers.get("cache-control") || "";
		// Record Room sets public only for a published artwork reference. Refuse a
		// private owner response even if publication changed between the two requests.
		if (
			!response.ok ||
			!response.body ||
			!type ||
			!["image/jpeg", "image/png", "image/webp"].includes(type) ||
			!cachePolicy
				.split(",")
				.some(part => part.trim().toLowerCase() === "public")
		) {
			return new Response(null, { status: 502, headers: noStore });
		}
		return new Response(response.body, {
			headers: {
				...noStore,
				"Content-Type": type,
				"Content-Security-Policy": "default-src 'none'"
			}
		});
	} catch {
		return new Response(null, { status: 503, headers: noStore });
	}
}
