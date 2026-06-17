import Spotify from "spotify-web-api-node";

const api = new Spotify({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

let expirationTime = 0;

export async function withSpotifyClient<T>(
	fn: (client: Spotify) => Promise<T>
): Promise<T> {
	if (Date.now() > expirationTime) {
		const response = await api.clientCredentialsGrant();
		api.setAccessToken(response.body.access_token);
		expirationTime = Date.now() + response.body.expires_in * 1000;
	}

	return fn(api);
}
