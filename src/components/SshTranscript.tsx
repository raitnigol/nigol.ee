"use client";

import { useEffect, useRef, useState } from "react";

import {
	hasSeenHomeTerminalIntro,
	markHomeTerminalIntroSeen
} from "../lib/homeTerminal";
import {
	formatSshLastLogin,
	SSH_TRANSCRIPT_STATIC
} from "../lib/sshTranscript";

export function SshTranscript() {
	const command = useRef<HTMLSpanElement>(null);
	const [lastLogin, setLastLogin] = useState("");

	useEffect(() => {
		if (!hasSeenHomeTerminalIntro()) {
			if (
				!window.matchMedia("(prefers-reduced-motion: reduce)").matches
			) {
				command.current?.animate(
					[
						{ clipPath: "inset(0 100% 0 0)" },
						{ clipPath: "inset(0)" }
					],
					{ duration: 320, easing: "steps(18)" }
				);
			}
			markHomeTerminalIntroSeen();
		}

		const loginAt = new Date();

		const controller = new AbortController();
		async function loadVisitor() {
			setLastLogin(formatSshLastLogin(loginAt));
			try {
				const response = await fetch("/api/visitor", {
					signal: controller.signal
				});
				if (!response.ok) return;
				const { ip } = await response.json();
				if (
					!controller.signal.aborted &&
					typeof ip === "string" &&
					ip
				) {
					setLastLogin(formatSshLastLogin(loginAt, ip));
				}
			} catch {
				// The local login timestamp remains visible if the lookup is unavailable.
			}
		}

		const idle = typeof window.requestIdleCallback === "function";
		const task = idle
			? window.requestIdleCallback(loadVisitor, { timeout: 5000 })
			: window.setTimeout(loadVisitor, 2000);

		return () => {
			controller.abort();
			if (idle) window.cancelIdleCallback(task);
			else window.clearTimeout(task);
		};
	}, []);

	return (
		<div className="home-terminal__ssh-transcript">
			{SSH_TRANSCRIPT_STATIC.map(line => (
				<p
					key={line.text}
					className={
						line.muted
							? "home-terminal__line home-terminal__line--muted"
							: "home-terminal__line"
					}
				>
					{line.prompt && (
						<span
							className="home-terminal__prompt home-terminal__prompt--local"
							aria-hidden
						>
							{line.prompt}{" "}
						</span>
					)}
					<span
						ref={line.prompt ? command : undefined}
						className={
							line.prompt
								? "home-terminal__ssh-command"
								: undefined
						}
					>
						{line.text}
					</span>
				</p>
			))}
			<p className="home-terminal__line home-terminal__line--muted">
				{lastLogin}
			</p>
		</div>
	);
}
