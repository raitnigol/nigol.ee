import Spotify from "spotify-web-api-node";

const TOKEN_EXPIRY_SKEW_MS = 60_000;

let api: Spotify | null = null;
let expirationTime = 0;
let refreshPromise: Promise<void> | null = null;
let configuredClientId: string | undefined;
let configuredClientSecret: string | undefined;
let configuredRefreshToken: string | undefined;

function getSpotifyUserClient(): Spotify {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

	if (!clientId || !clientSecret || !refreshToken) {
		throw new Error("Spotify user API credentials are not configured");
	}

	if (
		!api ||
		clientId !== configuredClientId ||
		clientSecret !== configuredClientSecret ||
		refreshToken !== configuredRefreshToken
	) {
		api = new Spotify({ clientId, clientSecret, refreshToken });
		configuredClientId = clientId;
		configuredClientSecret = clientSecret;
		configuredRefreshToken = refreshToken;
		expirationTime = 0;
		refreshPromise = null;
	}

	return api;
}

async function ensureAccessToken(client: Spotify): Promise<void> {
	if (Date.now() < expirationTime - TOKEN_EXPIRY_SKEW_MS) return;

	if (!refreshPromise) {
		refreshPromise = client
			.refreshAccessToken()
			.then(response => {
				client.setAccessToken(response.body.access_token);
				expirationTime = Date.now() + response.body.expires_in * 1000;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	await refreshPromise;
}

export async function withSpotifyUserClient<T>(
	fn: (client: Spotify) => Promise<T>
): Promise<T> {
	const client = getSpotifyUserClient();
	await ensureAccessToken(client);
	return fn(client);
}
