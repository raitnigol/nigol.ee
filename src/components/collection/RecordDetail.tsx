"use client";

import { useEffect, useRef, useState } from "react";
import type { PublishedRecord } from "../../lib/publishedRecord";
import { formatNames, RecordArt, SpotifyEmbed, SpotifyLink } from "./RecordArt";

const artworkCredits = new Map([
	["spotify", "Spotify"],
	["discogs", "Discogs"],
	["musicbrainz", "MusicBrainz"],
	["coverartarchive", "Cover Art Archive"]
]);

export function RecordDetail({
	record,
	onClose
}: {
	record: PublishedRecord;
	onClose: () => void;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	const [play, setPlay] = useState(false);
	const [copyStatus, setCopyStatus] = useState("");
	useEffect(() => {
		const dialog = ref.current;
		const opener = document.activeElement;
		dialog?.showModal();
		return () => {
			dialog?.close();
			if (opener instanceof HTMLElement && opener.isConnected)
				opener.focus({ preventScroll: true });
		};
	}, []);

	const digital = record.metadataKind === "digital";
	const credit = artworkCredits.get(record.imageSource || "");
	const facts = [
		[
			"Format",
			[
				record.mediaCount && `${record.mediaCount} ×`,
				formatNames[record.format]
			]
				.filter(Boolean)
				.join(" ")
		],
		[
			record.editionDate
				? "Edition date"
				: digital
				? "Digital release"
				: "Album year",
			record.editionDate || record.year
		],
		[digital ? "Digital label" : "Label", record.label],
		["Country", record.country],
		["Catalogue number", record.catalogNumber],
		["Packaging", record.packaging],
		["Colour", record.color],
		["Tracks", record.tracks]
	];

	return (
		<dialog
			ref={ref}
			aria-labelledby="rr-detail-title"
			className="rr-dialog"
			onCancel={event => {
				event.preventDefault();
				onClose();
			}}
			onClick={event => {
				if (event.target !== ref.current) return;
				const box = event.currentTarget.getBoundingClientRect();
				if (
					event.clientX < box.left ||
					event.clientX > box.right ||
					event.clientY < box.top ||
					event.clientY > box.bottom
				)
					onClose();
			}}
		>
			<header className="rr-dialog-bar">
				<button
					type="button"
					onClick={onClose}
					autoFocus
					aria-label="Close record details"
				>
					Close <span aria-hidden="true">×</span>
				</button>
			</header>
			<div className="rr-detail-content">
				<div className="rr-detail-art">
					<RecordArt record={record} slot="detail" />
					{credit && (
						<p className="rr-credit">Artwork via {credit}</p>
					)}
				</div>
				<div className="rr-detail-copy">
					<span className={`rr-tag rr-tag-${record.format}`}>
						{formatNames[record.format]}
					</span>
					<h2 id="rr-detail-title">{record.title}</h2>
					<p className="rr-artist">{record.artist}</p>
					{record.description && (
						<p className="rr-description">{record.description}</p>
					)}
					<dl className="rr-facts">
						{facts.map(([label, value]) =>
							value ? (
								<div key={label}>
									<dt>{label}</dt>
									<dd>{value}</dd>
								</div>
							) : null
						)}
					</dl>
					{digital && !record.editionConfirmed && (
						<p className="rr-credit">
							Digital release metadata. The physical edition is
							unconfirmed.
						</p>
					)}
					{record.references.length > 0 && (
						<div className="rr-source-links">
							{record.references.map((source, index) => (
								<a
									key={index}
									href={source.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									{source.provider === "discogs"
										? "Data provided by Discogs"
										: "MusicBrainz"}{" "}
									↗
								</a>
							))}
						</div>
					)}
					<div className="rr-detail-actions">
						{record.spotifyUrl && !play && (
							<button
								type="button"
								className="rr-button rr-dark-button"
								onClick={() => setPlay(true)}
							>
								Listen on Spotify
							</button>
						)}
						{record.spotifyUrl && <SpotifyLink record={record} />}
						<button
							type="button"
							className="rr-link-button"
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(
										location.href
									);
									setCopyStatus("Link copied.");
								} catch {
									setCopyStatus(
										"Copy the link from your address bar."
									);
								}
							}}
						>
							Copy link
						</button>
					</div>
					{copyStatus && (
						<p role="status" className="rr-credit">
							{copyStatus}
						</p>
					)}
					{play && <SpotifyEmbed record={record} />}
				</div>
			</div>
		</dialog>
	);
}
