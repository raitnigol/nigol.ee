import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "./site";

export function pageMetadata(
	title: string,
	description: string,
	path: string
): Metadata {
	const url = new URL(path, SITE_URL).href;
	const pageTitle = path === "/" ? title : `${title} · ${SITE_NAME}`;
	return {
		title: pageTitle,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: "website",
			locale: "en_US",
			siteName: SITE_NAME,
			url,
			title: pageTitle,
			description,
			images: [
				{
					url: DEFAULT_OG_IMAGE,
					width: 1200,
					height: 630,
					alt: "nigol.ee"
				}
			]
		},
		twitter: {
			card: "summary_large_image",
			title: pageTitle,
			description,
			images: [DEFAULT_OG_IMAGE]
		}
	};
}
