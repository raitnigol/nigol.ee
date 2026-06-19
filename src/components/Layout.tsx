import Footer from "./Footer";
import SiteHeader from "./Navbar";
import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }: React.PropsWithChildren<{}>) {
	return (
		<div className="site min-h-screen text-white">
			<SiteHeader />
			<main className="site-shell site-main min-w-0 text-lg">{children}</main>
			<div className="site-shell site-footer-wrap">
				<Footer />
			</div>
			<Analytics />
		</div>
	);
}
