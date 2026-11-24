export const HOME_TERMINAL_INTRO_SEEN_KEY = "nigol-home-terminal-intro-seen";

export function hasSeenHomeTerminalIntro(): boolean {
	if (typeof window === "undefined") return false;

	try {
		return localStorage.getItem(HOME_TERMINAL_INTRO_SEEN_KEY) === "1";
	} catch {
		return false;
	}
}

export function markHomeTerminalIntroSeen(): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(HOME_TERMINAL_INTRO_SEEN_KEY, "1");
	} catch {
		// Private mode / blocked storage — ignore.
	}
}
