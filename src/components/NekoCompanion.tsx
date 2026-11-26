"use client";

import { useEffect } from "react";
import type { Neko } from "neko-ts";

export function NekoCompanion() {
	useEffect(() => {
		const preference = window.matchMedia(
			"(pointer: fine) and (prefers-reduced-motion: no-preference)"
		);
		let cat: Neko | undefined;
		let disposed = false;
		const mount = async () => {
			if (!preference.matches || disposed || cat) return;
			const { Neko, NekoSizeVariations } = await import("neko-ts");
			if (!preference.matches || disposed || cat) return;
			cat = new Neko({
				nekoSize: NekoSizeVariations.LARGE,
				speed: 10,
				animationSpeed: 116,
				defaultState: "awake",
				origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
			});
		};
		const onChange = () => {
			if (preference.matches) void mount();
			else {
				cat?.destroy();
				cat = undefined;
			}
		};
		const timer = window.setTimeout(onChange, 2500);
		preference.addEventListener("change", onChange);
		return () => {
			disposed = true;
			clearTimeout(timer);
			preference.removeEventListener("change", onChange);
			cat?.destroy();
		};
	}, []);
	return null;
}
