import { useEffect } from "preact/hooks";
import { Neko, NekoSizeVariations } from "neko-ts";

/**
 * Desktop oneko companion (neko-ts / xneko).
 * Client-only — mounts once for the whole site shell.
 */
export function NekoCompanion() {
	useEffect(() => {
		const neko = new Neko({
			nekoSize: NekoSizeVariations.LARGE,
			speed: 10,
			animationSpeed: 116,
			defaultState: "awake",
			origin: {
				x: window.innerWidth / 2,
				y: window.innerHeight / 2
			}
		});

		return () => {
			neko.destroy();
		};
	}, []);

	return null;
}
