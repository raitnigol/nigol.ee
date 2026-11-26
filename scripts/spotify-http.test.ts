import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";

import { requestSpotifyToken } from "../src/lib/spotifyHttp";
import { withSpotifyClient } from "../src/lib/spotifyServer";
import { withSpotifyUserClient } from "../src/lib/spotifyUserServer";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

function mockSpotify(
	t: TestContext,
	respond: (request: Request, url: URL) => Response | Promise<Response>
) {
	const credentials = {
		SPOTIFY_CLIENT_ID: `client-${t.name}`,
		SPOTIFY_CLIENT_SECRET: "test-secret",
		SPOTIFY_REFRESH_TOKEN: "test-refresh"
	};

	for (const [key, value] of Object.entries(credentials)) {
		const previous = process.env[key];
		process.env[key] = value;
		t.after(() => {
			if (previous === undefined) delete process.env[key];
			else process.env[key] = previous;
		});
	}

	return t.mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) => {
			const signal =
				init?.signal ??
				(input instanceof Request ? input.signal : undefined);
			assert.ok(
				signal instanceof AbortSignal,
				"Spotify request must have an abort signal"
			);
			const request = new Request(input, init);
			const url = new URL(request.url);
			if (request.url !== TOKEN_URL) {
				assert.equal(url.origin, "https://api.spotify.com");
				assert.equal(request.method, "GET");
			}
			return respond(request, url);
		}
	);
}

function token(accessToken: string) {
	return Response.json({
		access_token: accessToken,
		token_type: "Bearer",
		expires_in: 3600
	});
}

test("concurrent user playback requests share a refresh and retain the recent track after a 204", async t => {
	let grants = 0;
	const recent = {
		items: [
			{ track: { id: "last-track" }, played_at: "2026-08-01T10:00:00Z" }
		]
	};
	mockSpotify(t, async (request, url) => {
		if (url.href === TOKEN_URL) {
			grants++;
			assert.equal(request.method, "POST");
			const params = new URLSearchParams(await request.text());
			assert.equal(params.get("grant_type"), "refresh_token");
			assert.equal(params.get("refresh_token"), "test-refresh");
			return token("user-access");
		}
		assert.equal(
			request.headers.get("authorization"),
			"Bearer user-access"
		);
		if (url.pathname === "/v1/me/player/currently-playing")
			return new Response(null, { status: 204 });
		assert.equal(url.pathname, "/v1/me/player/recently-played");
		assert.equal(url.searchParams.get("limit"), "1");
		return Response.json(recent);
	});

	const reads = await Promise.all(
		[1, 2, 3].map(() =>
			withSpotifyUserClient(async client => {
				const current = await client.getMyCurrentPlayingTrack();
				assert.ok(!current.body?.item);
				return (await client.getMyRecentlyPlayedTracks({ limit: 1 }))
					.body;
			})
		)
	);
	assert.deepEqual(reads, [recent, recent, recent]);
	assert.equal(grants, 1);
});

test("app and user calls use separate grants and preserve query parameters and response bodies", async t => {
	const grants: string[] = [];
	const lookups: [string, string, Record<string, string>][] = [];
	mockSpotify(t, async (request, url) => {
		if (url.href === TOKEN_URL) {
			const form = new URLSearchParams(await request.text());
			const grantType = form.get("grant_type")!;
			grants.push(grantType);
			return token(grantType);
		}
		const auth = request.headers.get("authorization")!;
		lookups.push([
			url.pathname,
			auth,
			Object.fromEntries(url.searchParams)
		]);
		return Response.json({ probe: url.pathname });
	});

	const artist = await withSpotifyClient(client =>
		client.getArtist("artist-id")
	);
	assert.deepEqual(artist.body, { probe: "/v1/artists/artist-id" });
	const top = await withSpotifyUserClient(client =>
		client.getMyTopArtists({ time_range: "medium_term", limit: 24 })
	);
	assert.deepEqual(top.body, { probe: "/v1/me/top/artists" });
	assert.deepEqual(grants.sort(), ["client_credentials", "refresh_token"]);
	const app = "Bearer client_credentials";
	assert.deepEqual(lookups, [
		["/v1/artists/artist-id", app, {}],
		[
			"/v1/me/top/artists",
			"Bearer refresh_token",
			{ time_range: "medium_term", limit: "24" }
		]
	]);
});

test("rate-limit failures retain HTTP status and Retry-After", async t => {
	mockSpotify(t, (_request, url) =>
		url.href === TOKEN_URL
			? token("access")
			: Response.json(
					{ error: { status: 429, message: "Rate limit exceeded" } },
					{ status: 429, headers: { "Retry-After": "9" } }
			  )
	);
	await assert.rejects(
		withSpotifyClient(client => client.getArtist("artist-id")),
		error => {
			const failure = error as {
				statusCode?: number;
				headers?: Record<string, string>;
			};
			assert.equal(failure.statusCode, 429);
			assert.equal(failure.headers?.["retry-after"], "9");
			return true;
		}
	);
});

test("a failed grant can recover and a changed refresh token invalidates cached authorization", async t => {
	const grants: string[] = [];
	mockSpotify(t, async (request, url) => {
		if (url.href === TOKEN_URL) {
			const form = new URLSearchParams(await request.text());
			const refresh = form.get("refresh_token")!;
			grants.push(refresh);
			if (grants.length === 1)
				return Response.json(
					{ error: "temporarily_unavailable" },
					{ status: 503 }
				);
			return token(`access-${refresh}`);
		}
		return Response.json({
			authorization: request.headers.get("authorization")
		});
	});
	const read = () =>
		withSpotifyUserClient(client =>
			client.getMyTopTracks({ limit: 1, time_range: "short_term" })
		);
	await assert.rejects(read());
	assert.deepEqual((await read()).body, {
		authorization: "Bearer access-test-refresh"
	});
	process.env.SPOTIFY_REFRESH_TOKEN = "new-refresh";
	assert.deepEqual((await read()).body, {
		authorization: "Bearer access-new-refresh"
	});
	assert.deepEqual(grants, ["test-refresh", "test-refresh", "new-refresh"]);
});

test("the authorization code exchange uses HTTP Basic and the exact registered redirect URI", async t => {
	const redirect = "http://127.0.0.1:53682/callback";
	const code = "code+with/reserved=characters";
	mockSpotify(t, async (request, url) => {
		assert.equal(url.href, TOKEN_URL);
		assert.equal(request.method, "POST");
		const basic = Buffer.from("client-id:client-secret").toString("base64");
		assert.equal(request.headers.get("authorization"), `Basic ${basic}`);
		assert.match(
			request.headers.get("content-type") ?? "",
			/^application\/x-www-form-urlencoded/
		);
		assert.deepEqual(
			Object.fromEntries(new URLSearchParams(await request.text())),
			{
				grant_type: "authorization_code",
				redirect_uri: redirect,
				code
			}
		);
		return Response.json({
			access_token: "access",
			expires_in: 3600,
			refresh_token: "refresh"
		});
	});
	const response = await requestSpotifyToken(
		{ clientId: "client-id", clientSecret: "client-secret" },
		{ grant_type: "authorization_code", redirect_uri: redirect, code }
	);
	assert.equal(response.refresh_token, "refresh");
});

test("an invalid grant response is rejected before a resource request and does not poison the cache", async t => {
	let tokenRequests = 0;
	let resourceRequests = 0;
	mockSpotify(t, (request, url) => {
		if (url.href === TOKEN_URL) {
			tokenRequests++;
			return tokenRequests === 1
				? Response.json({ access_token: "unusable", expires_in: 0 })
				: token("recovered");
		}
		resourceRequests++;
		assert.equal(request.headers.get("authorization"), "Bearer recovered");
		return Response.json({ id: "artist-id" });
	});
	const read = () =>
		withSpotifyClient(client => client.getArtist("artist-id"));
	await assert.rejects(read());
	assert.equal(resourceRequests, 0);
	assert.equal((await read()).body.id, "artist-id");
	assert.equal(tokenRequests, 2);
});
