/**
 * Mint a Spotify refresh token for /api/topMusic + /api/nowPlaying.
 *
 * 1. In Spotify Developer Dashboard → your app → Redirect URIs, add BOTH:
 *      http://127.0.0.1:53682/callback
 *      http://localhost:53682/callback
 * 2. Stop yarn dev (free the terminal), then run:
 *      yarn spotify:auth
 * 3. Approve in the browser. Token is written into .env.local automatically.
 * 4. Restart yarn dev.
 */
import { exec } from "child_process";

import fs from "fs";
import http from "http";
import path from "path";
import readline from "readline";
import { URL } from "url";
import Spotify from "spotify-web-api-node";

const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = [
	"user-top-read",
	"user-read-currently-playing",
	"user-read-playback-state",
	"user-read-recently-played"
];

function loadEnvFile(filePath: string) {
	if (!fs.existsSync(filePath)) return;

	for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const separator = trimmed.indexOf("=");
		if (separator === -1) continue;

		const key = trimmed.slice(0, separator).trim();
		let value = trimmed.slice(separator + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		process.env[key] = value;
	}
}

function upsertEnvValue(filePath: string, key: string, value: string) {
	const line = `${key}="${value}"`;
	let contents = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

	if (new RegExp(`^${key}=`, "m").test(contents)) {
		contents = contents.replace(new RegExp(`^${key}=.*$`, "m"), line);
	} else {
		contents = `${contents.trimEnd()}\n${line}\n`;
	}

	fs.writeFileSync(filePath, contents.endsWith("\n") ? contents : `${contents}\n`);
}

function openBrowser(url: string) {
	const cmd =
		process.platform === "darwin"
			? `open "${url}"`
			: process.platform === "win32"
				? `start "" "${url}"`
				: `xdg-open "${url}"`;

	exec(cmd, err => {
		if (err) {
			console.log("Could not open browser automatically. Open this URL manually:");
			console.log(url);
		}
	});
}

function ask(question: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise(resolve => {
		rl.question(question, answer => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
	throw new Error(
		"Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env / .env.local"
	);
}

const api = new Spotify({
	clientId,
	clientSecret,
	redirectUri: REDIRECT_URI
});

// showDialog=true forces Spotify to re-consent so a refresh_token is returned.
const authorizeURL = api.createAuthorizeURL(SCOPES, "nigol-ee", true);

async function finishWithCode(code: string) {
	const tokenResponse = await api.authorizationCodeGrant(code);
	const refreshToken = tokenResponse.body.refresh_token;

	if (!refreshToken) {
		throw new Error(
			"Spotify did not return a refresh_token. Re-run and approve again (show dialog)."
		);
	}

	const envLocal = path.join(process.cwd(), ".env.local");
	const envFile = path.join(process.cwd(), ".env");

	upsertEnvValue(envLocal, "SPOTIFY_REFRESH_TOKEN", refreshToken);
	if (fs.existsSync(envFile)) {
		upsertEnvValue(envFile, "SPOTIFY_REFRESH_TOKEN", refreshToken);
	}

	console.log("\n✓ Wrote SPOTIFY_REFRESH_TOKEN to .env.local");
	if (fs.existsSync(envFile)) {
		console.log("✓ Also updated .env");
	}
	console.log("\nRestart yarn dev, then reload /music.\n");
}

async function main() {
	console.log("\nSpotify auth helper\n");
	console.log("Add BOTH redirect URIs in the Spotify Dashboard → your app → Settings:");
	console.log(`  http://127.0.0.1:${PORT}/callback`);
	console.log(`  http://localhost:${PORT}/callback`);
	console.log("\nOpening browser…\n");
	console.log(authorizeURL);
	console.log("");

	openBrowser(authorizeURL);

	const server = http.createServer(async (req, res) => {
		try {
			const url = new URL(req.url ?? "/", REDIRECT_URI);

			if (url.pathname !== "/callback") {
				res.writeHead(404).end("Not found");
				return;
			}

			const code = url.searchParams.get("code");
			const error = url.searchParams.get("error");

			if (error || !code) {
				res.writeHead(400, { "Content-Type": "text/plain" }).end(
					`Authorization failed: ${error ?? "missing code"}`
				);
				console.error(`\nCallback error: ${error ?? "missing code"}`);
				server.close();
				process.exit(1);
			}

			await finishWithCode(code);

			res.writeHead(200, { "Content-Type": "text/html" }).end(
				"<h1>Success</h1><p>Token saved. You can close this tab.</p>"
			);

			server.close();
			process.exit(0);
		} catch (err) {
			console.error("\nToken exchange failed:", err);
			res.writeHead(500, { "Content-Type": "text/plain" }).end(
				"Token exchange failed. Check the terminal."
			);
			server.close();
			process.exit(1);
		}
	});

	server.on("error", async err => {
		console.error("\nCould not start local callback server:", err);
		console.log(
			"\nFallback: after approving in the browser, copy the FULL redirect URL"
		);
		console.log("(it will look like http://127.0.0.1:53682/callback?code=...)");
		const pasted = await ask("Paste redirect URL here: ");
		try {
			const url = new URL(pasted);
			const code = url.searchParams.get("code");
			if (!code) throw new Error("No ?code= in that URL");
			await finishWithCode(code);
			process.exit(0);
		} catch (exchangeErr) {
			console.error(exchangeErr);
			process.exit(1);
		}
	});

	server.listen(PORT, "127.0.0.1", () => {
		console.log(`Waiting for Spotify callback on ${REDIRECT_URI} …`);
		console.log("(If the browser shows INVALID_CLIENT or redirect_uri mismatch,");
		console.log(" the URIs above are missing/wrong in the Dashboard.)\n");
	});
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
