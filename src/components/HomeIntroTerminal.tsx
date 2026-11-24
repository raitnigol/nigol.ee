import Link from "next/link";

import { copypastas } from "../data/copypastas";
import {
	EE_DOMAIN_REGISTER_URL,
	EIF_URL,
	VOCO_AASTA_TEGIJA_2020_URL
} from "../lib/site";
import { CowsayTerminal } from "./CowsayTerminal";
import Spotify from "./Spotify";
import { TerminalCommand, TerminalWindow } from "./TerminalWindow";
import { VisitorShell } from "./VisitorShell";

const panels = {
	bio: (
		<p className="home-terminal__text">
			Hello! I am Rait Nigol, Chief Information Security Officer & System
			Administrator at{" "}
			<a
				href={EIF_URL}
				target="_blank"
				rel="noopener noreferrer"
				className="home__link home__link--pro focus-ring"
			>
				Estonian Internet Foundation
			</a>
			. I helped the organization achieve ISO/IEC 27001:2022 certification
			and currently maintain its standard-compliant Information Security
			Management System (ISMS).
		</p>
	),
	about: (
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
				<Link
					href="/music"
					className="home__link home__link--pohhu pohhu-wordmark pohhu-wordmark--inline focus-ring"
				>
					$.pohhu¥
				</Link>
				, a creative collective from Tartu.
			</p>
		</div>
	),
	achievements: (
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
	),
	domain: (
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
	),
	spotify: <Spotify showArtwork />,
	copypasta: <CowsayTerminal initial={copypastas[0].paragraphs} plain />,
	cowFile: <CowsayTerminal initial={copypastas[0].paragraphs} />
};

export function HomeIntroTerminal() {
	return (
		<div className="home-terminals">
			<TerminalWindow>
				<VisitorShell panels={panels}>
					<TerminalCommand command="cat bio.txt">
						{panels.bio}
					</TerminalCommand>
				</VisitorShell>
				<noscript>
					<style>
						{
							".home-terminal__expand,.visitor-shell__controls{display:none!important}"
						}
					</style>
					<details className="home-terminal__fallback">
						<summary>Profile files</summary>
						<TerminalCommand command="cat about.txt">
							{panels.about}
						</TerminalCommand>
						<TerminalCommand command="cat achievements.txt">
							{panels.achievements}
						</TerminalCommand>
						<TerminalCommand command="cat dot-ee.txt">
							{panels.domain}
						</TerminalCommand>
					</details>
				</noscript>
			</TerminalWindow>
		</div>
	);
}
