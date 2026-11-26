"use client";

import Link from "next/link";
import { useState } from "react";

import type { PoeticWork, PoeticWorkKind } from "../../data/poeticJustice";

type WorkSummary = Pick<PoeticWork, "kind" | "title" | "blurb" | "language"> & {
	href: string;
	kindLabel: string;
};

const filters = [
	{ id: "all", label: "All" },
	{ id: "poem", label: "Poems" },
	{ id: "rap", label: "Rap" }
] as const;

export default function PoeticWorksList({ works }: { works: WorkSummary[] }) {
	const [activeKind, setActiveKind] = useState<PoeticWorkKind | "all">("all");
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
						onClick={() => setActiveKind(filter.id)}
					>
						{filter.label}
					</button>
				))}
			</div>

			{visible.length === 0 ? (
				<p role="status" className="poetic-justice__empty">
					Nothing in this shelf yet.
				</p>
			) : (
				<ul className="poetic-justice__list">
					{visible.map(work => (
						<li
							key={work.href}
							className="poetic-justice__list-item"
						>
							<Link
								href={work.href}
								className="poetic-justice__list-link focus-ring"
							>
								<span className="poetic-justice__list-title">
									{work.title}
								</span>
								<span className="poetic-justice__list-kind">
									{work.kindLabel}
								</span>
								<span
									className="poetic-justice__list-blurb"
									lang={work.language}
								>
									{work.blurb}
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
