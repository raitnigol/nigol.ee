"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublishedRecord } from "../../lib/publishedRecord";
import { SpotifyListeningSection } from "../SpotifyListeningSection";
import { ListeningRoom } from "./ListeningRoom";
import { formatNames, RecordArt } from "./RecordArt";

const RecordDetail = dynamic(() =>
	import("./RecordDetail").then(module => module.RecordDetail)
);

type Format = "all" | PublishedRecord["format"];
type Sort = "shelf" | "artist" | "title" | "new" | "old";
const formats = ["all", "vinyl", "cd", "mixed"] as const;
const filterLabels = {
	all: "All",
	cd: "CDs",
	vinyl: "Vinyl",
	mixed: "Mixed sets"
};
const formatAnchors = { cd: "cds", vinyl: "vinyl", mixed: "mixed" };
const pageSize = 24;
const collator = new Intl.Collator("en", {
	sensitivity: "base",
	numeric: true
});

function Sleeve({
	record,
	priority,
	onOpen
}: {
	record: PublishedRecord;
	priority?: boolean;
	onOpen: (record: PublishedRecord) => void;
}) {
	return (
		<figure className="rr-sleeve" id={record.grail ? "grail" : undefined}>
			<div
				className={`rr-disc-art ${
					record.format === "cd" ? "rr-compact-disc" : ""
				}`}
				aria-hidden="true"
			>
				<i />
			</div>
			<button
				type="button"
				onClick={() => onOpen(record)}
				aria-label={`Explore ${record.title} by ${record.artist}`}
			>
				<RecordArt record={record} slot="hero" priority={priority} />
			</button>
			<figcaption>
				{record.grail && (
					<p className="rr-sleeve-note">
						The one that means the most.
					</p>
				)}
				<button type="button" onClick={() => onOpen(record)}>
					<strong>{record.title}</strong>
					<span>
						{record.artist} · {formatNames[record.format]}
					</span>
				</button>
			</figcaption>
		</figure>
	);
}

export function CollectionShowcase({
	records
}: {
	records: PublishedRecord[];
}) {
	const [format, setFormat] = useState<Format>("all");
	const [sort, setSort] = useState<Sort>("shelf");
	const [view, setView] = useState<"grid" | "list">("grid");
	const [query, setQuery] = useState("");
	const [limit, setLimit] = useState(pageSize);
	const [selected, setSelected] = useState<PublishedRecord>();
	const searchRef = useRef<HTMLInputElement>(null);
	const previousHash = useRef("");
	const favorite = records.find(record => record.grail);
	const feature =
		favorite ||
		records.find(record => record.featured) ||
		records.find(record => record.format === "vinyl") ||
		records[0];
	const counts = useMemo(
		() =>
			records.reduce<Record<Format, number>>(
				(total, record) => {
					total[record.format]++;
					return total;
				},
				{ all: records.length, vinyl: 0, cd: 0, mixed: 0 }
			),
		[records]
	);
	const filtered = useMemo(() => {
		const words = query
			.trim()
			.toLocaleLowerCase()
			.split(/\s+/)
			.filter(Boolean);
		const matches = records.filter(record => {
			if (format !== "all" && record.format !== format) return false;
			const haystack = `${record.artist} ${record.title} ${
				record.year || ""
			} ${record.label || ""} ${
				record.catalogNumber || ""
			}`.toLocaleLowerCase();
			return words.every(word => haystack.includes(word));
		});
		if (sort === "artist" || sort === "title")
			matches.sort(
				(a, b) =>
					collator.compare(a[sort], b[sort]) ||
					collator.compare(a.title, b.title)
			);
		if (sort === "new" || sort === "old")
			matches.sort((a, b) => {
				const aYear = Number(a.year);
				const bYear = Number(b.year);
				if (!aYear || !bYear)
					return Number(Boolean(bYear)) - Number(Boolean(aYear));
				return sort === "new" ? bYear - aYear : aYear - bYear;
			});
		return matches;
	}, [records, format, query, sort]);

	const openRecord = useCallback((record: PublishedRecord) => {
		previousHash.current = location.hash;
		history.replaceState(
			history.state,
			"",
			`#record=${encodeURIComponent(record.id)}`
		);
		setSelected(record);
	}, []);
	const closeRecord = useCallback(() => {
		if (location.hash.startsWith("#record=")) {
			history.replaceState(
				history.state,
				"",
				location.pathname + location.search + previousHash.current
			);
		}
		setSelected(undefined);
	}, []);
	const browseFormat = useCallback((value: Format) => {
		setFormat(value);
		setQuery("");
		setLimit(pageSize);
		document.getElementById("collection")?.scrollIntoView();
	}, []);
	useEffect(() => {
		function readHash() {
			const hash = location.hash;
			if (hash.startsWith("#record=")) {
				try {
					const id = decodeURIComponent(hash.slice(8));
					setSelected(
						records.find(
							record => record.id === id || record.copyId === id
						)
					);
				} catch {
					setSelected(undefined);
				}
				return;
			}
			setSelected(undefined);
			const legacy =
				hash === "#cds"
					? "cd"
					: hash === "#vinyl"
					? "vinyl"
					: hash === "#mixed"
					? "mixed"
					: null;
			if (legacy) browseFormat(legacy);
			if (hash === "#holy-grail")
				document.getElementById("grail")?.scrollIntoView();
		}
		readHash();
		window.addEventListener("hashchange", readHash);
		return () => window.removeEventListener("hashchange", readHash);
	}, [records, browseFormat]);
	useEffect(() => {
		function shortcut(event: KeyboardEvent) {
			if (
				event.key !== "/" ||
				selected ||
				event.defaultPrevented ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey
			)
				return;
			const element = event.target;
			if (
				element instanceof HTMLElement &&
				(element.isContentEditable ||
					/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName))
			)
				return;
			event.preventDefault();
			searchRef.current?.focus();
		}
		window.addEventListener("keydown", shortcut);
		return () => window.removeEventListener("keydown", shortcut);
	}, [selected]);

	function reset() {
		setQuery("");
		setFormat("all");
		setSort("shelf");
		setLimit(pageSize);
	}
	function pick(pool: PublishedRecord[]) {
		if (pool.length)
			openRecord(pool[Math.floor(Math.random() * pool.length)]);
	}
	const hasSpotify = records.some(record => record.spotifyUrl);
	return (
		<div className="rr-room" id="physical-media">
			<section className="rr-hero rr-section" aria-labelledby="rr-title">
				<div className="rr-hero-main">
					<div>
						<h1 id="rr-title">
							<span className="rr-signature pohhu-wordmark">$.pohhu¥</span> Media
							collection
						</h1>
						<p className="rr-inventory">
							<a href="#cds" onClick={() => browseFormat("cd")}>
								{counts.cd} {counts.cd === 1 ? "CD" : "CDs"}
							</a>
							<span aria-hidden="true"> · </span>
							<a
								href="#vinyl"
								onClick={() => browseFormat("vinyl")}
							>
								{counts.vinyl}{" "}
								{counts.vinyl === 1
									? "vinyl record"
									: "vinyl records"}
							</a>
							{counts.mixed > 0 && (
								<>
									<span aria-hidden="true"> · </span>
									<a
										href="#mixed"
										onClick={() => browseFormat("mixed")}
									>
										{counts.mixed}{" "}
										{counts.mixed === 1
											? "mixed set"
											: "mixed sets"}
									</a>
								</>
							)}
						</p>
						<nav
							aria-label="Collection sections"
							className="rr-index"
						>
							<a href="#collection">Browse records</a>
							{hasSpotify && (
								<a href="#listening">Listening room</a>
							)}
							<a href="#spotify-listening">Listening history</a>
						</nav>
					</div>
					{feature && (
						<Sleeve record={feature} onOpen={openRecord} priority />
					)}
				</div>
			</section>
			<section
				id="collection"
				className="rr-section"
				aria-labelledby="rr-catalogue-title"
			>
				<h2 id="rr-catalogue-title" className="rr-heading">
					The shelves
				</h2>
				<div className="rr-tools">
					<div
						className="rr-tab-group"
						role="group"
						aria-label="Filter by format"
					>
						{formats
							.filter(key => key !== "mixed" || counts.mixed > 0)
							.map(key => (
								<button
									type="button"
									key={key}
									id={
										key !== "all"
											? formatAnchors[key]
											: undefined
									}
									aria-pressed={format === key}
									onClick={() => {
										setFormat(key);
										setLimit(pageSize);
									}}
								>
									{filterLabels[key]}{" "}
									<span>{counts[key]}</span>
								</button>
							))}
					</div>
					<label className="rr-search">
						<span className="rr-sr">Find an artist or record</span>
						<input
							type="search"
							ref={searchRef}
							placeholder="Find an artist or record…"
							value={query}
							onChange={event => {
								setQuery(event.target.value);
								setLimit(pageSize);
							}}
						/>
					</label>
					<label>
						<span className="rr-sr">Sort collection</span>
						<select
							value={sort}
							onChange={event => {
								setSort(event.target.value as Sort);
								setLimit(pageSize);
							}}
						>
							<option value="shelf">Shelf order</option>
							<option value="artist">Artist A–Z</option>
							<option value="title">Title A–Z</option>
							<option value="new">Newest first</option>
							<option value="old">Oldest first</option>
						</select>
					</label>
					<div
						className="rr-tab-group rr-view-group"
						role="group"
						aria-label="Collection display"
					>
						{(["grid", "list"] as const).map(mode => (
							<button
								type="button"
								key={mode}
								aria-label={
									mode === "grid"
										? "Cover gallery"
										: "Compact index"
								}
								aria-pressed={view === mode}
								onClick={() => setView(mode)}
							>
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									width="18"
									height="18"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.7"
								>
									{mode === "grid" ? (
										<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />
									) : (
										<path d="M3 5h2m3 0h13M3 12h2m3 0h13M3 19h2m3 0h13" />
									)}
								</svg>
							</button>
						))}
					</div>
				</div>
				<div className="rr-results">
					<p role="status">
						{filtered.length}{" "}
						{filtered.length === 1 ? "record" : "records"} on the
						shelf
					</p>
					{(query || format !== "all" || sort !== "shelf") && (
						<button
							type="button"
							className="rr-link-button"
							onClick={reset}
						>
							Reset filters
						</button>
					)}
					{filtered.length > 0 && (
						<button
							type="button"
							className="rr-link-button rr-lucky"
							onClick={() => pick(filtered)}
						>
							Lucky dip
						</button>
					)}
				</div>
				{filtered.length ? (
					<ul className={`rr-catalogue rr-${view}`}>
						{filtered.slice(0, limit).map(record => (
							<li key={record.copyId}>
								<button
									type="button"
									className="rr-record"
									onClick={() => openRecord(record)}
								>
									<span className="rr-record-cover">
										<RecordArt record={record} slot={view} />
									</span>
									<span className="rr-record-meta">
										<span
											className={`rr-tag rr-tag-${record.format}`}
										>
											{formatNames[record.format]}
										</span>
										<span>{record.year}</span>
									</span>
									<strong>{record.title}</strong>
									<span className="rr-record-artist">
										{record.artist}
									</span>
								</button>
							</li>
						))}
					</ul>
				) : (
					<div className="rr-empty">
						<h3>
							{records.length
								? "No matching records."
								: "The shelf is empty."}
						</h3>
						{records.length > 0 && (
							<button
								className="rr-link-button"
								type="button"
								onClick={reset}
							>
								Show the whole collection
							</button>
						)}
					</div>
				)}
				{filtered.length > limit && (
					<div className="rr-more">
						<button
							type="button"
							className="rr-button"
							onClick={() => setLimit(limit + pageSize)}
						>
							More from the shelves
						</button>
						<small>
							{limit} of {filtered.length}
						</small>
					</div>
				)}
			</section>
			<ListeningRoom records={records} />
			<section
				id="spotify-listening"
				className="rr-section rr-rankings"
				aria-labelledby="spotify-listening-heading"
			>
				<SpotifyListeningSection />
			</section>
			<section
				className="rr-manifesto rr-section"
				aria-labelledby="rr-manifesto-title"
			>
				<h2 id="rr-manifesto-title">
					You will own <span>something.</span>
					<br />
					And be happy.
				</h2>
				<a className="rr-button rr-dark-button" href="#collection">
					Back to the shelves
				</a>
			</section>
			{selected && (
				<RecordDetail
					key={selected.copyId}
					record={selected}
					onClose={closeRecord}
				/>
			)}
		</div>
	);
}
