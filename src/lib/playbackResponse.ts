import type { NowPlayingResponseSuccess } from "./nowPlaying";

const noStore = { "Cache-Control": "private, no-store" };
const sampleLifetimeMs = 2_000;

function rateLimited(retryAt: number) {
	const seconds = Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));
	return Response.json(
		{ error: "Spotify rate limit reached." },
		{ status: 429, headers: { ...noStore, "Retry-After": String(seconds) } }
	);
}

// Briefly share samples across visitors on a warm instance. Browser and CDN
// caches would compound this delay and could replay an old track after a skip.
export function createPlaybackResponder(
	load: () => Promise<NowPlayingResponseSuccess>
) {
	let cached: { value: NowPlayingResponseSuccess; until: number } | undefined;
	let pending: Promise<NowPlayingResponseSuccess> | undefined;
	let retryAt = 0;

	return async function playbackResponse() {
		const now = Date.now();
		if (now < retryAt) return rateLimited(retryAt);
		if (cached && now < cached.until)
			return Response.json(cached.value, { headers: noStore });
		try {
			pending ??= load()
				.then(value => {
					cached = { value, until: now + sampleLifetimeMs };
					return value;
				})
				.finally(() => {
					pending = undefined;
				});
			return Response.json(await pending, { headers: noStore });
		} catch (error) {
			const failure = error as {
				statusCode?: number;
				headers?: Record<string, string>;
			} | null;
			if (failure?.statusCode === 429) {
				const delay = Number(failure.headers?.["retry-after"]);
				const seconds =
					Number.isSafeInteger(delay) && delay > 0 ? delay : 30;
				retryAt = Date.now() + seconds * 1000;
				return rateLimited(retryAt);
			}
			return Response.json(
				{ error: "Now-playing data is temporarily unavailable." },
				{ status: 503, headers: noStore }
			);
		}
	};
}
