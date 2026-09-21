const SPOTIFY_IMAGE_HOSTS = new Set(["i.scdn.co", "i.discogs.com"]);
const SPOTIFY_LINK_HOSTS = new Set(["open.spotify.com"]);

function isAllowedHttpsUrl(value: string, allowedHosts: Set<string>): boolean {
	try {
		const url = new URL(value);
		return url.protocol === "https:" && allowedHosts.has(url.hostname);
	} catch {
		return false;
	}
}

export function isAllowedSpotifyImageUrl(value: string): boolean {
	return isAllowedHttpsUrl(value, SPOTIFY_IMAGE_HOSTS);
}

export function isAllowedSpotifyLink(value: string): boolean {
	return isAllowedHttpsUrl(value, SPOTIFY_LINK_HOSTS);
}
