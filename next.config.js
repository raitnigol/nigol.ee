// @ts-check

const withPreact = require("next-plugin-preact");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true"
});

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	swcMinify: true,
	i18n: { locales: ["en-US"], defaultLocale: "en-US" },
	images: {
		domains: ["i.scdn.co"],
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
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
			"@fontsource/inter/800.css": require.resolve(
				"@fontsource/inter/800.css"
			),
			"@fontsource/outfit/500.css": require.resolve(
				"@fontsource/outfit/500.css"
			),
			"@fontsource/outfit/700.css": require.resolve(
				"@fontsource/outfit/700.css"
			)
		};

		return config;
	}
};

module.exports = withBundleAnalyzer(withPreact(config));
