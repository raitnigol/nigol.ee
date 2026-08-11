import TransitionLink from "./TransitionLink";

import {
	formatPoeticKind,
	type PoeticWork,
	type PoeticWorkKind
} from "../data/poeticJustice";

export const CC_BY_URL = "https://creativecommons.org/licenses/by/4.0/";

export function PoeticJusticeLicenseNote({ compact = false }: { compact?: boolean }) {
	if (compact) {
		return (
			<p className="poetic-justice__license poetic-justice__license--compact">
				Free to share and adapt under{" "}
				<a
					href={CC_BY_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="poetic-justice__license-link focus-ring"
				>
					CC BY 4.0
				</a>
				{" "}
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
				rel="noopener noreferrer"
				className="poetic-justice__license-link focus-ring"
			>
				CC BY 4.0
			</a>
			{" "}
			— please credit nigol.ee or Rait Nigol when you reuse. Skip the credit and
			I&apos;d call you a pussy, but it&apos;s one love fam — I can live with it.
			If your conscience sleeps fine without the name, that&apos;s your mess; I
			can&apos;t clean a miserable soul for you.
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
				Here is a collection of poems and rap lyrics I write and put out into
				the world as a coping mechanism instead of doing something harmful to
				my body or soul. Everything is open to read, share, and adapt under{" "}
				<a
					href={CC_BY_URL}
					target="_blank"
					rel="noopener noreferrer"
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

export function PoeticWorksList({
	works,
	activeKind,
	onKindChange
}: {
	works: PoeticWork[];
	activeKind: PoeticWorkKind | "all";
	onKindChange: (kind: PoeticWorkKind | "all") => void;
}) {
	const filters: Array<{ id: PoeticWorkKind | "all"; label: string }> = [
		{ id: "all", label: "All" },
		{ id: "poem", label: "Poems" },
		{ id: "rap", label: "Rap" }
	];

	const visible =
		activeKind === "all"
			? works
			: works.filter(work => work.kind === activeKind);

	return (
		<div className="poetic-justice__list-block">
			<div
				className="poetic-justice__filters"
				role="group"
				aria-label="Filter by kind"
			>
				{filters.map(filter => (
					<button
						key={filter.id}
						type="button"
						className={
							activeKind === filter.id
								? "poetic-justice__filter poetic-justice__filter--active focus-ring"
								: "poetic-justice__filter focus-ring"
						}
						aria-pressed={activeKind === filter.id}
						onClick={() => onKindChange(filter.id)}
					>
						{filter.label}
					</button>
				))}
			</div>

			{visible.length === 0 ? (
				<p className="poetic-justice__empty">Nothing in this shelf yet.</p>
			) : (
				<ul className="poetic-justice__list">
					{visible.map(work => (
						<li key={work.id} className="poetic-justice__list-item">
							<TransitionLink href={`/poetic-justice/${work.id}`}>
								<a className="poetic-justice__list-link focus-ring">
									<span className="poetic-justice__list-title">
										{work.title}
									</span>
									<span className="poetic-justice__list-kind">
										{formatPoeticKind(work.kind)}
									</span>
									<span className="poetic-justice__list-blurb">
										{work.blurb}
									</span>
								</a>
							</TransitionLink>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function PoeticWorkReading({ work }: { work: PoeticWork }) {
	return (
		<article className="poetic-justice__piece">
			<p className="poetic-justice__back">
				<TransitionLink href="/poetic-justice">
					<a className="poetic-justice__back-link focus-ring">
						← Poetic Justice
					</a>
				</TransitionLink>
			</p>

			<header className="poetic-justice__piece-header">
				<h1 className="poetic-justice__piece-title">{work.title}</h1>
				<PoeticWorkMeta work={work} />
			</header>

			{work.body.trim() ? (
				<div className="poetic-justice__body">{work.body}</div>
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
