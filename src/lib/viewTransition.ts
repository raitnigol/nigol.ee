export function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;

	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type ViewTransitionDocument = Document & {
	startViewTransition?: (
		callback: () => void | Promise<void>
	) => { finished: Promise<void> };
};

export function runViewTransition(callback: () => void | Promise<void>): void {
	if (typeof document === "undefined" || prefersReducedMotion()) {
		void Promise.resolve(callback());
		return;
	}

	const doc = document as ViewTransitionDocument;

	if (!doc.startViewTransition) {
		void Promise.resolve(callback());
		return;
	}

	doc.startViewTransition(() => Promise.resolve(callback()));
}
