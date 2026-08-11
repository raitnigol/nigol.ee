import dynamic from "next/dynamic";
import TransitionLink from "./TransitionLink";
import Spotify from "./Spotify";
import { useEffect, useRef, useState } from "preact/hooks";
import type { Ref } from "preact";

import {
	hasSeenHomeTerminalIntro,
	markHomeTerminalIntroSeen
} from "../lib/homeTerminal";
import { EE_DOMAIN_REGISTER_URL, EIF_URL, VOCO_AASTA_TEGIJA_2020_URL } from "../lib/site";
import {
	buildSshTranscript,
	FALLBACK_VISITOR_IP,
	formatSshLastLogin,
	SSH_TRANSCRIPT_STATIC,
	type TranscriptLine
} from "../lib/sshTranscript";

const CowsayTerminal = dynamic(
	() => import("./CowsayTerminal").then(module => module.CowsayTerminal),
	{
		ssr: false,
		loading: () => <CowsayTerminalPlaceholder />
	}
);

const SESSION_PROMPT = "guest@nigol.ee:~$";
const CHAR_MS = 14;
const LINE_GAP_MS = 24;
const MUTED_LINE_MS = 18;
const SSH_LINE_COUNT = SSH_TRANSCRIPT_STATIC.length + 1;

type TranscriptProgress = {
	lineIndex: number;
	charCount: number;
};

function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;

	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sleep(ms: number) {
	return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function TerminalWindow({
	title,
	ariaLabel,
	bodyRef,
	children
}: {
	title: string;
	ariaLabel: string;
	bodyRef?: Ref<HTMLDivElement>;
	children: React.ReactNode;
}) {
	return (
		<section className="home-terminal" aria-label={ariaLabel}>
			<div className="home-terminal__chrome">
				<div className="home-terminal__dots" aria-hidden>
					<span />
					<span />
					<span />
				</div>
				<p className="home-terminal__title">{title}</p>
			</div>
			<div ref={bodyRef} className="home-terminal__body">
				{children}
			</div>
		</section>
	);
}

function TranscriptLineView({
	line,
	displayText
}: {
	line: TranscriptLine;
	displayText: string;
}) {
	const className = line.muted
		? "home-terminal__line home-terminal__line--muted"
		: "home-terminal__line";

	return (
		<p className={className}>
			{line.prompt ? (
				<>
					<span className="home-terminal__prompt home-terminal__prompt--local" aria-hidden>
						{line.prompt}
					</span>{" "}
				</>
			) : null}
			{displayText}
		</p>
	);
}

function TerminalCommand({
	command,
	children
}: {
	command: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="home-terminal__block">
			<p className="home-terminal__line">
				<span className="home-terminal__prompt" aria-hidden>
					{SESSION_PROMPT}
				</span>{" "}
				<span className="home-terminal__cmd">{command}</span>
			</p>
			{children ? (
				<div className="home-terminal__output">{children}</div>
			) : null}
		</div>
	);
}

function IdlePrompt() {
	return (
		<p className="home-terminal__line home-terminal__line--idle">
			<span className="home-terminal__prompt" aria-hidden>
				{SESSION_PROMPT}
			</span>{" "}
			<span className="home-terminal__cursor" aria-hidden />
		</p>
	);
}

function CowsayTerminalPlaceholder() {
	return (
		<section
			className="home-terminal home-terminal--cowsay-pending"
			aria-hidden
		>
			<div className="home-terminal__chrome">
				<div className="home-terminal__dots">
					<span />
					<span />
					<span />
				</div>
				<p className="home-terminal__title">guest@nigol.ee — cowsay</p>
			</div>
			<div className="home-terminal__body home-terminal__body--cowsay-pending" />
		</section>
	);
}

/** Resolve visitor IP after idle so it never competes with first paint. */
function useVisitorIp() {
	const [ip, setIp] = useState(FALLBACK_VISITOR_IP);

	useEffect(() => {
		let cancelled = false;
		let idleId: number | undefined;
		let timeoutId: number | undefined;

		const loadIp = () => {
			if (cancelled) return;

			fetch("/api/visitor")
				.then(response => (response.ok ? response.json() : null))
				.then((data: { ip?: string | null } | null) => {
					if (!cancelled && data?.ip) setIp(data.ip);
				})
				.catch(() => {
					// Keep documentation fallback IP.
				});
		};

		if (typeof window.requestIdleCallback === "function") {
			idleId = window.requestIdleCallback(loadIp, { timeout: 5000 });
		} else {
			timeoutId = window.setTimeout(loadIp, 2000);
		}

		return () => {
			cancelled = true;
			if (idleId !== undefined) {
				window.cancelIdleCallback?.(idleId);
			}
			if (timeoutId !== undefined) {
				clearTimeout(timeoutId);
			}
		};
	}, []);

	return ip;
}

function useSshTranscriptLines(visitorIp: string) {
	const [loginAt] = useState(() => new Date());

	return buildSshTranscript(formatSshLastLogin(loginAt, visitorIp));
}

function useSshTranscriptAnimation(lines: TranscriptLine[]) {
	const [progress, setProgress] = useState<TranscriptProgress>(() =>
		prefersReducedMotion() || hasSeenHomeTerminalIntro()
			? { lineIndex: SSH_LINE_COUNT - 1, charCount: Infinity }
			: { lineIndex: -1, charCount: 0 }
	);
	const linesRef = useRef(lines);
	const runId = useRef(0);

	linesRef.current = lines;

	useEffect(() => {
		if (prefersReducedMotion() || hasSeenHomeTerminalIntro()) {
			setProgress({
				lineIndex: SSH_LINE_COUNT - 1,
				charCount: Infinity
			});
			markHomeTerminalIntroSeen();
			return;
		}

		const id = ++runId.current;
		let cancelled = false;

		setProgress({ lineIndex: -1, charCount: 0 });

		(async () => {
			for (let lineIndex = 0; lineIndex < SSH_LINE_COUNT; lineIndex++) {
				if (cancelled || id !== runId.current) return;

				const line = linesRef.current[lineIndex];
				if (!line) return;

				if (line.prompt) {
					for (
						let charCount = 0;
						charCount <= line.text.length;
						charCount++
					) {
						if (cancelled || id !== runId.current) return;
						setProgress({ lineIndex, charCount });
						if (charCount < line.text.length) {
							await sleep(CHAR_MS);
						}
					}
				} else {
					setProgress({ lineIndex, charCount: line.text.length });
					await sleep(line.delay ?? MUTED_LINE_MS);
				}

				if (cancelled || id !== runId.current) return;
				await sleep(LINE_GAP_MS);
			}

			if (!cancelled && id === runId.current) {
				markHomeTerminalIntroSeen();
			}
		})();

		return () => {
			cancelled = true;
		};
		// Once on mount — IP updates must not restart the typewriter.
	}, []);

	return progress;
}

export function HomeIntroTerminal() {
	const visitorIp = useVisitorIp();
	const sshTranscript = useSshTranscriptLines(visitorIp);
	const progress = useSshTranscriptAnimation(sshTranscript);

	return (
		<div className="home-terminals">
			<TerminalWindow
				title="guest@nigol.ee — ssh"
				ariaLabel="Introduction"
			>
				<div className="home-terminal__ssh-transcript">
					{sshTranscript.map((line, index) => {
						if (index > progress.lineIndex) return null;

						const isComplete = index < progress.lineIndex;
						const displayText = isComplete
							? line.text
							: line.text.slice(0, progress.charCount);

						return (
							<TranscriptLineView
								key={`ssh-line-${index}`}
								line={line}
								displayText={displayText}
							/>
						);
					})}
				</div>

				<div className="home-terminal__session">
					<TerminalCommand command="whoami">
						<p className="home-terminal__text">
							Hello! I am Rait Nigol, Chief Information Security Officer &
							System Administrator at{" "}
							<a
								href={EIF_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="home__link home__link--pro focus-ring"
							>
								Estonian Internet Foundation
							</a>
							. I helped the organization achieve ISO/IEC 27001:2022
							certification and currently maintain its standard-compliant
							Information Security Management System (ISMS).
						</p>
					</TerminalCommand>

					<TerminalCommand command="cat achievements.txt">
						<ul className="home-terminal__text home-terminal__list">
							<li>
								<a
									href={VOCO_AASTA_TEGIJA_2020_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="home__link home__link--pro focus-ring"
								>
									VOCO Aasta Tegija 2020
								</a>
								{" — 1st place in the IT Systems Specialist category."}
							</li>
							<li>
								VOCO Aasta Tegija 2021 — 2nd place in the IT Systems Specialist
								category.
							</li>
						</ul>
					</TerminalCommand>

					<TerminalCommand command="cat about.txt">
						<div className="home-terminal__text">
							<p>
								Co-founder, shareholder, and management board member of{" "}
								<span className="home__accent home__accent--pro">
									Tasub Jantida OÜ
								</span>
								.
							</p>
							<p>
								Gaming community{" "}
								<span className="home__accent home__accent--rose">
									middleman since 2016
								</span>
								{" — "}
								1000+ successful transactions, 50k €+ in volume.
							</p>
							<p>
								Founder of{" "}
								<TransitionLink href="/music">
									<a className="home__link home__link--pohhu focus-ring">
										$.pohhu¥
									</a>
								</TransitionLink>
								, a creative collective from Tartu.
							</p>
						</div>
					</TerminalCommand>

					<TerminalCommand command="cat dot-ee.txt">
						<p className="home-terminal__text">
							Still no <span className="home__ee">.ee</span> like this one?{" "}
							<a
								href={EE_DOMAIN_REGISTER_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="home__link home__link--pro focus-ring"
							>
								Register yours
							</a>
							.
						</p>
					</TerminalCommand>

					<TerminalCommand command="spotifyctl status">
						<Spotify showArtwork />
					</TerminalCommand>

					<IdlePrompt />
				</div>
			</TerminalWindow>

			<CowsayTerminal />
		</div>
	);
}
