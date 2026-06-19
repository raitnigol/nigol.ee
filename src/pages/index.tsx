import { Clock } from "../components/Clock";
import GenericMeta from "../components/GenericMeta";
import { HomeIntroTerminal } from "../components/HomeIntroTerminal";
import { SocialIconLink } from "../components/SocialIconLink";
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
				<blockquote className="home__greeting">
					<p>
						&ldquo;Control can sometimes be an illusion, but sometimes you need
						illusion to gain control. Fantasy is an easy way to give meaning to
						the world, to cloak our harsh reality in escapist comfort. After
						all, isn&rsquo;t that why we surround ourselves with so many screens?
						So we can avoid seeing? So we can avoid each other? So we can avoid
						truth.&rdquo;
					</p>
					<footer>&mdash; Elliot Alderson</footer>
				</blockquote>

				<HomeIntroTerminal />

				<div className="home__meta">
					<div className="home__meta-primary">
						<div className="home__socials">
							{socials.map(({ name, image, url }) => (
								<SocialIconLink
									key={name}
									href={url}
									image={image}
									label={name}
									size="lg"
								/>
							))}
						</div>
						<blockquote className="home__verse">
							<p>
								Tell your mother you love her
								<br />
								while her voice is still close enough to answer.
							</p>
							<p>
								She gave you more than she had,
								<br />
								carried you through days you were too young to understand,
								<br />
								and looked at you
								<br />
								with the quiet grace of someone
								<br />
								who had already suffered,
								<br />
								yet still chose love.
							</p>
							<p>
								Because one day, without warning,
								<br />
								you may search for those eyes
								<br />
								and find only the memory of them looking back.
							</p>
							<p>
								And when she is no longer here to hold you,
								<br />
								may you feel her still &mdash;
								<br />
								somewhere beyond the clouds,
								<br />
								watching over the life
								<br />
								she gave everything to protect.
							</p>
						</blockquote>
					</div>
					<p className="home__clock">
						<Clock />
					</p>
				</div>
			</div>
		</>
	);
}
