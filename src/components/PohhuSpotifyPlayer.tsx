"use client";

import { useId, useState } from "react";
import { FormattedText } from "./FormattedText";

interface PohhuSpotifyPlayerProps {
	playlistId: string;
	title: string;
}

export function PohhuSpotifyPlayer({
	playlistId,
	title
}: PohhuSpotifyPlayerProps) {
	const [expanded, setExpanded] = useState(false);
	const panelId = useId();
	const id = encodeURIComponent(playlistId);

	return (
		<div className="pohhu-spotify-player">
			<p className="pohhu-spotify-player__title">
				<FormattedText text={title} />
			</p>
			<div className="pohhu-spotify-player__actions">
				<button
					type="button"
					className="pohhu-spotify-player__toggle focus-ring"
					aria-controls={panelId}
					aria-expanded={expanded}
					onClick={() => setExpanded(open => !open)}
				>
					{expanded ? "Close player" : "Load player"}
				</button>
				<a
					className="pohhu-spotify-player__link focus-ring"
					href={`https://open.spotify.com/playlist/${id}`}
					target="_blank"
					rel="noopener noreferrer"
				>
					Open on Spotify
				</a>
			</div>
			<div
				id={panelId}
				className="pohhu-spotify-player__panel"
				hidden={!expanded}
			>
				{expanded && (
					<iframe
						className="pohhu-spotify-player__frame"
						title={`Spotify playlist: ${title}`}
						src={`https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`}
						width="100%"
						height={352}
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					/>
				)}
			</div>
		</div>
	);
}
