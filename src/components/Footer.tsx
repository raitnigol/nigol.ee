const SITE_SOURCE_URL = "https://github.com/raitnigol/nigol.ee";

function BuildBadge() {
	const sha = process.env.NEXT_PUBLIC_COMMIT_SHA;
	if (!sha) return null;

	const short = sha.slice(0, 7);
	const href = `${SITE_SOURCE_URL}/commit/${sha}`;

	return (
		<>
			<span className="site-footer__sep" aria-hidden>
				·
			</span>
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="site-footer__source focus-ring"
				title={`Build ${sha}`}
			>
				{short}
			</a>
		</>
	);
}

export default function Footer() {
	return (
		<footer className="site-footer">
			<p className="site-footer__copy">
				© 2026 · Nigol Enterprises /{" "}
				<span className="text-violet-400">$.pohhu¥</span>
				<span className="site-footer__sep" aria-hidden>
					·
				</span>
				<a
					href={SITE_SOURCE_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="site-footer__source focus-ring"
				>
					Source code
				</a>
				<BuildBadge />
			</p>

			<div className="site-footer__badges" aria-label="Buttons">
				<img
					src="/images/badges/free-palestine.gif"
					alt="Free Palestine"
					width={88}
					height={31}
					className="site-footer__badge"
					decoding="async"
				/>
				<img
					src="/images/badges/slava-ukraini.gif"
					alt="Slava Ukraini"
					width={88}
					height={31}
					className="site-footer__badge"
					decoding="async"
				/>
			</div>
		</footer>
	);
}
