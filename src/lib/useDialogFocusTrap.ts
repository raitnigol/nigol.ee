import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogFocusTrap(open: boolean): RefObject<HTMLDivElement> {
	const dialogRef = useRef<HTMLDivElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!open) return;

		returnFocusRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const focusFrame = requestAnimationFrame(() => {
			dialogRef.current
				?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
				?.focus();
		});

		const trapFocus = (event: KeyboardEvent) => {
			if (event.key !== "Tab") return;

			const focusable = Array.from(
				dialogRef.current?.querySelectorAll<HTMLElement>(
					FOCUSABLE_SELECTOR
				) ?? []
			).filter(element => !element.hasAttribute("disabled"));
			const first = focusable[0];
			const last = focusable.at(-1);
			if (!first || !last) return;

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		window.addEventListener("keydown", trapFocus);

		return () => {
			cancelAnimationFrame(focusFrame);
			window.removeEventListener("keydown", trapFocus);
			document.body.style.overflow = previousOverflow;
			returnFocusRef.current?.focus();
			returnFocusRef.current = null;
		};
	}, [open]);

	return dialogRef;
}
