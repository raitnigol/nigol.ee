import TransitionLink from "./TransitionLink";
import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { copypastas } from "../data/copypastas";
import { COPYPASTA_LAST_ID_KEY, pickCopypasta } from "../lib/copypasta";
import { cowsay, getCowsayMaxWidth } from "../lib/cowsay";
import { EE_DOMAIN_REGISTER_URL, EIF_URL } from "../lib/site";

const SSR_COPYPASTA = copypastas[0];

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
					whoami:~$
				</span>{" "}
				<span className="home-terminal__cmd">{command}</span>
			</p>
			{children ? (
				<div className="home-terminal__output">{children}</div>
			) : null}
		</div>
	);
}

export function HomeIntroTerminal() {
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
		<section className="home-terminal" aria-label="Introduction">
			<div className="home-terminal__chrome">
				<div className="home-terminal__dots" aria-hidden>
					<span />
					<span />
					<span />
				</div>
				<p className="home-terminal__title">whoami — zsh</p>
			</div>

			<div ref={bodyRef} className="home-terminal__body">
				<TerminalCommand command="whoami">
					<p className="home-terminal__text">rait nigol</p>
				</TerminalCommand>

				<TerminalCommand command="cat role.txt">
					<p className="home-terminal__text">
						<span className="home__accent home__accent--rose">
							Chief Information Security Officer
						</span>
						{" & "}
						<span className="home__accent home__accent--pro">
							System Administrator
						</span>{" "}
						at{" "}
						<a
							href={EIF_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="home__link home__link--pro focus-ring"
						>
							Estonian Internet Foundation
						</a>
						.
					</p>
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
						whoami:~$
					</span>{" "}
					<span className="home-terminal__cursor" aria-hidden />
				</p>
			</div>
		</section>
	);
}
