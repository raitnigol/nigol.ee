import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import only the renderer. Never copy Plinth's Spotify client, UI or credentials.
const projectId = "appgprj_6b05663709c481919c6e05051d3a85bd";
const modules = [
	"deck.js",
	"pressing-art.js",
	"sleeve-display.js",
	"victor-render.js",
	"victor-cpu.js",
	"victor-camera.js",
	"victor-lighting.js",
	"scene-finish.js",
	"needle-drop.js",
	"listening-angle.js"
];
const assets = [
	...modules,
	"victor-model.json",
	"victor-model.bin",
	"cafe-model.json",
	"cafe-model.bin",
	...["plaster", "counter", "menu", "leather", "marble", "wood"].map(
		name => `cafe-textures/${name}.webp`
	)
];
const root = fileURLToPath(new URL("../", import.meta.url));
const checkout = process.argv[2];
if (!checkout || process.argv.length !== 3)
	throw new Error(
		"Usage: npm run plinth:sync -- /absolute/path/to/plinth-checkout"
	);
const git = (...args) =>
	execFileSync("git", ["-C", checkout, ...args], { encoding: "utf8" }).trim();
const hosting = JSON.parse(
	await readFile(path.join(checkout, ".openai/hosting.json"), "utf8")
);
if (hosting.project_id !== projectId || hosting.static?.directory !== "dist")
	throw new Error("Select the Plinth source checkout.");
if (git("status", "--porcelain", "--untracked-files=no"))
	throw new Error("Commit upstream changes before syncing Plinth.");
const commit = git("rev-parse", "HEAD");
const files = new Map();
for (const name of assets)
	files.set(name, await readFile(path.join(checkout, "dist", name)));
files.set(
	"LeagueSpartan-OFL.txt",
	await readFile(path.join(checkout, "model/fonts/LeagueSpartan-OFL.txt"))
);
// Both renderers support suspension; the upstream facade does not forward it yet.
// Keep this one compatibility patch explicit, and fail if upstream changes it.
const facade = files.get("deck.js").toString();
const marker = "['setCover','setRpm'";
if (!facade.includes(marker))
	throw new Error("Review the upstream deck facade before syncing.");
files.set(
	"deck.js",
	Buffer.from(facade.replace(marker, "['setSuspended','setCover','setRpm'"))
);
const hashes = Object.fromEntries(
	[...files].map(([name, bytes]) => [
		name,
		createHash("sha256").update(bytes).digest("hex")
	])
);
const digest = createHash("sha256")
	.update(JSON.stringify(hashes))
	.digest("hex")
	.slice(0, 16);
const basePath = `/plinth/${digest}`;
for (const [name, bytes] of files) {
	const destination = path.join(root, "public", basePath, name);
	await mkdir(path.dirname(destination), { recursive: true });
	await writeFile(destination, bytes);
}
await mkdir(path.join(root, "src/lib/plinth"), { recursive: true });
await writeFile(
	path.join(root, "src/lib/plinth/upstream.json"),
	JSON.stringify(
		{
			projectId,
			sourceUrl: "https://plinth-listening-deck.nixol.chatgpt.site",
			commit,
			basePath,
			patches: ["Forward setSuspended to both renderers"],
			files: hashes
		},
		null,
		2
	) + "\n"
);
console.log(
	`Synced Plinth ${commit.slice(0, 7)} to ${basePath} (${files.size} files).`
);
