import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: { absolute: "Page not found · nigol.ee" },
	robots: { index: false, follow: false }
};

export default function NotFound() {
	return (
		<div className="site-shell site-main">
			<h1 className="mb-2 heading text-amber-400">
				404 &ndash; page not found...
			</h1>
			<p>
				Seems like this page doesn&apos;t exist. Let&apos;s{" "}
				<Link
					href="/"
					className="border-b border-[#fff4] hover:border-white transition focus-ring"
				>
					go back
				</Link>
				!
			</p>
		</div>
	);
}
