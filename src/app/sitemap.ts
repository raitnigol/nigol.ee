import type { MetadataRoute } from "next";

import { listedPoeticWorks, poeticWorkHref } from "../data/poeticJustice";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const paths = [
		"/",
		"/music",
		"/physical-media",
		"/poetic-justice",
		...listedPoeticWorks.map(work => poeticWorkHref(work.id))
	];

	return paths.map(path => ({ url: new URL(path, SITE_URL).href }));
}
