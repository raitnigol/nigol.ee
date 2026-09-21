/** Navigate immediately — view transitions were causing nav lag / layout snap. */
export function runViewTransition(callback: () => void | Promise<void>): void {
	void Promise.resolve(callback());
}
