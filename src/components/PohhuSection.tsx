import Image from "next/future/image";
import { useEffect, useState } from "preact/hooks";

import {
	certifiedArtists,
	collectionPhotos,
	fundedReleases,
	kiviArtShow,
	pohhuFundedReleasesIntro,
	pohhuFoundingCore,
	pohhuFoundingCoreIntro,
	pohhuManifestoAfterCore,
	pohhuManifestoBeforeCore,
	pohhuManifestoClosing,
	pohhuManifestoPullquote,
	type CertifiedArtistProfile,
	type CollectionPhoto,
	type FundedRelease,
	type KiviArtShowGalleryImage
} from "../data/pohhu";
import { FormattedText } from "./FormattedText";
import { getArtistImageUrl } from "../lib/spotify";
import type { SpotifyArtistResponseSuccess } from "../pages/api/spotifyArtist";

function formatFollowers(count: number) {
	return new Intl.NumberFormat("en-US").format(count);
}

function ManifestoParagraph({ text }: { text: string }) {
	return (
		<p className="mb-4 text-base md:text-lg text-gray-300 leading-relaxed">
			<FormattedText text={text} />
		</p>
	);
}

function ManifestoPullquote({ text }: { text: string }) {
	return (
		<p className="my-6 border-l-2 border-violet-500/50 pl-4 text-lg md:text-xl font-semibold leading-snug">
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
				className={`flex h-full w-full items-center justify-center bg-slate-800 text-xs font-bold uppercase tracking-wider text-gray-600 ${className ?? ""}`}
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
			className={className}
			onError={() => setFailed(true)}
		/>
	);
}

function FundedReleaseCard({ release }: { release: FundedRelease }) {
	return (
		<li>
			<a
				href={release.spotifyUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="group block h-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 transition hover:border-violet-500/35 hover:bg-slate-900/80"
			>
				<div className="relative aspect-square w-full bg-slate-900 ring-1 ring-inset ring-white/5">
					<LocalCoverImage
						src={release.coverImage}
						alt={`${release.title} cover art`}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="px-4 py-3">
					<span className="text-xs font-bold uppercase tracking-wider text-violet-400">
						{release.releaseYear}
					</span>
					<p className="mt-1 text-sm font-bold text-white transition group-hover:text-violet-300">
						{release.title}
					</p>
					<p className="mt-1 text-xs text-gray-400">{release.artists}</p>
					<p className="mt-1 text-xs text-gray-500">{release.format}</p>
				</div>
			</a>
		</li>
	);
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm font-bold text-violet-300 transition hover:border-violet-500/40 hover:bg-slate-900 hover:text-violet-200"
		>
			{label} →
		</a>
	);
}

function KiviArtShowGalleryItem({ item }: { item: KiviArtShowGalleryImage }) {
	return (
		<li className={item.banner ? "md:col-span-2" : undefined}>
			<div
				className={`overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 ring-1 ring-inset ring-white/5 ${
					item.banner ? "relative aspect-[2/1] w-full" : "relative aspect-square w-full"
				}`}
			>
				<LocalCoverImage
					src={item.image}
					alt={item.alt}
					className="h-full w-full object-cover"
				/>
			</div>
		</li>
	);
}

function CollectionPhotoCard({ photo }: { photo: CollectionPhoto }) {
	if (photo.placeholder) {
		return (
			<li aria-hidden>
				<div className="aspect-square w-full rounded-xl border border-dashed border-slate-700/80 bg-slate-950/30" />
			</li>
		);
	}

	return (
		<li>
			<article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
				<div className="relative aspect-square w-full bg-slate-900 ring-1 ring-inset ring-white/5">
					{photo.image ? (
						<LocalCoverImage
							src={photo.image}
							alt={photo.title}
							className="h-full w-full object-cover"
						/>
					) : null}
				</div>
				{(photo.title || photo.description) && (
					<div className="px-4 py-3">
						{photo.title ? (
							<p className="text-sm font-bold text-white">{photo.title}</p>
						) : null}
						{photo.description ? (
							<p className="mt-1 text-xs text-gray-400">
								{photo.description}
							</p>
						) : null}
					</div>
				)}
			</article>
		</li>
	);
}

function CertifiedArtistCard({ profile }: { profile: CertifiedArtistProfile }) {
	const [artist, setArtist] = useState<SpotifyArtistResponseSuccess | null>(
		null
	);

	useEffect(() => {
		fetch(`/api/spotifyArtist?id=${profile.spotifyId}`)
			.then(res => res.json())
			.then(data => {
				if (data.error) return;
				setArtist(data);
			})
			.catch(console.error);
	}, [profile.spotifyId]);

	const spotifyImageUrl = getArtistImageUrl(artist);
	const [photoSrc, setPhotoSrc] = useState(profile.profileImage);

	useEffect(() => {
		setPhotoSrc(profile.profileImage);
	}, [profile.profileImage]);

	const spotifyUrl =
		artist?.external_urls.spotify ??
		`https://open.spotify.com/artist/${profile.spotifyId}`;

	const handlePhotoError = () => {
		if (photoSrc === profile.profileImage && spotifyImageUrl) {
			setPhotoSrc(spotifyImageUrl);
		}
	};

	const imageSrc = photoSrc || spotifyImageUrl;
	const useSpotifyCdn = imageSrc?.startsWith("http") ?? false;

	return (
		<article className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
			<div className="flex flex-col md:flex-row md:items-stretch">
				<div className="relative aspect-square w-full md:w-56 lg:w-64 flex-shrink-0 overflow-hidden bg-slate-900">
					{imageSrc ? (
						<Image
							src={imageSrc}
							alt={artist?.name ?? "Artist"}
							width={512}
							height={512}
							unoptimized={useSpotifyCdn}
							className="h-full w-full object-cover"
							onError={handlePhotoError}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center animate-pulse bg-slate-900 text-gray-600">
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
								className="text-white border-b border-transparent hover:border-violet-400 transition-colors"
							>
								{artist?.name ?? "…"}
							</a>
						</h4>
						{artist ? (
							<p className="mt-2 text-sm text-gray-400">
								<span className="text-gray-300">
									{formatFollowers(artist.followers.total)}
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

					<p className="text-base leading-relaxed text-gray-300 mb-5">
						{profile.bio}
					</p>

					<a
						href={spotifyUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="mt-5 inline-flex w-fit items-center text-sm font-bold text-violet-400 border-b border-violet-400/30 hover:border-violet-300 transition-colors"
					>
						Open on Spotify →
					</a>
				</div>
			</div>
		</article>
	);
}

export default function PohhuSection() {
	return (
		<section className="mb-4" aria-labelledby="pohhu-heading">
			<h2 id="pohhu-heading" className="mb-8 text-center">
				<span className="block font-heading text-5xl font-extrabold tracking-tighter text-violet-400 md:text-6xl">
					$.pohhu¥
				</span>
				<p className="mt-4 font-heading text-base font-semibold uppercase tracking-[0.2em] text-gray-200 md:text-lg md:tracking-[0.24em]">
					will take over the world
				</p>
			</h2>

			<div className="mb-10 max-w-none">
				{pohhuManifestoBeforeCore.map((paragraph, i) => (
					<ManifestoParagraph key={`before-${i}`} text={paragraph} />
				))}

				<ManifestoParagraph text={pohhuFoundingCoreIntro} />
				<ul className="mb-4 ml-4 list-disc space-y-1.5 text-base md:text-lg text-gray-300 marker:text-violet-400/70">
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

			<h3 className="mb-5 mt-10 font-bold text-xl md:text-2xl uppercase tracking-[0.12em] text-white">
				$.POHHU¥ FUNDED RELEASES IN ESTONIA
			</h3>
			<div className="mb-6 max-w-none">
				{pohhuFundedReleasesIntro.map((paragraph, i) => (
					<ManifestoParagraph key={`releases-intro-${i}`} text={paragraph} />
				))}
			</div>
			<ul className="mb-12 grid gap-4 md:grid-cols-2">
				{fundedReleases.map(release => (
					<FundedReleaseCard key={release.spotifyUrl} release={release} />
				))}
			</ul>

			<h4 className="mb-5 font-bold text-lg md:text-xl text-white">
				<FormattedText text={kiviArtShow.title} />
			</h4>
			<div className="mb-5 max-w-none">
				{kiviArtShow.paragraphs.map((paragraph, i) => (
					<ManifestoParagraph key={`kivi-${i}`} text={paragraph} />
				))}
			</div>
			<div className="mb-8 flex flex-wrap gap-3">
				{kiviArtShow.links.map(link => (
					<ExternalLinkButton
						key={link.href}
						href={link.href}
						label={link.label}
					/>
				))}
			</div>
			<ul className="mb-10 grid gap-4 md:grid-cols-2">
				{kiviArtShow.gallery.map(item => (
					<KiviArtShowGalleryItem key={item.image} item={item} />
				))}
			</ul>

			<h3 className="mb-5 mt-4 font-bold text-xl md:text-2xl uppercase tracking-[0.12em] text-gray-400">
				Photos
			</h3>
			<ul className="mb-10 grid gap-4 md:grid-cols-2">
				{collectionPhotos.map((photo, i) => (
					<CollectionPhotoCard
						key={photo.placeholder ? `placeholder-${i}` : photo.image}
						photo={photo}
					/>
				))}
			</ul>

			<h3 className="font-bold text-2xl md:text-3xl mb-5 text-white">
				<span className="text-violet-400">$.pohhu¥</span> Certified Artists
			</h3>

			<div className="space-y-6">
				{certifiedArtists.map(profile => (
					<CertifiedArtistCard
						key={profile.spotifyId}
						profile={profile}
					/>
				))}
			</div>
		</section>
	);
}
