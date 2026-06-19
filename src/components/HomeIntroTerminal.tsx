import TransitionLink from "./TransitionLink";
import Spotify from "./Spotify";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { copypastas } from "../data/copypastas";
import { COPYPASTA_LAST_ID_KEY, pickCopypasta } from "../lib/copypasta";
import { cowsay, getCowsayMaxWidth } from "../lib/cowsay";
import { EE_DOMAIN_REGISTER_URL, EIF_URL, VOCO_AASTA_TEGIJA_2020_URL } from "../lib/site";
import {
	buildSshTranscript,
	FALLBACK_VISITOR_IP,
	formatSshLastLogin,
	type TranscriptLine
} from "../lib/sshTranscript";

const SSR_COPYPASTA = copypastas[0];
const SESSION_PROMPT = "guest@nigol.ee:~$";
const CHAR_MS = 14;
const LINE_GAP_MS = 24;
const MUTED_LINE_MS = 18;

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

function useVisitorTranscript() {
	const [lines, setLines] = useState<TranscriptLine[] | null>(null);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			let ip = FALLBACK_VISITOR_IP;

			try {
				const response = await fetch("/api/visitor");
				if (response.ok) {
					const data = (await response.json()) as { ip?: string | null };
					if (data.ip) ip = data.ip;
				}
			} catch {
				// Use documentation fallback IP.
			}

			if (cancelled) return;

			const lastLogin = formatSshLastLogin(new Date(), ip);
			setLines(buildSshTranscript(lastLogin));
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	return lines;
}

function useSshTranscriptAnimation(lines: TranscriptLine[] | null) {
	const completeCount = lines?.length ?? 0;
	const [progress, setProgress] = useState<TranscriptProgress>({
		lineIndex: -1,
		charCount: 0
	});
	const [transcriptComplete, setTranscriptComplete] = useState(false);
	const runId = useRef(0);

	useEffect(() => {
		if (!lines?.length) return;

		if (prefersReducedMotion()) {
			setProgress({
				lineIndex: completeCount - 1,
				charCount: Infinity
			});
			setTranscriptComplete(true);
			return;
		}

		const id = ++runId.current;
		let cancelled = false;

		setProgress({ lineIndex: -1, charCount: 0 });
		setTranscriptComplete(false);

		(async () => {
			for (let lineIndex = 0; lineIndex < completeCount; lineIndex++) {
				if (cancelled || id !== runId.current) return;

				const line = lines[lineIndex];

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
				setTranscriptComplete(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [lines, completeCount]);

	return { progress, transcriptComplete };
}

export function HomeIntroTerminal() {
	const bodyRef = useRef<HTMLDivElement>(null);
	const [copypastaParagraphs, setCopypastaParagraphs] = useState(
		() => SSR_COPYPASTA.paragraphs
	);
	const [cowsayWidth, setCowsayWidth] = useState(40);
	const sshTranscript = useVisitorTranscript();
	const { progress, transcriptComplete } =
		useSshTranscriptAnimation(sshTranscript);

	useLayoutEffect(() => {
		const body = bodyRef.current;
		if (!body) return;

		const lastId = sessionStorage.getItem(COPYPASTA_LAST_ID_KEY);
		const picked = pickCopypasta(copypastas, lastId);
		sessionStorage.setItem(COPYPASTA_LAST_ID_KEY, picked.id);

		setCopypastaParagraphs(picked.paragraphs);
		setCowsayWidth(getCowsayMaxWidth(body));

		const observer = new ResizeObserver(() => {
			setCowsayWidth(getCowsayMaxWidth(body));
		});
		observer.observe(body);

		return () => observer.disconnect();
	}, []);

	const cowsayArt = cowsay(copypastaParagraphs.join("\n\n"), cowsayWidth);

	return (
		<section className="home-terminal" aria-label="Introduction">
			<div className="home-terminal__chrome">
				<div className="home-terminal__dots" aria-hidden>
					<span />
					<span />
					<span />
				</div>
				<p className="home-terminal__title">guest@nigol.ee — ssh</p>
			</div>

			<div ref={bodyRef} className="home-terminal__body">
				<div className="home-terminal__ssh-transcript">
					{(sshTranscript ?? []).map((line, index) => {
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

				<div
					className={
						transcriptComplete
							? "home-terminal__session"
							: "home-terminal__session home-terminal__session--pending"
					}
				>
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
						<Spotify variant="terminal" showArtwork />
					</TerminalCommand>

					<TerminalCommand command="cowsay < copypasta.txt">
						<blockquote className="home-terminal__cowsay" cite="">
							<pre aria-hidden suppressHydrationWarning>
								{cowsayArt}
							</pre>
							<span className="sr-only">
								{copypastaParagraphs.join("\n\n")}
							</span>
						</blockquote>
					</TerminalCommand>

					<p className="home-terminal__line home-terminal__line--idle">
						<span className="home-terminal__prompt" aria-hidden>
							{SESSION_PROMPT}
						</span>{" "}
						<span className="home-terminal__cursor" aria-hidden />
					</p>
				</div>
			</div>
		</section>
	);
}
