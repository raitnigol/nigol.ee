import Image from "next/image";
import type { ReactNode } from "react";

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
	pohhuMerchDivider,
	pohhuPhysicalMediaDivider,
	pohhuLineupDivider
} from "../data/pohhu";
import type { SpotifyArtistsMetaFile } from "../lib/spotifyArtistMeta";
import { FormattedText } from "./FormattedText";
import { ImageLightboxGallery } from "./ImageLightboxGallery";
import { MerchProductCarousel } from "./MerchProductCarousel";
import MusicChapterNav from "./MusicChapterNav";
import { MusicOpeningPhoto } from "./MusicOpeningPhoto";
import { PohhuImage } from "./PohhuImage";
import { PohhuSpotifyPlayer } from "./PohhuSpotifyPlayer";

function Paragraphs({ lines }: { lines: string[] }) {
	return lines.map(line => (
		<p key={line}>
			<FormattedText text={line} />
		</p>
	));
}

function Chapter({
	id,
	title,
	children
}: {
	id: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="collective-chapter" aria-labelledby={id}>
			<header className="collective-chapter__heading">
				<h2 id={id}>
					<FormattedText text={title} />
				</h2>
				<a
					href="#pohhu-contents"
					className="collective-back"
					aria-label="Back to music contents"
				>
					↑
				</a>
			</header>
			{children}
		</section>
	);
}

function Manifesto() {
	return (
		<Chapter id="pohhu-manifesto" title="Manifesto">
			<div className="collective-history">
				<div>
					<div className="collective-prose">
						<Paragraphs lines={pohhuManifestoBeforeCore.slice(1)} />
						<Paragraphs lines={pohhuManifestoAfterCore} />
					</div>
					<aside
						id="pohhu-aleksandri-pub"
						aria-labelledby="aleksandri-title"
						className="collective-address"
					>
						<h3 id="aleksandri-title">{aleksandriPub.title}</h3>
						<p className="collective-meta">
							{aleksandriPub.subtitle}
						</p>
						<div className="collective-prose">
							<p>
								<FormattedText text={aleksandriPub.body} />
							</p>
						</div>
						<a
							className="collective-link"
							href={aleksandriPub.mapUrl}
						>
							{aleksandriPub.mapLinkLabel}
						</a>
					</aside>
				</div>
				<aside
					className="collective-credits"
					aria-labelledby="early-lineup-heading"
				>
					<h3 id="early-lineup-heading">{pohhuFoundingCoreIntro}</h3>
					<ul className="collective-members">
						{pohhuFoundingCore.map(({ name, aliases }) => (
							<li key={name}>
								<strong>{name}</strong>
								{aliases.length > 0 && (
									<span>{aliases.join(" / ")}</span>
								)}
							</li>
						))}
					</ul>
				</aside>
			</div>
		</Chapter>
	);
}

function PhysicalReleases() {
	return (
		<Chapter id="pohhu-physical-media" title={pohhuPhysicalMediaDivider}>
			<div className="collective-discography">
				<div className="collective-prose">
					<Paragraphs lines={pohhuFundedReleasesIntro} />
					<Paragraphs lines={pohhuFundingModel} />
				</div>
				<div>
					<h3 id="pohhu-963-records" className="collective-subhead">
						<FormattedText
							text={pohhuFundedReleasesSubsectionTitle}
						/>
					</h3>
					<ul className="collective-releases">
						{fundedReleases.map(release =>
							release.banner ? (
								<li
									key={release.title}
									className="collective-release-note"
								>
									<h4>{release.title}</h4>
									{release.description && (
										<p>
											<FormattedText
												text={release.description}
											/>
										</p>
									)}
								</li>
							) : (
								<li key={release.title}>
									<a
										href={release.spotifyUrl}
										className="collective-release"
									>
										{release.coverImage && (
											<Image
												src={release.coverImage}
												width={660}
												height={660}
												alt={`${release.title} cover art`}
												sizes="auto, (min-width: 80rem) 18rem, (min-width: 60rem) 26vw, (min-width: 43rem) 28vw, (min-width: 30rem) 44vw, 6.5rem"
											/>
										)}
										<div>
											<h4>{release.title}</h4>
											<p>{release.artists}</p>
											<p className="collective-meta">
												{[
													release.releaseYear,
													release.pressRun
												]
													.filter(Boolean)
													.join(" · ")}
											</p>
										</div>
									</a>
								</li>
							)
						)}
					</ul>
				</div>
			</div>
		</Chapter>
	);
}

function Merch() {
	const merch = kevilniusMerch;
	return (
		<Chapter id="pohhu-merch" title={pohhuMerchDivider}>
			<div id="pohhu-kevilnius-merch" className="collective-product">
				<figure>
					<MerchProductCarousel
						items={merch.gallery}
						label="Kevilnius merch photos"
					/>
					<figcaption>
						Model{" "}
						<a href={merch.modelCredit.instagramUrl}>
							{merch.modelCredit.name} · @
							{merch.modelCredit.instagramHandle}
						</a>
					</figcaption>
				</figure>
				<div>
					<p className="collective-meta">{merch.vendor}</p>
					<h3 className="collective-product__title">{merch.title}</h3>
					<p className="collective-price">
						<strong>
							<span className="sr-only">Sale price </span>
							{merch.price}
							{merch.currency}
						</strong>
						<s>
							<span className="sr-only">Original price </span>
							{merch.compareAtPrice}
							{merch.currency}
						</s>
					</p>
					<div className="collective-prose">
						<Paragraphs lines={merch.description} />
					</div>
					<div className="collective-actions">
						<a
							className="collective-button"
							href={merch.orderFormUrl}
						>
							{merch.orderFormLabel}
						</a>
						<a
							className="collective-link"
							href={merch.instagramUrl}
						>
							{merch.instagramLabel}
						</a>
					</div>
					<dl className="collective-specs">
						{merch.details.map(({ label, value }) => (
							<div key={label}>
								<dt>{label}</dt>
								<dd>{value}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</Chapter>
	);
}

function Exhibition() {
	return (
		<Chapter
			id="pohhu-exhibitions-events"
			title={pohhuExhibitionsEventsDivider}
		>
			<div className="collective-exhibition">
				<div>
					<h3 id="pohhu-kivi-art-show" className="collective-subhead">
						<FormattedText text={kiviArtShow.title} />
					</h3>
					<div className="collective-prose">
						<Paragraphs lines={kiviArtShow.paragraphs} />
					</div>
					<div className="collective-event-links">
						{kiviArtShow.links.map(link => (
							<a
								className="collective-link"
								key={link.href}
								href={link.href}
								aria-label={link.label}
							>
								{link.caption}
							</a>
						))}
					</div>
				</div>
				<ImageLightboxGallery
					items={kiviArtShow.gallery}
					dialogLabel="Kivi Baar art show gallery"
				/>
			</div>
		</Chapter>
	);
}

function Lineup({ artistMeta }: { artistMeta: SpotifyArtistsMetaFile }) {
	return (
		<Chapter id="pohhu-lineup" title={pohhuLineupDivider}>
			{certifiedArtists.map(profile => {
				const artist = artistMeta.artists[profile.spotifyId];
				const url =
					artist?.spotifyUrl ??
					`https://open.spotify.com/artist/${profile.spotifyId}`;
				return (
					<article
						key={profile.spotifyId}
						className="collective-artist"
					>
						<PohhuImage
							src={profile.profileImage}
							fallback={artist?.imageUrl}
							alt={artist?.name ?? "Artist portrait"}
							sizes="auto, (min-width: 60rem) 16rem, (min-width: 40rem) 30vw, 66vw"
							className="collective-artist__portrait"
						/>
						<div>
							<h3 className="collective-subhead">
								{artist?.name ?? "Artist"}
							</h3>
							{artist?.genres.length > 0 && (
								<p className="collective-meta">
									{artist.genres.slice(0, 3).join(", ")}
								</p>
							)}
							<div className="collective-prose">
								<p>{profile.bio}</p>
							</div>
							<a className="collective-link" href={url}>
								Artist on Spotify
							</a>
							{profile.playlist && (
								<PohhuSpotifyPlayer
									title={profile.playlist.title}
									playlistId={profile.playlist.id}
								/>
							)}
						</div>
					</article>
				);
			})}
		</Chapter>
	);
}

export default function PohhuSection({
	artistMeta
}: {
	artistMeta: SpotifyArtistsMetaFile;
}) {
	return (
		<article className="collective" aria-labelledby="pohhu-heading">
			<header className="collective-intro">
				<div className="collective-intro__copy">
					<h1 id="pohhu-heading" className="pohhu-wordmark">
						$.pohhu¥
					</h1>
					<p className="collective-motto">will take over the world</p>
					<p className="collective-lede">
						<FormattedText text={pohhuManifestoBeforeCore[0]} />
					</p>
				</div>
				<figure className="collective-opening-photo">
					<div>
						<MusicOpeningPhoto />
					</div>
					<figcaption>
						<a href="#pohhu-kivi-art-show">Kivi Baar, Tartu</a>
						<time dateTime="2026-01-07">7 January 2026</time>
					</figcaption>
				</figure>
			</header>
			<div className="collective-layout">
				<MusicChapterNav />
				<div className="collective-chapters">
					<Manifesto />
					<PhysicalReleases />
					<Merch />
					<Exhibition />
					<Lineup artistMeta={artistMeta} />
				</div>
			</div>
		</article>
	);
}
