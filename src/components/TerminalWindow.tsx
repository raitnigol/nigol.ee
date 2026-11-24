"use client";

import {
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	CommandLineIcon
} from "@heroicons/react/24/outline";
import {
	useEffect,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode
} from "react";

export function TerminalWindow({ children }: { children: ReactNode }) {
	const frame = useRef<HTMLElement>(null);
	const toggle = useRef<HTMLButtonElement>(null);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		let nativeFullscreen = false;
		const sync = () => {
			if (document.fullscreenElement === frame.current) {
				nativeFullscreen = true;
				setExpanded(true);
			} else if (nativeFullscreen) {
				nativeFullscreen = false;
				setExpanded(false);
				toggle.current?.focus({ preventScroll: true });
			}
		};
		document.addEventListener("fullscreenchange", sync);
		return () => document.removeEventListener("fullscreenchange", sync);
	}, []);

	useEffect(() => {
		if (!expanded) return;
		const siblings: HTMLElement[] = [];
		let current = frame.current;
		while (current && current !== document.body && current.parentElement) {
			for (const sibling of current.parentElement.children) {
				if (
					sibling !== current &&
					sibling instanceof HTMLElement &&
					!sibling.hasAttribute("inert")
				) {
					sibling.setAttribute("inert", "");
					siblings.push(sibling);
				}
			}
			current = current.parentElement;
		}
		toggle.current?.focus({ preventScroll: true });
		return () => {
			for (const sibling of siblings) sibling.removeAttribute("inert");
		};
	}, [expanded]);

	async function toggleFullscreen() {
		const terminal = frame.current;
		if (!terminal) return;
		if (expanded) {
			if (document.fullscreenElement === terminal) {
				await document.exitFullscreen().catch(() => undefined);
				if (document.fullscreenElement === terminal) return;
			}
			setExpanded(false);
			toggle.current?.focus({ preventScroll: true });
		} else {
			if (document.fullscreenEnabled && terminal.requestFullscreen) {
				try {
					await terminal.requestFullscreen();
					return;
				} catch {
					// Embedded previews may deny fullscreen even with the API enabled.
				}
			}
			if (frame.current === terminal) setExpanded(true);
		}
	}

	function handleExpandedKeys(event: KeyboardEvent<HTMLElement>) {
		if (!expanded || event.defaultPrevented) return;
		if (event.key === "Escape") {
			event.preventDefault();
			void toggleFullscreen();
		} else if (event.key === "Tab") {
			const controls = event.currentTarget.querySelectorAll<HTMLElement>(
				'a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]'
			);
			const first = controls[0];
			const last = controls[controls.length - 1];
			const next = event.shiftKey ? last : first;
			if (next && event.target === (event.shiftKey ? first : last)) {
				event.preventDefault();
				next.focus({ preventScroll: true });
			}
		}
	}

	return (
		<section
			ref={frame}
			className="home-terminal"
			data-expanded={expanded || undefined}
			role={expanded ? "dialog" : undefined}
			aria-modal={expanded || undefined}
			onKeyDown={handleExpandedKeys}
			aria-label="Visitor terminal"
		>
			<div className="home-terminal__chrome">
				<p className="home-terminal__title">
					<CommandLineIcon
						width={19}
						height={19}
						aria-hidden="true"
					/>
					guest@nigol.ee{" "}
					<span className="home-terminal__path">~</span>
				</p>
				<button
					ref={toggle}
					className="home-terminal__expand"
					type="button"
					onClick={toggleFullscreen}
					aria-label={
						expanded ? "Exit fullscreen" : "Enter fullscreen"
					}
					title={expanded ? "Exit fullscreen" : "Enter fullscreen"}
				>
					{expanded ? (
						<ArrowsPointingInIcon width={18} height={18} />
					) : (
						<ArrowsPointingOutIcon width={18} height={18} />
					)}
				</button>
			</div>
			<div className="home-terminal__body">{children}</div>
		</section>
	);
}

export function TerminalCommand({
	command,
	children
}: {
	command: string;
	children: ReactNode;
}) {
	return (
		<div className="home-terminal__block">
			<p className="home-terminal__line">
				<span className="home-terminal__prompt" aria-hidden>
					guest@nigol.ee:~$
				</span>{" "}
				<span className="home-terminal__cmd">{command}</span>
			</p>
			<div className="home-terminal__output">{children}</div>
		</div>
	);
}
