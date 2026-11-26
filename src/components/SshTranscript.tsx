"use client";

import { useEffect, useRef, useState } from "react";

import {
	hasSeenHomeTerminalIntro,
	markHomeTerminalIntroSeen
} from "../lib/homeTerminal";
import { formatSshLastLogin, SSH_LOGIN_BANNER } from "../lib/sshTranscript";

export function SshTranscript() {
	const command = useRef<HTMLSpanElement>(null);
	const output = useRef<HTMLDivElement>(null);
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

		const banner = output.current;
		if (!banner) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();
				void loadVisitor();
			},
			{ rootMargin: "400px" }
		);
		observer.observe(banner);
		return () => {
			observer.disconnect();
			controller.abort();
		};
	}, []);

	return (
		<div className="home-terminal__ssh-transcript">
			<p className="home-terminal__line">
				<span
					className="home-terminal__prompt home-terminal__prompt--local"
					aria-hidden
				>
					{"$ "}
				</span>
				<span ref={command} className="home-terminal__ssh-command">
					ssh guest@nigol.ee
				</span>
			</p>
			<div ref={output} className="home-terminal__ssh-output">
				{SSH_LOGIN_BANNER.map(line => (
					<p
						key={line}
						className="home-terminal__line home-terminal__line--muted"
					>
						{line}
					</p>
				))}
				<p className="home-terminal__line home-terminal__line--muted">
					{lastLogin}
				</p>
			</div>
		</div>
	);
}
