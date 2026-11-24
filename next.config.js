const securityHeaders = [
	{
		key: "Content-Security-Policy",
		value: "base-uri 'self'; frame-ancestors 'none'; object-src 'none';"
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), geolocation=(), microphone=()"
	},
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" }
];

/** @type {import("next").NextConfig} */
const config = {
	env: {
		NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? ""
	},
	poweredByHeader: false,
	reactStrictMode: true,
	images: {
		localPatterns: [
			"/images/**",
			"/collection-design/**",
			"/_next/static/media/**"
		].map(pathname => ({ pathname, search: "" })),
		remotePatterns: ["i.scdn.co", "i.discogs.com"].map(hostname => ({
			protocol: "https",
			hostname,
			port: "",
			pathname: "/**"
		})),
		formats: ["image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [32, 48, 64, 96, 128, 160, 256]
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: securityHeaders
			}
		];
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
	}
};

module.exports = config;
