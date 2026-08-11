import dynamic from "next/dynamic";
import { useEffect, useState } from "preact/hooks";
import { Analytics } from "@vercel/analytics/react";

import Footer from "./Footer";
import SiteHeader from "./Navbar";

const NekoCompanion = dynamic(
	() =>
		import("./NekoCompanion").then(module => module.NekoCompanion),
	{ ssr: false }
);

/** Wait for idle or first input before pulling in neko-ts; skip touch / reduced-motion. */
function useDeferredNekoReady() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		if (window.matchMedia("(pointer: coarse)").matches) {
			return;
		}

		let cancelled = false;
		let enabled = false;
		let idleId: number | undefined;
		let timeoutId: number | undefined;

		const cleanup = () => {
			window.removeEventListener("pointermove", onInteract);
			window.removeEventListener("keydown", onInteract);
			window.removeEventListener("scroll", onInteract);
			if (idleId !== undefined && "cancelIdleCallback" in window) {
				window.cancelIdleCallback(idleId);
			}
			if (timeoutId !== undefined) window.clearTimeout(timeoutId);
		};

		const enable = () => {
			if (cancelled || enabled) return;
			enabled = true;
			setReady(true);
			cleanup();
		};

		function onInteract() {
			enable();
		}

		window.addEventListener("pointermove", onInteract, {
			once: true,
			passive: true
		});
		window.addEventListener("keydown", onInteract, { once: true });
		window.addEventListener("scroll", onInteract, {
			once: true,
			passive: true
		});

		if ("requestIdleCallback" in window) {
			idleId = window.requestIdleCallback(enable, { timeout: 4000 });
		} else {
			timeoutId = window.setTimeout(enable, 2500);
		}

		return () => {
			cancelled = true;
			cleanup();
		};
	}, []);

	return ready;
}

export default function Layout({ children }: React.PropsWithChildren<{}>) {
	const nekoReady = useDeferredNekoReady();

	return (
		<div className="site min-h-screen text-white">
			<SiteHeader />
			<main className="site-shell site-main min-w-0 text-lg">{children}</main>
			<div className="site-shell site-footer-wrap">
				<Footer />
			</div>
			{nekoReady ? <NekoCompanion /> : null}
			<Analytics />
		</div>
	);
}
