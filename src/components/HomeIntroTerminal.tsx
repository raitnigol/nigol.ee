import { IntentLink } from "./IntentLink";

import { copypastas } from "../data/copypastas";
import {
	EE_DOMAIN_REGISTER_URL,
	EIF_URL,
	VOCO_AASTA_TEGIJA_2020_URL
} from "../lib/site";
import { CowsayTerminal } from "./CowsayTerminal";
import Spotify from "./Spotify";
import { SshTranscript } from "./SshTranscript";
import { IdlePrompt, TerminalCommand, TerminalWindow } from "./TerminalWindow";

export function HomeIntroTerminal() {
	return (
		<div className="home-terminals">
			<TerminalWindow
				title="guest@nigol.ee — ssh"
				ariaLabel="Introduction"
			>
				<SshTranscript />

				<div className="home-terminal__session">
					<TerminalCommand command="whoami">
						<p className="home-terminal__text">
							Hello! I am Rait Nigol, Chief Information Security
							Officer & System Administrator at{" "}
							<a
								href={EIF_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="home__link home__link--pro focus-ring"
							>
								Estonian Internet Foundation
							</a>
							. I helped the organization achieve ISO/IEC
							27001:2022 certification and currently maintain its
							standard-compliant Information Security Management
							System (ISMS).
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
								{
									" — 1st place in the IT Systems Specialist category."
								}
							</li>
							<li>
								VOCO Aasta Tegija 2021 — 2nd place in the IT
								Systems Specialist category.
							</li>
						</ul>
					</TerminalCommand>

					<TerminalCommand command="cat about.txt">
						<div className="home-terminal__text">
							<p>
								Co-founder, shareholder, and management board
								member of{" "}
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
								<IntentLink
									href="/music"
									className="home__link home__link--pohhu pohhu-wordmark pohhu-wordmark--inline focus-ring"
								>
									$.pohhu¥
								</IntentLink>
								, a creative collective from Tartu.
							</p>
						</div>
					</TerminalCommand>

					<TerminalCommand command="cat dot-ee.txt">
						<p className="home-terminal__text">
							Still no <span className="home__ee">.ee</span> like
							this one?{" "}
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

			<TerminalWindow title="guest@nigol.ee — cowsay" ariaLabel="Cowsay">
				<TerminalCommand command="cowsay &lt; copypasta.txt">
					<CowsayTerminal initial={copypastas[0].paragraphs} />
				</TerminalCommand>
				<IdlePrompt />
			</TerminalWindow>
		</div>
	);
}
