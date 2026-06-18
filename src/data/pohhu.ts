export interface FundedRelease {
	title: string;
	/** Physical release — omit for banner investment cards. */
	artists?: string;
	format?: string;
	/** English for *tiraaz* — e.g. "100 CDs", "50 cassettes". */
	pressRun?: string;
	releaseYear?: number;
	spotifyUrl?: string;
	coverImage?: string;
	/** Full-width row (spans both columns on md+). */
	banner?: boolean;
	/** Banner cards: longer body copy. Supports **bold** via plain text or use description as string. */
	description?: string;
	subtitle?: string;
	/** Payment status; removed from the site once repaid in full. */
	investmentStatus?: "not_repaid" | "partially_paid";
}

export interface CertifiedArtistPlaylist {
	/** Spotify playlist ID for embed (open.spotify.com/playlist/{id}). */
	id: string;
	title: string;
}

export interface CertifiedArtistProfile {
	spotifyId: string;
	/** Local override; falls back to Spotify artist image if missing on disk. */
	profileImage: string;
	bio: string;
	playlist?: CertifiedArtistPlaylist;
}

/** Inline markup: **bold** · *italic* · {{violet highlight}} */
export const pohhuManifestoBeforeCore: string[] = [
	"{{$.pohhu¥}} is a creative collective from **Tartu, Estonia**, built around artists, makers, friends, and people who kept making things even when there was no clear reason to expect money, attention, or permission.",
	"Founded in **late 2022**, {{$.pohhu¥}} started as a one-man army. In the beginning it was barely a collective at all. It was a name, an instinct, and a stubborn excuse to keep making things. Tracks, covers, visuals, files, discs, ideas, inside jokes, half-serious plans, and small pieces of culture that felt worth saving before anyone else had decided they mattered.",
	"The point was never to wait for the industry to notice. The point was to **act like the scene was already worth documenting**.",
	"The first real expansion came when **Kevilnius** joined in **2023**. What started as one person carrying the name slowly became a wider circle of artists and collaborators. By the end of **2024**, Kevilnius became an official core member during the formation of **Dimensional Records Estonia OÜ**, a more formal label structure created by people already moving inside the {{$.pohhu¥}} world.",
	"The easiest way to understand the structure is that {{$.pohhu¥}} is the **wider umbrella**. It is the collective, the attitude, the shared history, and the place where the different projects connect. Under that sit names like **Dimensional Records Estonia OÜ** and **’59 Records Mõisavahe**. Some parts are formal. Some parts started as jokes. Some parts became real because people actually put their time, money, work, equipment, files, covers, songs, videos, and sleep into them."
];

export const pohhuFoundingCoreIntro =
	"The **founding core** around this era included:";

export const pohhuFoundingCore: string[] = [
	"**Nigol** a.k.a. *DJ BRO*",
	"**Kevilnius**",
	"**Gustav Müürimägi** a.k.a. *Päkapikk Margus / D.J C.J*",
	"**BENA** a.k.a. *Benakanister*",
	"**Maxas Salovas** a.k.a. *DJ Jack Sandhill*",
	"**Raza** a.k.a. *Razzadinka / Plue Buni$her*",
	"**Annupannu** a.k.a. *Valium B4rbie / benz0b4by*"
];

/** Timeline and collective identity — stays in the main manifesto. */
export const pohhuManifestoAfterCore: string[] = [
	"Together, they turned {{$.pohhu¥}} from a name into something people could point at. It became a loose system of artists, aliases, releases, arguments, jokes, designs, plans, and physical objects. A **collective**, a **label family**, and a **friend group**.",
	"On **11 July 2025**, **jo$er** a.k.a. **Andri J. Hook** joined {{$.pohhu¥}} and became part of the expanding collective.",
	"As of **2026**, **Benakanister** and **Annupannu** have parted ways with {{$.pohhu¥}}. The rest of the core continues forward.",
	"Modern digital media has made it normal for art to be measured by stream counts, playlist placement, retention curves, and algorithmic obedience. The machine rewards scale, repetition, and content churn. It does not care whether something meant anything to the people who made it."
];

export const pohhuPhysicalMediaDivider = "OUR DEDICATION TO PHYSICAL MEDIA";

export const pohhuLineupDivider = "OUR LINEUP";

export const pohhuFundedReleasesTitle = "PHYSICAL RELEASES FUNDED BY $.POHHU¥";

export const pohhuFundedReleasesSubsectionTitle = "{{$.pohhu¥}} x 963 Records";

export const pohhuExhibitionsEventsDivider = "EXHIBITIONS & EVENTS";

/** How funding works and when payment badges come down. */
export const pohhuFundingModel: string[] = [
	"How we work: {{$.pohhu¥}} pays the **up-front cost** of everything and only expects to be paid that sum back.",
	"{{$.pohhu¥}} currently funds releases on a **non-profit basis** — all proceeds from sales beyond the initial investment go directly to the artists. It is up to them how they distribute it amongst themselves.",
	"Payment status notes on each release are removed once the project has been **paid in full**."
];

/** Physical media, funded releases, and artifacts — shown under the releases block. */
export const pohhuFundedReleasesIntro: string[] = [
	"{{$.pohhu¥}} operates across audio, video, design, visual culture, marketing, physical media, digital media, and whatever else needs to exist. It is not built to fit cleanly into one category. Sometimes the work is a track. Sometimes it is a tape, a disc, a cover, a video, a campaign, a website, an archive, or some physical trace that proves a moment happened.",
	"We do more than release things. We **build artifacts**. Tapes, discs, videos, visuals, campaigns, archives, digital objects, and physical media that would otherwise get buried under the feed and forgotten by next week.",
	"{{$.pohhu¥}} puts back into the scene **before there is even money to put back**. That is the stupid and beautiful part. Passion cannot be priced correctly, and it should not have to justify itself to platforms, distributors, algorithms, or dead-eyed industry logic.",
	"We believe **small artists** should still be able to leave a **large impact**. Not everything important needs to be optimized, monetized, or reduced to dashboard numbers. **Physical releases**, independent support, and scene-first thinking are how we help artists leave something behind that feels real, lasts longer, and means more than another number on a streaming platform."
];

/** Standalone pull line — avoids ** / * parser clashes. */
export const pohhuManifestoPullquote = "{{$.pohhu¥ exists against that.}}";

export const pohhuManifestoClosing: string[] = [
	"{{$.pohhu¥}} exists because someone has to **care before the algorithm does**. Someone has to burn the discs, make the covers, upload the files, save the folders, fund the dumb idea, and treat the small artist like they are **already worth documenting**."
];

export const aleksandriPub = {
	title: "Aleksandri 15",
	subtitle: "Alexandri Pubi · kesklinn, Tartu",
	body:
		"Almost in the heart of kesklinn — where core {{$.pohhu¥}} members and other significant figures in our orbit meet. Parties hosted by **Gustav Müürimägi** a.k.a. *D.J C.J*.",
	mapUrl: "https://share.google/Er2h9c2BqqFeoqCIL",
	mapLinkLabel: "Maps"
};

export type KiviSocialPlatform = "facebook" | "instagram";

export interface KiviArtShowLink {
	platform: KiviSocialPlatform;
	href: string;
	/** Accessible name / tooltip */
	label: string;
	/** Short label shown under the icon */
	caption: string;
}

export interface KiviArtShowGalleryImage {
	image: string;
	alt: string;
	/** Spans both columns on md+ (use for banner.jpg). */
	banner?: boolean;
}

export const kiviArtShow = {
	title: "Kivi Baar × {{$.pohhu¥}} Art Show",
	paragraphs: [
		"On **7 January 2026**, **Kivi Baar** let **Nigol** and **Kevilnius** display their digital art — printed out and hung across the venue.",
		"The display consisted mainly of **Kevilnius**' art pieces, whereas **Nigol** brought out only a few pieces.",
		"One piece from Nigol sold, and countless pieces from Kevilnius sold. The rest was donated to friends and family.",
		"None of this should have been possible without our friend **Tairi**, who managed the internal communication and forwarded it to us — the key that let it really happen.",
		"The gallery was open from **7 January 2026, 21:00** until the **start of February 2026**."
	],
	links: [
		{
			platform: "facebook",
			href: "https://www.facebook.com/events/1416542453257884",
			label: "Art show event on Facebook",
			caption: "Event"
		},
		{
			platform: "facebook",
			href: "https://www.facebook.com/baarikivi",
			label: "Kivi Baar on Facebook",
			caption: "Facebook"
		},
		{
			platform: "instagram",
			href: "https://www.instagram.com/baarikivi/",
			label: "Kivi Baar on Instagram",
			caption: "Instagram"
		}
	] as KiviArtShowLink[],
	/** Subtle label before the photo grid (after banner + socials). */
	photosSectionLabel: "Event photos",
	gallery: [
		{
			image: "/images/pohhu/kivi-art-show/banner.jpg",
			alt: "Kivi Baar × $.pohhu¥ art show banner",
			banner: true
		},
		{
			image: "/images/pohhu/kivi-art-show/01.jpg",
			alt: "Art show at Kivi Baar — photo 1"
		},
		{
			image: "/images/pohhu/kivi-art-show/02.jpg",
			alt: "Art show at Kivi Baar — photo 2"
		},
		{
			image: "/images/pohhu/kivi-art-show/03.jpg",
			alt: "Art show at Kivi Baar — photo 3"
		},
		{
			image: "/images/pohhu/kivi-art-show/04.jpg",
			alt: "Art show at Kivi Baar — photo 4"
		}
	] as KiviArtShowGalleryImage[]
};

export const fundedReleases: FundedRelease[] = [
	{
		artists: "Benakanister, mehkel",
		title: "12 LIITRIT",
		format: "Physical CD release",
		releaseYear: 2024,
		spotifyUrl:
			"https://open.spotify.com/album/4nAQMGAxq1RzdnYUUbtN3J",
		coverImage: "/images/pohhu/releases/12-liitrit.jpg",
		pressRun: "100 CDs",
		investmentStatus: "partially_paid"
	},
	{
		artists: "SKIZØ, Benakanister",
		title: "PÄRNU - TARTU MIXTAPE",
		format: "Cassette + sticker release",
		releaseYear: 2025,
		spotifyUrl:
			"https://open.spotify.com/track/77cu8RLW53G43WYXdFLm78",
		coverImage: "/images/pohhu/releases/parnu-tartu-mixtape.jpg",
		pressRun: "50 cassettes",
		investmentStatus: "not_repaid"
	},
	{
		banner: true,
		title: "963 Records — PÄRNU–TARTU mixtape release event",
		subtitle: "Release event · artist payments",
		description:
			"{{$.pohhu¥}} funded artist payments for the PÄRNU–TARTU mixtape release event through 963 Records.",
		investmentStatus: "not_repaid"
	}
];

export const certifiedArtists: CertifiedArtistProfile[] = [
	{
		spotifyId: "1TP2IwbXVJvlH5acCxmPZL",
		profileImage: "/images/pohhu/artists/kevilnius.jpg",
		bio: "Based in Estonia, Kevilnius emerged onto the music scene in 2018. His artistic journey began as a cascade of daydreams, which has been an inspiration for his music. Fusing his passion for cloudy/dreamy melodies mixed with trap-style production, each of his tracks is a hypnotic journey through a cybernetic dreamscape, where crystalline beats interlace with vapor trails of melody, guiding listeners into a neverending bliss.",
		playlist: {
			id: "1ppZiVsWl1qqWGUkg8HEcd",
			title: "Kevilnius × $.pohhu¥"
		}
	}
];
