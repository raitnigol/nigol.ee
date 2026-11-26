import Link from "next/link";

import { formatPoeticKind, type PoeticWork } from "../data/poeticJustice";

export const CC_BY_URL = "https://creativecommons.org/licenses/by/4.0/";

export function PoeticJusticeLicenseNote({
	compact = false
}: {
	compact?: boolean;
}) {
	if (compact) {
		return (
			<p className="poetic-justice__license poetic-justice__license--compact">
				Free to share and adapt under{" "}
				<a
					href={CC_BY_URL}
					target="_blank"
					rel="license noopener noreferrer"
					className="poetic-justice__license-link focus-ring"
				>
					CC BY 4.0
				</a>{" "}
				— please credit nigol.ee or Rait Nigol when you reuse.
			</p>
		);
	}

	return (
		<p className="poetic-justice__license">
			Free to share and adapt under{" "}
			<a
				href={CC_BY_URL}
				target="_blank"
				rel="license noopener noreferrer"
				className="poetic-justice__license-link focus-ring"
			>
				CC BY 4.0
			</a>{" "}
			— please credit nigol.ee or Rait Nigol when you reuse. Skip the
			credit and I&apos;d call you a pussy, but it&apos;s one love fam — I
			can live with it. If your conscience sleeps fine without the name,
			that&apos;s your mess; I can&apos;t clean a miserable soul for you.
		</p>
	);
}

export function PoeticJusticeIndexHeader() {
	return (
		<header className="poetic-justice__intro">
			<h1 className="poetic-justice__page-title">
				Poetic Justice
				<span className="poetic-justice__title-rule" aria-hidden />
			</h1>
			<p className="poetic-justice__lede">
				Here is a collection of poems and rap lyrics I write and put out
				into the world as a coping mechanism instead of doing something
				harmful to my body or soul. Everything is open to read, share,
				and adapt under{" "}
				<a
					href={CC_BY_URL}
					target="_blank"
					rel="license noopener noreferrer"
					className="poetic-justice__license-link focus-ring"
				>
					CC BY 4.0
				</a>
				. One love fam.
			</p>
			<PoeticJusticeLicenseNote />
		</header>
	);
}

export function PoeticWorkMeta({ work }: { work: PoeticWork }) {
	const parts = [
		formatPoeticKind(work.kind),
		work.language.toUpperCase(),
		work.year != null ? String(work.year) : null
	].filter(Boolean);

	return (
		<p className="poetic-justice__meta">
			{parts.map((part, index) => (
				<span key={part}>
					{index > 0 ? (
						<span className="poetic-justice__meta-sep" aria-hidden>
							·
						</span>
					) : null}
					{part}
				</span>
			))}
		</p>
	);
}

export function PoeticWorkReading({ work }: { work: PoeticWork }) {
	return (
		<article className="poetic-justice__piece">
			<p className="poetic-justice__back">
				<Link
					href="/poetic-justice"
					className="poetic-justice__back-link focus-ring"
				>
					← Poetic Justice
				</Link>
			</p>

			<header className="poetic-justice__piece-header">
				<h1 className="poetic-justice__piece-title">{work.title}</h1>
				<PoeticWorkMeta work={work} />
			</header>

			{work.body.trim() ? (
				<div className="poetic-justice__body" lang={work.language}>
					{work.body}
				</div>
			) : (
				<p className="poetic-justice__body poetic-justice__body--pending">
					Lyrics coming soon.
				</p>
			)}

			<footer className="poetic-justice__piece-footer">
				<PoeticJusticeLicenseNote compact />
			</footer>
		</article>
	);
}
