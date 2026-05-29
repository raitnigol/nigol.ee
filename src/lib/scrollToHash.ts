/** Scroll to `location.hash` target after client navigation (e.g. /music#pohhu-heading). */
export function scrollToHashElement(
	hash: string,
	behavior: ScrollBehavior = "smooth"
) {
	if (typeof window === "undefined" || !hash.startsWith("#")) return;

	const id = hash.slice(1);
	const element = document.getElementById(id);
	if (!element) return;

	element.scrollIntoView({ behavior, block: "start" });
}
