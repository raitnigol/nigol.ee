import { Clock } from "../components/Clock";
import GenericMeta from "../components/GenericMeta";
import { HomeIntroTerminal } from "../components/HomeIntroTerminal";
import { SocialIconLink } from "../components/SocialIconLink";
import Spotify from "../components/Spotify";
import { socials } from "../data/socials";
import { EE_DOMAIN_REGISTER_URL } from "../lib/site";

export default function Home() {
	return (
		<>
			<GenericMeta
				title="nigol.ee"
				description="Rait Nigol — Chief Information Security Officer & System Administrator at Estonian Internet Foundation."
				path="/"
			/>

			<div className="home">
				<p className="home__greeting">&ldquo;Hello, friend.&rdquo;</p>

				<h1 className="heading home__title">
					nigol
					<a
						href={EE_DOMAIN_REGISTER_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="home__ee focus-ring"
						title="Register a .ee domain"
					>
						.ee
					</a>
				</h1>

				<HomeIntroTerminal />

				<div className="home__meta">
					<div className="home__socials">
						{socials.map(({ name, image, url }) => (
							<SocialIconLink
								key={name}
								href={url}
								image={image}
								label={name}
							/>
						))}
					</div>
					<p className="home__clock">
						<Clock />
					</p>
				</div>

				<section className="home__listening" aria-label="Now playing on Spotify">
					<h2 className="home__section-label">Listening</h2>
					<div className="home__listening-card">
						<Spotify />
					</div>
				</section>
			</div>
		</>
	);
}
