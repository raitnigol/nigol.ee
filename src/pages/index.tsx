import Link from "next/link";

import { Clock } from "../components/Clock";
import { CopypastaBlock } from "../components/CopypastaBlock";
import GenericMeta from "../components/GenericMeta";
import { SocialIconLink } from "../components/SocialIconLink";
import Spotify from "../components/Spotify";
import { socials } from "../data/socials";
import { EIF_URL } from "../lib/site";

const EE_DOMAIN_REGISTER_URL =
	"https://www.internet.ee/domains/how-to-register-a-ee-domain-name";

export default function Home() {
	return (
		<>
			<GenericMeta
				title="nigol.ee"
				description="Rait Nigol — Chief Information Security Officer & System Administrator at Estonian Internet Foundation."
				path="/"
			/>

			<p className="mb-3 font-mono text-sm tracking-wide text-gray-500 md:text-base">
				&ldquo;Hello, friend.&rdquo;
			</p>

			<h1 className="heading mb-2">nigol.ee</h1>

			<p className="mb-3">
				<span className="text-rose-400">Chief Information Security Officer</span>
				{" & "}
				<span className="text-blue-400">System Administrator</span> at{" "}
				<a
					href={EIF_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-400 border-b border-blue-400/30 hover:border-blue-300 transition-colors"
				>
					Estonian Internet Foundation
				</a>
				.
			</p>

			<p className="mb-3 text-gray-300">
				Co-founder, shareholder, and member of the management board of{" "}
				<span className="text-blue-400">Tasub Jantida OÜ</span>.
			</p>

			<p className="mb-4 text-gray-300">
				You still do not have a <span className="text-rose-400">.ee</span> domain?{" "}
				<a
					href={EE_DOMAIN_REGISTER_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-400 underline underline-offset-2 decoration-blue-400/40 hover:text-blue-300 hover:decoration-blue-300 transition-colors"
				>
					Register one here
				</a>
				.
			</p>

			<p className="mb-4">
				I have been part of multiple gaming communities and have acted as a{" "}
				<span className="text-rose-400">middleman since 2016</span>, overseeing and
				facilitating more than{" "}
				<span className="text-rose-400">1000 successful transactions</span> with a
				value of more than 50 000 €.
			</p>

			<p className="mb-4 text-gray-300">
				I also run{" "}
				<Link
					href="/music#pohhu-heading"
					className="focus-ring text-violet-400 border-b border-violet-400/30 hover:border-violet-300 transition-colors"
				>
					$.pohhu¥
				</Link>
				, a creative collective from Tartu.
			</p>

			<p className="mb-2 flex flex-wrap gap-2 items-center">
				{socials.map(({ name, image, url }) => (
					<SocialIconLink
						key={name}
						href={url}
						image={image}
						label={name}
					/>
				))}
			</p>

			<p className="mb-4 text-base text-gray-300">
				<Clock />
			</p>

			<hr className="mb-4 bg-slate-800 border-none h-0.5" />

			<div className="mb-8">
				<Spotify />
			</div>

			<CopypastaBlock />
		</>
	);
}
