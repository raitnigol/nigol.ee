import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@fontsource/inter/latin-800.css";
import "@fontsource/inter/latin-ext-800.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-ext-500.css";
import "@fontsource/outfit/latin-700.css";
import "@fontsource/outfit/latin-ext-700.css";
import "../styles/index.scss";
import "../styles/site-modern.css";
import SiteHeader from "../components/Navbar";
import Footer from "../components/Footer";
import { NekoCompanion } from "../components/NekoCompanion";
import { SITE_URL } from "../lib/site";

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };
export const viewport: Viewport = {
	themeColor: "#000000",
	colorScheme: "dark"
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				<div className="site min-h-screen text-white">
					<a className="skip-link" href="#main-content">
						Skip to content
					</a>
					<SiteHeader />
					<main
						id="main-content"
						tabIndex={-1}
						className="min-w-0 text-lg"
					>
						{children}
					</main>
					<div className="site-shell site-footer-wrap">
						<Footer />
					</div>
					<NekoCompanion />
					<Analytics />
					<SpeedInsights />
				</div>
			</body>
		</html>
	);
}
