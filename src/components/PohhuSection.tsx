import Image from "next/future/image";
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
	pohhuFundedReleasesTitle,
	pohhuFundingModel,
	pohhuLineupDivider,
	pohhuPhysicalMediaDivider,
	pohhuFoundingCore,
	pohhuFoundingCoreIntro,
	pohhuManifestoAfterCore,
	pohhuManifestoBeforeCore,
	pohhuManifestoClosing,
	pohhuManifestoPullquote,
	type CertifiedArtistProfile,
	type FundedRelease,
	type KiviArtShowLink
} from "../data/pohhu";
import { socialPlatformIcons } from "../data/socials";
import { FormattedText } from "./FormattedText";
import { ImageLightboxGallery } from "./ImageLightboxGallery";
import { MerchProductCarouselLazy } from "./MerchProductCarouselLazy";
import { PohhuLogoReveal } from "./PohhuLogoReveal";
import { SectionDivider } from "./SectionDivider";
import { SocialIconLink } from "./SocialIconLink";
import type {
	SpotifyArtistMeta,
	SpotifyArtistsMetaFile
} from "../lib/spotifyArtistMeta";

function formatFollowers(count: number) {
	return new Intl.NumberFormat("en-US").format(count);
}

const sectionHeadingClass =
	"scroll-anchor mb-5 font-bold text-2xl text-white md:text-3xl";

const subsectionHeadingClass =
	"scroll-anchor mb-5 font-bold text-xl text-white md:text-2xl";

function ManifestoParagraph({ text }: { text: string }) {
	return (
		<p className="mb-4 text-base leading-relaxed md:text-lg">
			<FormattedText text={text} />
		</p>
	);
}

function ManifestoPullquote({ text }: { text: string }) {
	return (
		<p className="my-6 border-l-2 border-violet-500/50 pl-4 text-lg font-semibold leading-snug md:text-xl">
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
				className={`flex h-full w-full items-center justify-center bg-slate-800 text-xs font-bold uppercase tracking-wider text-subtle ${className ?? ""}`}
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

const debtBorderClass =
	"border-2 border-red-600/90 hover:border-red-500/90";

function InvestmentStatusFooter({
	status
}: {
	status: NonNullable<FundedRelease["investmentStatus"]>;
}) {
	const label =
		status === "partially_paid"
			? "Investment partially paid"
			: "Investment not repaid";

	return (
		<p className="mt-3 border-t border-red-950/60 pt-3">
			<span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-red-400">
				{label}
			</span>
		</p>
	);
}

function FundedReleaseBannerCard({ release }: { release: FundedRelease }) {
	const outstanding = Boolean(release.investmentStatus);

	return (
		<li className="md:col-span-2">
			<article
				className={`overflow-hidden rounded-xl bg-slate-950/60 ${
					outstanding ? debtBorderClass : "border border-slate-800"
				}`}
			>
				<div className="flex min-h-[10rem] flex-col justify-center px-5 py-5 md:min-h-[11rem] md:px-8 md:py-6">
					{release.subtitle ? (
						<p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">
							{release.subtitle}
						</p>
					) : null}
					<h4 className="mt-1 text-lg font-bold leading-tight text-white md:text-xl">
						{release.title}
					</h4>
					{release.description ? (
						<p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
							<FormattedText text={release.description} />
						</p>
					) : null}
					{release.investmentStatus ? (
						<InvestmentStatusFooter status={release.investmentStatus} />
					) : null}
				</div>
			</article>
		</li>
	);
}

function FundedReleaseCard({ release }: { release: FundedRelease }) {
	if (release.banner) {
		return <FundedReleaseBannerCard release={release} />;
	}

	const unpaid = Boolean(release.investmentStatus);
	const coverImage = release.coverImage ?? "";
	const spotifyUrl = release.spotifyUrl ?? "#";

	return (
		<li>
			<a
				href={spotifyUrl}
				target="_blank"
				rel="noopener noreferrer"
				className={`group block h-full overflow-hidden rounded-xl bg-slate-950/60 transition hover:bg-slate-900/80 ${
					unpaid
						? `focus-ring-debt ${debtBorderClass}`
						: "focus-ring border border-slate-800 hover:border-violet-500/35"
				}`}
			>
				<div className="aspect-square w-full bg-slate-900">
					<LocalCoverImage
						src={coverImage}
						alt={`${release.title} cover art`}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="px-4 py-3">
					{release.releaseYear ? (
						<span className="text-xs font-bold uppercase tracking-wider text-violet-400">
							{release.releaseYear}
						</span>
					) : null}
					<p className="mt-1 text-sm font-bold text-white transition group-hover:text-violet-300">
						{release.title}
					</p>
					{release.artists ? (
						<p className="mt-1 text-xs text-muted">{release.artists}</p>
					) : null}
					{release.format ? (
						<p className="mt-1 text-xs text-subtle">{release.format}</p>
					) : null}
					{release.pressRun && !release.investmentStatus ? (
						<p className="mt-1 text-xs text-subtle">
							Press run · {release.pressRun}
						</p>
					) : null}
					{release.investmentStatus ? (
						<InvestmentStatusFooter status={release.investmentStatus} />
					) : null}
				</div>
			</a>
		</li>
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
		<div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 ring-1 ring-inset ring-white/5">
			<div className="border-b border-slate-800/90 px-4 py-3">
				<p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-400">
					{title}
				</p>
			</div>
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
	const useSpotifyCdn = imageSrc?.startsWith("http") ?? false;
	const artistName = artist?.name;

	return (
		<div className="space-y-6">
			<article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
			<div className="flex flex-col md:flex-row md:items-stretch">
				<div className="relative aspect-square w-full md:w-56 lg:w-64 flex-shrink-0 overflow-hidden bg-slate-900">
					{imageSrc ? (
						<Image
							src={imageSrc}
							alt={artistName ?? "Artist"}
							width={300}
							height={300}
							sizes="(min-width: 1024px) 16rem, (min-width: 768px) 14rem, 100vw"
							loading="lazy"
							unoptimized={useSpotifyCdn}
							className="h-full w-full object-cover"
							onError={handlePhotoError}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center animate-pulse bg-slate-900 text-subtle">
							·
						</div>
					)}
				</div>

				<div className="flex min-w-0 flex-1 flex-col p-5 md:p-6 lg:p-8">
					<div className="mb-4">
						<h4 className="text-3xl md:text-4xl font-bold tracking-tight">
							<a
								href={spotifyUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="focus-ring text-white border-b border-transparent hover:border-violet-400 transition-colors"
							>
								{artistName ?? "…"}
							</a>
						</h4>
						{artist ? (
							<p className="mt-2 text-sm text-muted">
								<span className="text-secondary">
									{formatFollowers(artist.followers)}
								</span>{" "}
								followers on Spotify
								{artist.genres.length > 0 ? (
									<>
										{" "}
										·{" "}
										{artist.genres.slice(0, 3).join(", ")}
									</>
								) : null}
							</p>
						) : null}
					</div>

					<p className="text-base leading-relaxed text-secondary mb-5">
						{profile.bio}
					</p>

					<a
						href={spotifyUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="focus-ring mt-5 inline-flex w-fit items-center text-sm font-bold text-violet-400 border-b border-violet-400/30 hover:border-violet-300 transition-colors"
					>
						Open on Spotify →
					</a>
				</div>
			</div>
		</article>

			{profile.playlist ? (
				<SpotifyPlaylistEmbed
					playlistId={profile.playlist.id}
					title={profile.playlist.title}
				/>
			) : null}
		</div>
	);
}

function KevilniusMerchBlock() {
	const {
		vendor,
		title,
		price,
		currency,
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
		<div id="pohhu-kevilnius-merch" className="scroll-anchor mb-10 min-w-0">
			<div className="merch-product-layout lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
				{gallery.length > 0 ? (
					<figure className="photo-credit min-w-0">
						<MerchProductCarouselLazy
							items={gallery}
							dialogLabel="Kevilnius merch photos"
						/>
						{modelCredit ? (
							<figcaption>
								<a
									href={modelCredit.instagramUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="focus-ring"
								>
									{modelCredit.name} / @{modelCredit.instagramHandle}
								</a>
							</figcaption>
						) : null}
					</figure>
				) : null}

				<div
					className={`product-detail min-w-0 lg:self-start ${
						gallery.length > 0
							? "mt-8 border-t border-slate-800/90 pt-8 lg:mt-0 lg:border-t-0 lg:pt-0"
							: ""
					}`}
				>
					<p className="product-detail__vendor">{vendor}</p>

					<h3 className="product-detail__title">{title}</h3>

					<p className="product-detail__price">
						{price}
						<span className="product-detail__currency"> {currency}</span>
					</p>

					<div className="product-detail__description">
						{description.map((paragraph, i) => (
							<p key={i} className="product-detail__description-p">
								<FormattedText text={paragraph} />
							</p>
						))}
					</div>

					{details.length > 0 ? (
						<dl className="product-detail__specs">
							{details.map(({ label, value }) => (
								<div key={label} className="product-detail__spec-row">
									<dt className="product-detail__spec-label">{label}</dt>
									<dd className="product-detail__spec-value">{value}</dd>
								</div>
							))}
						</dl>
					) : null}

					<div className="product-detail__actions">
						<a
							href={orderFormUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="focus-ring product-detail__order-btn"
						>
							{orderFormLabel}
						</a>
						<SocialIconLink
							href={instagramUrl}
							image={socialPlatformIcons.instagram}
							label={instagramLabel}
							caption="Instagram"
							boxed
						/>
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
		<section className="mb-4" aria-labelledby="pohhu-heading">
			<h2 id="pohhu-heading" className="mb-8 text-center">
				<span className="sr-only">$.pohhu¥</span>
				<span className="block">
					<PohhuLogoReveal />
				</span>
				<p className="pohhu-tagline-reveal mt-4 font-heading text-base font-semibold uppercase tracking-[0.2em] md:text-lg md:tracking-[0.24em]">
					<span className="pohhu-tagline-reveal__text">
						will take over the world
					</span>
				</p>
			</h2>

			<KevilniusMerchBlock />

			<SectionDivider label="Manifesto" className="mb-8 mt-0" />

			<div className="prose-readable mb-10">
				{pohhuManifestoBeforeCore.map((paragraph, i) => (
					<ManifestoParagraph key={`before-${i}`} text={paragraph} />
				))}

				<ManifestoParagraph text={pohhuFoundingCoreIntro} />
				<ul className="mb-4 ml-4 list-disc space-y-1.5 text-base md:text-lg text-secondary marker:text-violet-400/70">
					{pohhuFoundingCore.map(member => (
						<li key={member} className="leading-relaxed pl-1">
							<FormattedText text={member} />
						</li>
					))}
				</ul>

				{pohhuManifestoAfterCore.map((paragraph, i) => (
					<ManifestoParagraph key={`after-${i}`} text={paragraph} />
				))}

				<ManifestoPullquote text={pohhuManifestoPullquote} />

				{pohhuManifestoClosing.map((paragraph, i) => (
					<ManifestoParagraph key={`close-${i}`} text={paragraph} />
				))}
			</div>

			<div className="mb-10">
				<article
					id="pohhu-aleksandri-pub"
					className="scroll-anchor overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60"
				>
					<div className="border-b border-slate-800/90 px-5 py-4 md:px-6">
						<p className="font-bold text-2xl text-white md:text-3xl">
							{aleksandriPub.title}
						</p>
						<p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-subtle">
							{aleksandriPub.subtitle}
						</p>
					</div>
					<div className="prose-readable px-5 py-4 md:px-6">
						<ManifestoParagraph text={aleksandriPub.body} />
						<p className="mb-0">
							<a
								href={aleksandriPub.mapUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="focus-ring text-sm font-bold text-violet-400 border-b border-violet-400/30 hover:border-violet-300 transition-colors"
							>
								{aleksandriPub.mapLinkLabel} →
							</a>
						</p>
					</div>
				</article>
			</div>

			<SectionDivider
				label={pohhuPhysicalMediaDivider}
				className="mt-10 mb-8"
				ariaLabel="Our dedication to physical media"
			/>

			<h3
				id="pohhu-funded-releases"
				className={`${sectionHeadingClass} uppercase tracking-[0.12em]`}
			>
				{pohhuFundedReleasesTitle}
			</h3>
			<div className="prose-readable mb-6">
				{pohhuFundedReleasesIntro.map((paragraph, i) => (
					<ManifestoParagraph key={`releases-intro-${i}`} text={paragraph} />
				))}
			</div>
			<div className="prose-readable mb-8">
				{pohhuFundingModel.map((paragraph, i) => (
					<ManifestoParagraph key={`funding-model-${i}`} text={paragraph} />
				))}
			</div>

			<div className="mb-12">
				<h4 id="pohhu-963-records" className={subsectionHeadingClass}>
					<FormattedText text={pohhuFundedReleasesSubsectionTitle} />
				</h4>
				<ul className="grid gap-4 md:grid-cols-2">
					{fundedReleases.map(release => (
						<FundedReleaseCard key={release.title} release={release} />
					))}
				</ul>
			</div>

			<div id="pohhu-exhibitions-events" className="scroll-anchor">
				<SectionDivider
					label={pohhuExhibitionsEventsDivider}
					className="mt-4 mb-8"
					ariaLabel="Exhibitions and events"
				/>
			</div>

			<div className="mb-12">
				<h4 id="pohhu-kivi-art-show" className={subsectionHeadingClass}>
					<FormattedText text={kiviArtShow.title} />
				</h4>
				<div className="prose-readable mb-5">
					{kiviArtShow.paragraphs.map((paragraph, i) => (
						<ManifestoParagraph key={`kivi-${i}`} text={paragraph} />
					))}
				</div>
				<ImageLightboxGallery
					items={kiviArtShow.gallery}
					dialogLabel="Kivi Baar art show gallery"
					bannerFooter={<KiviBaarSocialLinks links={kiviArtShow.links} />}
					photosStartLabel={kiviArtShow.photosSectionLabel}
				/>
			</div>

			<SectionDivider
				label={pohhuLineupDivider}
				className="mt-4 mb-8"
				ariaLabel="Our lineup"
			/>

			<h3 id="pohhu-certified-artists" className={sectionHeadingClass}>
				<span className="text-violet-400">$.pohhu¥</span> Certified Artists
			</h3>

			<div className="space-y-6">
				{certifiedArtists.map(profile => (
					<CertifiedArtistCard
						key={profile.spotifyId}
						profile={profile}
						artist={artistMeta.artists[profile.spotifyId]}
					/>
				))}
			</div>
		</section>
	);
}
