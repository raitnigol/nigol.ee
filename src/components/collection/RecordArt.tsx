import Image, { getImageProps } from "next/image";
import type { PublishedRecord } from "../../lib/publishedRecord";

export const formatNames = { cd: "CD", vinyl: "Vinyl", mixed: "Mixed set" };
const fallbackArt = "/images/physical-media/covers/placeholder.jpg";

const coverSlots = {
	grid: {
		width: 256,
		sizes: "(max-width: 44rem) 46vw, (max-width: 58rem) 30vw, (max-width: 78rem) 23vw, 16rem"
	},
	hero: {
		width: 260,
		sizes: "(max-width: 44rem) min(56vw, 13.3rem), min(25vw, 16.3rem)"
	},
	list: { width: 48, sizes: undefined },
	deck: {
		width: 160,
		sizes: "(max-width: 44rem) min(28vw, 12rem), min(14vw, 12rem)"
	},
	detail: { width: 320, sizes: "(max-width: 44rem) 12rem, 20rem" }
};

// Only these public image files can outlive a catalogue entry in a shared cache.
// Owner uploads and other external images keep their original delivery policy.
function canOptimize(source: string) {
	return (
		source.startsWith("/images/physical-media/covers/") ||
		/^https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+$/.test(source)
	);
}

// The archive already serves resized artwork and controls how long a release's
// current front cover can be cached. Use its thumbnails directly.
const archiveCover =
	/^(https:\/\/coverartarchive\.org\/release(?:-group)?\/[a-f0-9-]{36}\/front)(?:-(250|500|1200))?$/i;

export function RecordArt({
	record,
	slot,
	priority = false
}: {
	record: PublishedRecord;
	slot: keyof typeof coverSlots;
	priority?: boolean;
}) {
	const source = record.image || fallbackArt;
	const optimized = canOptimize(source);
	const { width, sizes } = coverSlots[slot];
	const archive = archiveCover.exec(source);
	const { props } = getImageProps({
		src: source,
		alt: "",
		width,
		height: width,
		unoptimized: !optimized,
		sizes,
		loading: priority ? "eager" : "lazy",
		fetchPriority: priority ? "high" : undefined
	});
	const archiveSrcSet =
		archive &&
		[250, 500, 1200]
			.filter(size => size <= Number(archive[2] || 1200))
			.map(size => `${archive[1]}-${size} ${size}w`)
			.join(", ");
	return (
		// eslint-disable-next-line @next/next/no-img-element -- Both native and Next image candidates use the same error fallback.
		<img
			key={source}
			{...props}
			alt=""
			sizes={archive ? sizes ?? `${width}px` : props.sizes}
			srcSet={archiveSrcSet || props.srcSet}
			onError={({ currentTarget: image }) => {
				// A native thumbnail or CDN transformation can fail independently of its source.
				const hadCandidates = image.hasAttribute("srcset");
				image.removeAttribute("srcset");
				if (hadCandidates) image.src = source;
				else if (image.getAttribute("src") !== fallbackArt)
					image.src = fallbackArt;
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
