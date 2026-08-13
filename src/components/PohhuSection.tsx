import Image from "next/future/image";
import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
	aleksandriPub,
	certifiedArtists,
	fundedReleases,
	kiviArtShow,
	kevilniusMerch,
	pohhuExhibitionsEventsDivider,
	pohhuFundedReleasesIntro,
	pohhuFundedReleasesSubsectionTitle,
	pohhuFundingModel,
	pohhuFoundingCore,
	pohhuFoundingCoreIntro,
	pohhuManifestoAfterCore,
	pohhuManifestoBeforeCore,
	pohhuManifestoClosing,
	pohhuManifestoPullquote,
	pohhuMerchDivider,
	pohhuPhysicalMediaDivider,
	pohhuLineupDivider,
	type CertifiedArtistProfile,
	type FundedRelease,
	type KiviArtShowLink
} from "../data/pohhu";
import { socialPlatformIcons } from "../data/socials";
import { FormattedText } from "./FormattedText";
import { ImageLightboxGallery } from "./ImageLightboxGallery";
import { MerchProductCarouselLazy } from "./MerchProductCarouselLazy";
import { PohhuLogoReveal } from "./PohhuLogoReveal";
import { SocialIconLink } from "./SocialIconLink";
import type {
	SpotifyArtistMeta,
	SpotifyArtistsMetaFile
} from "../lib/spotifyArtistMeta";

function formatFollowers(count: number) {
	return new Intl.NumberFormat("en-US").format(count);
}

function PohhuChapter({ id, title }: { id: string; title: string }) {
	return (
		<h3 id={id} className="pohhu-chapter scroll-anchor">
			<FormattedText text={title} />
			<span className="pohhu-chapter__rule" aria-hidden />
		</h3>
	);
}

function PohhuSubhead({
	id,
	children
}: {
	id: string;
	children: ComponentChildren;
}) {
	return (
		<h4 id={id} className="pohhu-subhead scroll-anchor">
			{children}
		</h4>
	);
}

function PohhuBlock({
	id,
	title,
	children
}: {
	id: string;
	title: string;
	children: ComponentChildren;
}) {
	return (
		<section className="pohhu-block" aria-labelledby={id}>
			<PohhuChapter id={id} title={title} />
			<div className="pohhu-block__body">{children}</div>
		</section>
	);
}

function ManifestoParagraph({ text }: { text: string }) {
	return (
		<p className="pohhu-copy">
			<FormattedText text={text} />
		</p>
	);
}

function ManifestoPullquote({ text }: { text: string }) {
	return (
		<p className="pohhu-pullquote">
			<FormattedText text={text} />
		</p>
	);
}

function LocalCoverImage({
	src,
	alt,
	className
}: {
	src: string;
	alt: string;
	className?: string;
}) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div
				className={`flex h-full w-full items-center justify-center bg-slate-900 text-xs font-bold uppercase tracking-wider text-subtle ${className ?? ""}`}
			>
				Cover
			</div>
		);
	}

	return (
		<Image
			src={src}
			alt={alt}
			width={400}
			height={400}
			sizes="(min-width: 768px) 50vw, 100vw"
			loading="lazy"
			className={className}
			onError={() => setFailed(true)}
		/>
	);
}

function investmentStatusLabel(
	status: NonNullable<FundedRelease["investmentStatus"]>
): string {
	if (status === "paid_in_full") return "Paid";
	if (status === "partially_paid") return "Partial";
	return "Open";
}

function InvestmentStatusMark({
	status
}: {
	status: NonNullable<FundedRelease["investmentStatus"]>;
}) {
	const tone =
		status === "paid_in_full"
			? "pohhu-status pohhu-status--paid"
			: status === "partially_paid"
				? "pohhu-status pohhu-status--partial"
				: "pohhu-status pohhu-status--open";

	return <span className={tone}>{investmentStatusLabel(status)}</span>;
}

function FundedReleaseBannerCard({ release }: { release: FundedRelease }) {
	return (
		<li className="md:col-span-2">
			<article className="pohhu-release pohhu-release--banner">
				<div className="pohhu-release__meta">
					{release.subtitle ? (
						<span className="pohhu-release__year">{release.subtitle}</span>
					) : null}
					{release.investmentStatus ? (
						<InvestmentStatusMark status={release.investmentStatus} />
					) : null}
				</div>
				<h4 className="pohhu-release__title pohhu-release__title--banner">
					{release.title}
				</h4>
				{release.description ? (
					<p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
						<FormattedText text={release.description} />
					</p>
				) : null}
			</article>
		</li>
	);
}

function FundedReleaseCard({ release }: { release: FundedRelease }) {
	if (release.banner) {
		return <FundedReleaseBannerCard release={release} />;
	}

	const coverImage = release.coverImage ?? "";
	const spotifyUrl = release.spotifyUrl ?? "#";

	return (
		<li>
			<a
				href={spotifyUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="pohhu-release focus-ring group block h-full"
			>
				<div className="pohhu-release__cover aspect-square w-full overflow-hidden bg-slate-900">
					<LocalCoverImage
						src={coverImage}
						alt={`${release.title} cover art`}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="pohhu-release__body">
					<div className="pohhu-release__meta">
						{release.releaseYear ? (
							<span className="pohhu-release__year">{release.releaseYear}</span>
						) : null}
						{release.investmentStatus ? (
							<InvestmentStatusMark status={release.investmentStatus} />
						) : null}
					</div>
					<p className="pohhu-release__title">{release.title}</p>
					{release.artists ? (
						<p className="pohhu-release__artists">{release.artists}</p>
					) : null}
				</div>
			</a>
		</li>
	);
}

const POHHU_TOC = [
	{ href: "#pohhu-manifesto", label: "Manifesto" },
	{ href: "#pohhu-physical-media", label: "Media" },
	{ href: "#pohhu-merch", label: "Merch" },
	{ href: "#pohhu-exhibitions-events", label: "Events" },
	{ href: "#pohhu-lineup", label: "Lineup" }
] as const;

function PohhuToc() {
	return (
		<nav className="pohhu-toc" aria-label="On this page">
			<ul className="pohhu-toc__list">
				{POHHU_TOC.map(item => (
					<li key={item.href}>
						<a href={item.href} className="pohhu-toc__link focus-ring">
							{item.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

function FoundingCoreStrip({ members }: { members: string[] }) {
	return (
		<div className="pohhu-core">
			<p className="pohhu-core__intro">
				<FormattedText text={pohhuFoundingCoreIntro} />
			</p>
			<ul className="pohhu-core__list">
				{members.map((member, index) => (
					<li key={member} className="pohhu-core__item">
						{index > 0 ? (
							<span className="pohhu-core__sep" aria-hidden>
								/
							</span>
						) : null}
						<span className="pohhu-core__name">
							<FormattedText text={member} />
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function KiviBaarSocialLinks({ links }: { links: KiviArtShowLink[] }) {
	return (
		<div>
			<p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-subtle">
				Kivi Baar socials
			</p>
			<div className="flex flex-wrap gap-6">
				{links.map(link => (
					<SocialIconLink
						key={link.href}
						href={link.href}
						image={socialPlatformIcons[link.platform]}
						label={link.label}
						caption={link.caption}
					/>
				))}
			</div>
		</div>
	);
}

function SpotifyPlaylistEmbed({
	playlistId,
	title
}: {
	playlistId: string;
	title: string;
}) {
	const embedSrc = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

	return (
		<div className="pohhu-playlist overflow-hidden">
			<p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-400">
				{title}
			</p>
			<iframe
				title={`Spotify playlist: ${title}`}
				src={embedSrc}
				width="100%"
				height={352}
				className="block w-full border-0 bg-slate-900"
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
			/>
		</div>
	);
}

function CertifiedArtistCard({
	profile,
	artist
}: {
	profile: CertifiedArtistProfile;
	artist?: SpotifyArtistMeta;
}) {
	const spotifyUrl =
		artist?.spotifyUrl ??
		`https://open.spotify.com/artist/${profile.spotifyId}`;
	const spotifyImageUrl = artist?.imageUrl ?? null;
	const [photoSrc, setPhotoSrc] = useState(profile.profileImage);

	useEffect(() => {
		setPhotoSrc(profile.profileImage);
	}, [profile.profileImage]);

	const handlePhotoError = () => {
		if (photoSrc === profile.profileImage && spotifyImageUrl) {
			setPhotoSrc(spotifyImageUrl);
		}
	};

	const imageSrc = photoSrc || spotifyImageUrl;
	const artistName = artist?.name;

	return (
		<div className="pohhu-artist">
			<div className="pohhu-artist__media">
				<div className="relative aspect-square w-full overflow-hidden bg-slate-900 md:max-w-none">
					{imageSrc ? (
						<Image
							src={imageSrc}
							alt={artistName ?? "Artist"}
							width={300}
							height={300}
							sizes="(min-width: 640px) 24rem, 100vw"
							loading="lazy"
							className="h-full w-full object-cover"
							onError={handlePhotoError}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center animate-pulse bg-slate-900 text-subtle">
							·
						</div>
					)}
				</div>
			</div>

			<div className="pohhu-artist__copy">
				<h4 className="pohhu-artist__name">
					<a
						href={spotifyUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="pohhu-artist__name-link focus-ring"
					>
						{artistName ?? "…"}
					</a>
				</h4>
				{artist ? (
					<p className="pohhu-artist__meta">
						<span>{formatFollowers(artist.followers)}</span> followers
						on Spotify
						{artist.genres.length > 0 ? (
							<> · {artist.genres.slice(0, 3).join(", ")}</>
						) : null}
					</p>
				) : null}

				<p className="pohhu-copy pohhu-artist__bio">{profile.bio}</p>

				<a
					href={spotifyUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="pohhu-text-link focus-ring"
				>
					Open on Spotify →
				</a>
			</div>

			{profile.playlist ? (
				<div className="pohhu-artist__playlist">
					<SpotifyPlaylistEmbed
						playlistId={profile.playlist.id}
						title={profile.playlist.title}
					/>
				</div>
			) : null}
		</div>
	);
}

function KevilniusMerchBlock() {
	const {
		vendor,
		title,
		price,
		compareAtPrice,
		currency,
		saleLabel,
		details,
		description,
		orderFormUrl,
		orderFormLabel,
		instagramUrl,
		instagramLabel,
		modelCredit,
		gallery
	} = kevilniusMerch;

	return (
		<div id="pohhu-kevilnius-merch" className="scroll-anchor merch-pdp min-w-0">
			<div className="merch-product-layout">
				{gallery.length > 0 ? (
					<figure className="photo-credit min-w-0">
						<MerchProductCarouselLazy
							items={gallery}
							dialogLabel="Kevilnius merch photos"
						/>
						{modelCredit ? (
							<figcaption className="merch-pdp__credit">
								Model{" "}
								<a
									href={modelCredit.instagramUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="focus-ring"
								>
									{modelCredit.name}
								</a>
								<span aria-hidden> · </span>
								<a
									href={modelCredit.instagramUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="focus-ring"
								>
									@{modelCredit.instagramHandle}
								</a>
							</figcaption>
						) : null}
					</figure>
				) : null}

				<div className="product-detail min-w-0">
					<header className="product-detail__header">
						<div className="product-detail__eyebrow">
							<p className="product-detail__vendor">{vendor}</p>
							{saleLabel ? (
								<span className="product-detail__badge">{saleLabel}</span>
							) : null}
						</div>
						<h3 className="product-detail__title">{title}</h3>

						<div className="product-detail__pricing">
							{compareAtPrice ? (
								<p className="product-detail__compare">
									<span className="sr-only">Original price </span>
									<s>
										{compareAtPrice}
										{currency}
									</s>
								</p>
							) : null}
							<p className="product-detail__price">
								<span className="sr-only">Sale price </span>
								{price}
								<span className="product-detail__currency">{currency}</span>
							</p>
							{compareAtPrice ? (
								<p className="product-detail__save">
									Save {Number(compareAtPrice) - Number(price)}
									{currency}
								</p>
							) : null}
						</div>
					</header>

					<div className="product-detail__actions">
						<a
							href={orderFormUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="focus-ring product-detail__order-btn"
						>
							{orderFormLabel}
						</a>
						<a
							href={instagramUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="focus-ring product-detail__secondary-btn"
						>
							{instagramLabel}
						</a>
					</div>

					{details.length > 0 ? (
						<div className="product-detail__specs-wrap">
							<p className="product-detail__specs-heading">Details</p>
							<dl className="product-detail__specs">
								{details.map(({ label, value }) => (
									<div key={label} className="product-detail__spec">
										<dt className="product-detail__spec-label">{label}</dt>
										<dd className="product-detail__spec-value">{value}</dd>
									</div>
								))}
							</dl>
						</div>
					) : null}

					<div className="product-detail__description">
						<p className="product-detail__specs-heading">About</p>
						{description.map((paragraph, i) => (
							<p key={i} className="product-detail__description-p">
								<FormattedText text={paragraph} />
							</p>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function PohhuSection({
	artistMeta
}: {
	artistMeta: SpotifyArtistsMetaFile;
}) {
	return (
		<div className="pohhu-page" aria-labelledby="pohhu-heading">
			<header className="pohhu-hero">
				<h2 id="pohhu-heading" className="pohhu-hero__brand">
					<span className="sr-only">$.pohhu¥</span>
					<span className="block">
						<PohhuLogoReveal />
					</span>
					<p className="pohhu-tagline-reveal pohhu-hero__tagline">
						<span className="pohhu-tagline-reveal__text">
							will take over the world
						</span>
					</p>
				</h2>
				<PohhuToc />
			</header>

			<PohhuBlock id="pohhu-manifesto" title="Manifesto">
				<div className="pohhu-stack">
					{pohhuManifestoBeforeCore.map((paragraph, i) => (
						<ManifestoParagraph key={`before-${i}`} text={paragraph} />
					))}

					<FoundingCoreStrip members={pohhuFoundingCore} />

					{pohhuManifestoAfterCore.map((paragraph, i) => (
						<ManifestoParagraph key={`after-${i}`} text={paragraph} />
					))}

					<ManifestoPullquote text={pohhuManifestoPullquote} />

					{pohhuManifestoClosing.map((paragraph, i) => (
						<ManifestoParagraph key={`close-${i}`} text={paragraph} />
					))}
				</div>

				<aside
					id="pohhu-aleksandri-pub"
					className="pohhu-aside scroll-anchor"
				>
					<p className="pohhu-aside__title">
						<span className="pohhu-aside__mark" aria-hidden>
							⌖
						</span>
						{aleksandriPub.title}
					</p>
					<p className="pohhu-aside__kicker">{aleksandriPub.subtitle}</p>
					<div className="pohhu-aside__body">
						<ManifestoParagraph text={aleksandriPub.body} />
						<p className="pohhu-aside__action">
							<a
								href={aleksandriPub.mapUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="pohhu-text-link focus-ring"
							>
								{aleksandriPub.mapLinkLabel} →
							</a>
						</p>
					</div>
				</aside>
			</PohhuBlock>

			<PohhuBlock id="pohhu-physical-media" title={pohhuPhysicalMediaDivider}>
				<div className="pohhu-stack">
					{pohhuFundedReleasesIntro.map((paragraph, i) => (
						<ManifestoParagraph key={`releases-intro-${i}`} text={paragraph} />
					))}
					{pohhuFundingModel.map((paragraph, i) => (
						<ManifestoParagraph key={`funding-model-${i}`} text={paragraph} />
					))}
				</div>

				<div className="pohhu-panel">
					<PohhuSubhead id="pohhu-963-records">
						<FormattedText text={pohhuFundedReleasesSubsectionTitle} />
					</PohhuSubhead>
					<ul className="pohhu-catalog">
						{fundedReleases.map(release => (
							<FundedReleaseCard key={release.title} release={release} />
						))}
					</ul>
				</div>
			</PohhuBlock>

			<PohhuBlock id="pohhu-merch" title={pohhuMerchDivider}>
				<KevilniusMerchBlock />
			</PohhuBlock>

			<PohhuBlock
				id="pohhu-exhibitions-events"
				title={pohhuExhibitionsEventsDivider}
			>
				<div className="pohhu-panel">
					<PohhuSubhead id="pohhu-kivi-art-show">
						<FormattedText text={kiviArtShow.title} />
					</PohhuSubhead>
					<div className="pohhu-stack">
						{kiviArtShow.paragraphs.map((paragraph, i) => (
							<ManifestoParagraph key={`kivi-${i}`} text={paragraph} />
						))}
					</div>
					<div className="pohhu-gallery">
						<ImageLightboxGallery
							items={kiviArtShow.gallery}
							dialogLabel="Kivi Baar art show gallery"
							thumbnailVariant="bare"
							bannerFooter={
								<KiviBaarSocialLinks links={kiviArtShow.links} />
							}
							photosStartLabel={kiviArtShow.photosSectionLabel}
						/>
					</div>
				</div>
			</PohhuBlock>

			<PohhuBlock id="pohhu-lineup" title={pohhuLineupDivider}>
				<div className="pohhu-lineup">
					{certifiedArtists.map(profile => (
						<CertifiedArtistCard
							key={profile.spotifyId}
							profile={profile}
							artist={artistMeta.artists[profile.spotifyId]}
						/>
					))}
				</div>
			</PohhuBlock>
		</div>
	);
}
