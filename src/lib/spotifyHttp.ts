type ClientCredentials = { clientId: string; clientSecret: string };
type SpotifyCredentials = ClientCredentials & { refreshToken?: string };
type Token = {
	access_token: string;
	expires_in: number;
	refresh_token?: string;
};

type Query = Record<string, string | number>;
type TopOptions = {
	limit: number;
	time_range: "short_term" | "medium_term" | "long_term";
};

async function spotifyFetch(url: URL | string, options: RequestInit) {
	const response = await fetch(url, {
		...options,
		redirect: "error",
		cache: "no-store",
		signal: AbortSignal.timeout(7000)
	});
	if (!response.ok) {
		await response.body?.cancel();
		throw Object.assign(
			new Error(`Spotify returned HTTP ${response.status}`),
			{
				statusCode: response.status,
				headers: Object.fromEntries(response.headers)
			}
		);
	}
	return response;
}

export async function requestSpotifyToken(
	credentials: ClientCredentials,
	grant: Record<string, string>
): Promise<Token> {
	const basic = Buffer.from(
		`${credentials.clientId}:${credentials.clientSecret}`
	).toString("base64");
	const response = await spotifyFetch(
		"https://accounts.spotify.com/api/token",
		{
			method: "POST",
			headers: {
				Authorization: `Basic ${basic}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams(grant)
		}
	);
	const token = await response.json();
	if (
		typeof token?.access_token !== "string" ||
		!token.access_token ||
		!Number.isFinite(token.expires_in) ||
		token.expires_in <= 0
	) {
		throw new Error("Spotify returned an invalid access token");
	}
	return token;
}

function createSpotifyClient(credentials: SpotifyCredentials) {
	let refreshToken = credentials.refreshToken;
	let cached: { value: string; expires: number } | undefined;
	let pending: Promise<string> | undefined;

	async function accessToken() {
		if (cached && Date.now() < cached.expires) return cached.value;
		pending ??= requestSpotifyToken(
			credentials,
			refreshToken
				? { grant_type: "refresh_token", refresh_token: refreshToken }
				: { grant_type: "client_credentials" }
		)
			.then(token => {
				if (refreshToken && token.refresh_token)
					refreshToken = token.refresh_token;
				const lifetime = token.expires_in * 1000;
				cached = {
					value: token.access_token,
					expires:
						Date.now() + lifetime - Math.min(60_000, lifetime / 10)
				};
				return cached.value;
			})
			.finally(() => {
				pending = undefined;
			});
		return pending;
	}

	async function get<T>(path: string, query?: Query) {
		const url = new URL(`https://api.spotify.com/v1/${path}`);
		for (const [key, value] of Object.entries(query ?? {}))
			url.searchParams.set(key, String(value));
		const response = await spotifyFetch(url, {
			headers: { Authorization: `Bearer ${await accessToken()}` }
		});
		const body: T =
			response.status === 204 && path === "me/player/currently-playing"
				? null
				: await response.json();
		return {
			body,
			statusCode: response.status,
			headers: Object.fromEntries(response.headers)
		};
	}

	return {
		getArtist: (id: string) =>
			get<SpotifyApi.SingleArtistResponse>(
				`artists/${encodeURIComponent(id)}`
			),
		getMyCurrentPlayingTrack: () =>
			get<SpotifyApi.CurrentlyPlayingResponse | null>(
				"me/player/currently-playing"
			),
		getMyRecentlyPlayedTracks: (options: { limit: number }) =>
			get<SpotifyApi.UsersRecentlyPlayedTracksResponse>(
				"me/player/recently-played",
				options
			),
		getMyTopTracks: (options: TopOptions) =>
			get<SpotifyApi.UsersTopTracksResponse>("me/top/tracks", options),
		getMyTopArtists: (options: TopOptions) =>
			get<SpotifyApi.UsersTopArtistsResponse>("me/top/artists", options)
	};
}

type SpotifyClient = ReturnType<typeof createSpotifyClient>;

// Each runner keeps its grant and tokens isolated from the other credential set.
export function spotifyClientRunner(
	grant: "client_credentials" | "refresh_token"
) {
	let configured: SpotifyCredentials | undefined;
	let client: SpotifyClient | undefined;
	return async function withClient<T>(
		fn: (api: SpotifyClient) => Promise<T>
	): Promise<T> {
		const clientId = process.env.SPOTIFY_CLIENT_ID;
		const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
		const refreshToken =
			grant === "refresh_token"
				? process.env.SPOTIFY_REFRESH_TOKEN
				: undefined;
		if (
			!clientId ||
			!clientSecret ||
			(grant === "refresh_token" && !refreshToken)
		)
			throw new Error("Spotify credentials are not configured");
		if (
			!client ||
			configured?.clientId !== clientId ||
			configured.clientSecret !== clientSecret ||
			configured.refreshToken !== refreshToken
		) {
			configured = { clientId, clientSecret, refreshToken };
			client = createSpotifyClient(configured);
		}
		return fn(client);
	};
}
