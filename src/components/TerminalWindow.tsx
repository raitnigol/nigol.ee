import type { ReactNode } from "react";

const SESSION_PROMPT = "guest@nigol.ee:~$";

export function TerminalWindow({
	title,
	ariaLabel,
	children
}: {
	title: string;
	ariaLabel: string;
	children: ReactNode;
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
			<div className="home-terminal__body">{children}</div>
		</section>
	);
}

export function TerminalCommand({
	command,
	children
}: {
	command: string;
	children?: ReactNode;
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

export function IdlePrompt() {
	return (
		<p className="home-terminal__line home-terminal__line--idle">
			<span className="home-terminal__prompt" aria-hidden>
				{SESSION_PROMPT}
			</span>{" "}
			<span className="home-terminal__cursor" aria-hidden />
		</p>
	);
}
