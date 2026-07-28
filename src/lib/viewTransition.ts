export function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;

	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Navigate immediately — view transitions were causing nav lag / layout snap. */
export function runViewTransition(callback: () => void | Promise<void>): void {
	void Promise.resolve(callback());
}
