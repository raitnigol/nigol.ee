import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";

import Footer from "./Footer";
import SiteHeader from "./Navbar";

const NekoCompanion = dynamic(
	() =>
		import("./NekoCompanion").then(module => module.NekoCompanion),
	{ ssr: false }
);

export default function Layout({ children }: React.PropsWithChildren<{}>) {
	return (
		<div className="site min-h-screen text-white">
			<SiteHeader />
			<main className="site-shell site-main min-w-0 text-lg">{children}</main>
			<div className="site-shell site-footer-wrap">
				<Footer />
			</div>
			<NekoCompanion />
			<Analytics />
		</div>
	);
}
