"use client";

import { useMemo, useState } from "react";
import type { PublishedRecord } from "../../lib/publishedRecord";
import { formatNames, RecordArt, SpotifyEmbed, SpotifyLink } from "./RecordArt";

export function ListeningRoom({ records }: { records: PublishedRecord[] }) {
	const [format, setFormat] = useState<"all" | PublishedRecord["format"]>(
		"all"
	);
	const [chosen, setChosen] = useState<string>();
	const [playing, setPlaying] = useState<string>();
	const [limit, setLimit] = useState(5);
	const [query, setQuery] = useState("");
	const available = useMemo(
		() =>
			records.filter(
				record =>
					record.spotifyUrl && record.spotifyId && record.spotifyType
			),
		[records]
	);
	const matches = useMemo(() => {
		const seen = new Set<string>();
		const term = query.trim().toLocaleLowerCase();
		return available.filter(record => {
			if (format !== "all" && format !== record.format) return false;
			if (
				term &&
				!`${record.title} ${record.artist}`
					.toLocaleLowerCase()
					.includes(term)
			)
				return false;
			if (seen.has(record.spotifyUrl!)) return false;
			seen.add(record.spotifyUrl!);
			return true;
		});
	}, [available, format, query]);
	if (!available.length) return null;
	const selected =
		matches.find(record => record.copyId === chosen) || matches[0];
	const formats = (["all", "cd", "vinyl", "mixed"] as const).filter(
		value =>
			value === "all" || available.some(record => record.format === value)
	);
	return (
		<section
			id="listening"
			className="rr-section rr-paper"
			aria-labelledby="rr-listening-title"
		>
			<h2 id="rr-listening-title" className="rr-heading">
				THE LISTENING ROOM<span>.</span>
			</h2>
			<div className="rr-listening-layout">
				<div>
					<div className="rr-listening-tools">
						<div
							className="rr-tab-group"
							role="group"
							aria-label="Listening format"
						>
							{formats.map(value => (
								<button
									type="button"
									key={value}
									aria-pressed={format === value}
									onClick={() => {
										setFormat(value);
										setLimit(5);
										setPlaying(undefined);
									}}
								>
									{value === "all"
										? "All"
										: formatNames[value]}
								</button>
							))}
						</div>
						<label>
							<span className="rr-sr">
								Search Spotify releases in the collection
							</span>
							<input
								type="search"
								placeholder="Find a release…"
								value={query}
								onChange={event => {
									setQuery(event.target.value);
									setLimit(5);
								}}
							/>
						</label>
					</div>
					{matches.length === 0 && (
						<p role="status">No matching Spotify releases.</p>
					)}
					<ul className="rr-play-list">
						{matches.slice(0, limit).map(record => (
							<li key={record.copyId}>
								<button
									type="button"
									aria-pressed={
										record.copyId === selected?.copyId
									}
									onClick={() => {
										setChosen(record.copyId);
										setPlaying(record.copyId);
									}}
								>
									<RecordArt record={record} />
									<span>
										<strong>{record.title}</strong>
										<small>{record.artist}</small>
									</span>
									<span
										aria-hidden="true"
										className="rr-play-icon"
									>
										▶
									</span>
								</button>
							</li>
						))}
					</ul>
					{limit < matches.length && (
						<button
							type="button"
							className="rr-link-button"
							onClick={() => setLimit(limit + 8)}
						>
							More releases
						</button>
					)}
				</div>
				{selected && (
					<div className="rr-deck">
						<div className="rr-deck-selection">
							<RecordArt record={selected} />
							<div>
								<span className="rr-kicker">
									{formatNames[selected.format]}
									{selected.year && ` · ${selected.year}`}
								</span>
								<h3>{selected.title}</h3>
								<p>{selected.artist}</p>
							</div>
						</div>
						{playing === selected.copyId ? (
							<SpotifyEmbed record={selected} />
						) : (
							<button
								type="button"
								className="rr-button rr-acid-button"
								onClick={() => setPlaying(selected.copyId)}
							>
								Load Spotify player
							</button>
						)}
						<SpotifyLink record={selected} />
					</div>
				)}
			</div>
		</section>
	);
}
