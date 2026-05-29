import Head from "next/head";

import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "../lib/site";

interface GenericMetaProps {
	title: string;
	description: string;
	path?: string;
	image?: string;
}

export default function GenericMeta({
	title,
	description,
	path = "/",
	image = DEFAULT_OG_IMAGE
}: GenericMetaProps) {
	const canonicalPath = path.startsWith("/") ? path : `/${path}`;
	const url = `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;
	const pageTitle =
		canonicalPath === "/" ? title : `${title} · ${SITE_NAME}`;

	return (
		<Head>
			<title>{pageTitle}</title>
			<link rel="canonical" href={url} />
			<meta name="description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:title" content={pageTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={url} />
			<meta property="og:image" content={image} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			<meta property="og:locale" content="en_US" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={pageTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />
		</Head>
	);
}
