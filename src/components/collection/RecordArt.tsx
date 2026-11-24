import Image from "next/image";
import type { PublishedRecord } from "../../lib/publishedRecord";

export const formatNames = { cd: "CD", vinyl: "Vinyl", mixed: "Mixed set" };
const fallbackArt = "/images/physical-media/covers/placeholder.jpg";

export function RecordArt({
	record,
	priority = false
}: {
	record: PublishedRecord;
	priority?: boolean;
}) {
	return (
		// Owner-controlled artwork must bypass the image optimizer cache.
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={record.image || fallbackArt}
			alt=""
			width={600}
			height={600}
			loading={priority ? "eager" : "lazy"}
			fetchPriority={priority ? "high" : undefined}
			decoding="async"
			onError={event => {
				if (event.currentTarget.getAttribute("src") !== fallbackArt) {
					event.currentTarget.src = fallbackArt;
				}
			}}
		/>
	);
}

export function SpotifyLink({ record }: { record: PublishedRecord }) {
	if (!record.spotifyUrl) return null;
	return (
		<a
			className="rr-spotify-link"
			href={record.spotifyUrl}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Image
				unoptimized
				src="/collection-design/spotify.svg"
				alt=""
				width={20}
				height={20}
			/>
			Open in Spotify
		</a>
	);
}

export function SpotifyEmbed({ record }: { record: PublishedRecord }) {
	if (!record.spotifyId || !record.spotifyType || !record.spotifyUrl)
		return null;
	return (
		<iframe
			className="rr-embed"
			title={`${record.title} by ${record.artist} on Spotify`}
			src={`https://open.spotify.com/embed/${record.spotifyType}/${record.spotifyId}?theme=0`}
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			allowFullScreen
			height={152}
			width="100%"
			referrerPolicy="strict-origin-when-cross-origin"
		/>
	);
}
