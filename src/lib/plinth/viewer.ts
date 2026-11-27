import upstream from "./upstream.json";
import type { plinthDisplay, PlinthTrack } from "./display";

type View = "studio" | "overhead";
type Engine = {
	setPlaying(value: boolean): void;
	setProgress(value: number): void;
	setCover(url: string | null): void;
	setSuspended(value: boolean): void;
	setPitchEnabled(value: boolean): void;
	setNeedleDropEnabled(value: boolean): void;
	setOrbitEnabled(value: boolean): void;
	setView(value: View): void;
	destroy(): void;
};
type RendererModule = {
	createDeck(
		container: HTMLElement,
		callbacks: {
			onFrame(): void;
			onRenderError(): void;
		}
	): Engine;
};
type LabelModule = { printedLabel(track: PlinthTrack): string };

export async function loadPlinthViewer() {
	// These same-origin, content-addressed ES modules keep the upstream renderer
	// and its relative mesh/texture URLs intact. Nothing from spotify.js is loaded.
	const [renderer, labels]: [RendererModule, LabelModule] = await Promise.all(
		[
			import(
				/* webpackIgnore: true */ /* turbopackIgnore: true */ `${upstream.basePath}/deck.js`
			),
			import(
				/* webpackIgnore: true */ /* turbopackIgnore: true */ `${upstream.basePath}/record-label.js`
			)
		]
	);
	return function mountViewer(
		container: HTMLElement,
		onReady: () => void,
		onError: () => void
	) {
		let disposed = false;
		let printed = "";
		const timeout = window.setTimeout(onError, 45_000);
		const engine = renderer.createDeck(container, {
			onFrame() {
				if (disposed) return;
				window.clearTimeout(timeout);
				// The public scene is a display; even the model's physical switches
				// and keyboard shortcuts cannot become playback controls.
				for (const canvas of container.querySelectorAll("canvas")) {
					canvas.tabIndex = -1;
					canvas.style.pointerEvents = "none";
					canvas.setAttribute("aria-hidden", "true");
					canvas.removeAttribute("aria-label");
				}
				onReady();
			},
			onRenderError() {
				window.clearTimeout(timeout);
				if (!disposed) onError();
			}
		});
		engine.setPitchEnabled(false);
		engine.setNeedleDropEnabled(false);
		engine.setOrbitEnabled(false);
		return {
			update(display: ReturnType<typeof plinthDisplay>) {
				if (disposed) return;
				engine.setPlaying(display.playing);
				engine.setProgress(display.progress);
				const signature = JSON.stringify(display.track);
				if (signature !== printed) {
					printed = signature;
					engine.setCover(
						display.track
							? labels.printedLabel(display.track)
							: null
					);
				}
			},
			setVisible(visible: boolean) {
				engine.setSuspended(!visible);
			},
			setView(view: View) {
				engine.setView(view);
			},
			destroy() {
				disposed = true;
				window.clearTimeout(timeout);
				engine.destroy();
			}
		};
	};
}

export type PlinthViewer = ReturnType<
	Awaited<ReturnType<typeof loadPlinthViewer>>
>;
