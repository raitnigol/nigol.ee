import { Clock } from "../components/Clock";
import GenericMeta from "../components/GenericMeta";
import { HomeIntroTerminal } from "../components/HomeIntroTerminal";
import { SocialIconLink } from "../components/SocialIconLink";
import Spotify from "../components/Spotify";
import { socials } from "../data/socials";

export default function Home() {
	return (
		<>
			<GenericMeta
				title="nigol.ee"
				description="Rait Nigol — Chief Information Security Officer & System Administrator at Estonian Internet Foundation."
				path="/"
			/>

			<div className="home">
				<h1 className="sr-only">Rait Nigol</h1>
				<p className="home__greeting">&ldquo;Hello, friend.&rdquo;</p>

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
