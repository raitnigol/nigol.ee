import Spotify from "spotify-web-api-node";

let api: Spotify | null = null;
let expirationTime = 0;
let configuredClientId: string | undefined;
let configuredClientSecret: string | undefined;

function getSpotifyClient() {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error(
			"Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET"
		);
	}

	if (
		!api ||
		clientId !== configuredClientId ||
		clientSecret !== configuredClientSecret
	) {
		api = new Spotify({ clientId, clientSecret });
		configuredClientId = clientId;
		configuredClientSecret = clientSecret;
		expirationTime = 0;
	}

	return api;
}

export async function withSpotifyClient<T>(
	fn: (client: Spotify) => Promise<T>
): Promise<T> {
	const client = getSpotifyClient();

	if (Date.now() > expirationTime) {
		const response = await client.clientCredentialsGrant();
		client.setAccessToken(response.body.access_token);
		expirationTime = Date.now() + response.body.expires_in * 1000;
	}

	return fn(client);
}
