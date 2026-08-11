import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { SITE_URL } from "../src/lib/site";

const STATIC_PATHS = ["/", "/music", "/physical-media"] as const;

function toAbsoluteUrl(path: string): string {
	if (path === "/") return `${SITE_URL}/`;
	return `${SITE_URL}${path}`;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function buildSitemapXml(urls: string[]): string {
	const entries = urls
		.map(url => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
		.join("\n\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

const urls = STATIC_PATHS.map(toAbsoluteUrl);

const outputPath = resolve(process.cwd(), "public/sitemap.xml");
writeFileSync(outputPath, buildSitemapXml(urls), "utf8");

console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
