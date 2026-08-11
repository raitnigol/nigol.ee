// @ts-check

const withPreact = require("next-plugin-preact");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true"
});

/** @type {import("next").NextConfig} */
const config = {
	env: {
		NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? ""
	},
	reactStrictMode: true,
	swcMinify: true,
	i18n: { locales: ["en-US"], defaultLocale: "en-US" },
	images: {
		domains: ["i.scdn.co"],
		formats: ["image/avif", "image/webp"],
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [32, 48, 64, 96, 128, 160, 256]
	},
	experimental: {
		esmExternals: false,
	},
	async redirects() {
		return [
			{
				source: "/projects",
				destination: "/",
				permanent: true
			},
			{
				source: "/skills",
				destination: "/",
				permanent: true
			}
		];
	},
	webpack: config => {
		config.resolve.alias = {
			...config.resolve.alias,
			"@fontsource/inter/latin-800.css": require.resolve(
				"@fontsource/inter/latin-800.css"
			),
			"@fontsource/inter/latin-ext-800.css": require.resolve(
				"@fontsource/inter/latin-ext-800.css"
			),
			"@fontsource/outfit/latin-500.css": require.resolve(
				"@fontsource/outfit/latin-500.css"
			),
			"@fontsource/outfit/latin-ext-500.css": require.resolve(
				"@fontsource/outfit/latin-ext-500.css"
			),
			"@fontsource/outfit/latin-700.css": require.resolve(
				"@fontsource/outfit/latin-700.css"
			),
			"@fontsource/outfit/latin-ext-700.css": require.resolve(
				"@fontsource/outfit/latin-ext-700.css"
			)
		};

		return config;
	}
};

module.exports = withBundleAnalyzer(withPreact(config));
