import Image from "next/future/image";

import type {
	FeaturedPhysicalMedia as FeaturedPhysicalMediaData,
	PhysicalMediaItem
} from "../data/physicalMedia";
import type { PhysicalMediaAlbumMeta } from "../lib/physicalMediaSpotifyMeta";

type FeaturedPhysicalMediaProps = {
	item: PhysicalMediaItem;
	feature: FeaturedPhysicalMediaData;
	spotifyMeta?: PhysicalMediaAlbumMeta;
	anchorId?: string;
};

export function FeaturedPhysicalMedia({
	item,
	feature,
	spotifyMeta,
	anchorId = `featured-${item.id}`
}: FeaturedPhysicalMediaProps) {
	const title = item.title ?? spotifyMeta?.name ?? "Featured record";
	const artist =
		item.artists ?? spotifyMeta?.artists ?? "Artist details coming soon";
	const coverImageUrl = item.coverImageUrl ?? spotifyMeta?.coverImageUrl;
	const format = item.format ?? "vinyl";
	const titleId = `${anchorId}-title`;

	return (
		<article
			id={anchorId}
			className="featured-physical-media scroll-anchor"
			aria-labelledby={titleId}
		>
			<div className="featured-physical-media__visual">
				{coverImageUrl ? (
					<Image
						src={coverImageUrl}
						alt={`${title} by ${artist}`}
						width={1200}
						height={1200}
						sizes="(min-width: 1024px) 52vw, 100vw"
						className="featured-physical-media__image"
					/>
				) : (
					<div
						className="featured-physical-media__placeholder"
						role="img"
						aria-label={`${title} artwork placeholder`}
					>
						<p className="featured-physical-media__placeholder-format">
							{format}
						</p>
						<p className="featured-physical-media__placeholder-note">
							Artwork coming soon
						</p>
					</div>
				)}
			</div>

			<div className="featured-physical-media__content">
				<div className="featured-physical-media__heading">
					{feature.eyebrow ? (
						<p className="featured-physical-media__eyebrow">
							{feature.eyebrow}
						</p>
					) : null}
					<p className="featured-physical-media__badge">
						{feature.badge}
					</p>
				</div>

				<p className="featured-physical-media__artist">{artist}</p>
				<h3 id={titleId} className="featured-physical-media__title">
					{title}
				</h3>

				{feature.valueLabel ? (
					<p className="featured-physical-media__value">
						<span>Estimated value</span>
						<strong>{feature.valueLabel}</strong>
					</p>
				) : null}

				<p className="featured-physical-media__story">
					{feature.story}
				</p>

				<dl className="featured-physical-media__details">
					{feature.details.map(detail => (
						<div
							key={detail.label}
							className="featured-physical-media__detail"
						>
							<dt>{detail.label}</dt>
							<dd>{detail.value}</dd>
						</div>
					))}
				</dl>
			</div>
		</article>
	);
}
