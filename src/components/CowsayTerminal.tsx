import { useLayoutEffect, useRef, useState } from "preact/hooks";
import type { Ref } from "preact";

import { copypastas } from "../data/copypastas";
import { COPYPASTA_LAST_ID_KEY, pickCopypasta } from "../lib/copypasta";
import { cowsay, getCowsayMaxWidth } from "../lib/cowsay";

const SSR_COPYPASTA = copypastas[0];
const SESSION_PROMPT = "guest@nigol.ee:~$";

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

export function CowsayTerminal() {
	const bodyRef = useRef<HTMLDivElement>(null);
	const [copypastaParagraphs, setCopypastaParagraphs] = useState(
		() => SSR_COPYPASTA.paragraphs
	);
	const [cowsayWidth, setCowsayWidth] = useState(40);

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
		<TerminalWindow
			title="guest@nigol.ee — cowsay"
			ariaLabel="Cowsay"
			bodyRef={bodyRef}
		>
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
			<IdlePrompt />
		</TerminalWindow>
	);
}
