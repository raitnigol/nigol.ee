import { createHash } from "node:crypto";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

// Pre-encode the opening photograph. The gallery keeps the full portrait.
const source = resolve("public/images/pohhu/kivi-art-show/01.jpg");
const directory = "/images/pohhu/opening";
const destination = resolve("public" + directory);
const { data, info } = await sharp(source)
	.autoOrient()
	.toColourspace("srgb")
	.raw()
	.toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const cropHeight = Math.round(width / 1.3);
const crop = {
	width,
	height: cropHeight,
	left: 0,
	top: Math.round((height - cropHeight) * 0.67)
};

function imageAt(size) {
	return sharp(data, { raw: { width, height, channels } })
		.extract(crop)
		.resize({ width: size });
}

const manifest = { avif: [], webp: [] };
const current = new Set();
await mkdir(destination, { recursive: true });

async function save(format, image) {
	const { data, info } = await image.toBuffer({ resolveWithObject: true });
	const hash = createHash("sha256").update(data).digest("hex").slice(0, 16);
	const filename = `${info.width}.${hash}.${format}`;
	await writeFile(resolve(destination, filename), data);
	manifest[format].push({
		src: `${directory}/${filename}`,
		width: info.width,
		height: info.height
	});
	current.add(filename);
}

for (const size of [384, 576, 768, 1080, 1536]) {
	await save("avif", imageAt(size).avif({ quality: 55, effort: 5 }));
}
for (const size of [384, 768]) {
	await save("webp", imageAt(size).webp({ quality: 78, effort: 5 }));
}
await writeFile(
	resolve("data/generated/musicHero.json"),
	JSON.stringify(manifest, null, "\t") + "\n"
);
for (const filename of await readdir(destination)) {
	if (/^\d+\.[\da-f]{16}\.(?:avif|webp)$/.test(filename) && !current.has(filename)) {
		await unlink(resolve(destination, filename));
	}
}
