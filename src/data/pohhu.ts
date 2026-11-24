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
	"{{$.pohhu¥}} is a small independent creative collective from **Tartu, Estonia**, built around friends who keep making things even when there is no clear reason to expect money, attention, or permission.",
	"Nigol started {{$.pohhu¥}} in late 2022. It was just him at first, making tracks, burning discs and putting together covers. Kevilnius joined in 2023.",
	"We still work on a *fuck around and find out* basis. If a friend makes a tape we want on our shelf, we’ll help put it out. We want the people making the music to keep control of it.",
	"By the end of 2024, Kevilnius had become a core member as Dimensional Records Estonia OÜ took shape. It’s one of the labels under {{$.pohhu¥}}, alongside ’59 Records Mõisavahe."
];

export const pohhuFoundingCoreIntro = "The early lineup";

export const pohhuFoundingCore = [
	{ name: "Nigol", aliases: ["DJ BRO"] },
	{ name: "Kevilnius", aliases: [] },
	{ name: "Gustav Müürimägi", aliases: ["Päkapikk Margus", "D.J C.J"] },
	{ name: "BENA", aliases: ["Benakanister"] },
	{ name: "Maxas Salovas", aliases: ["DJ Jack Sandhill"] },
	{ name: "Raza", aliases: ["Razzadinka", "Plue Buni$her"] },
	{ name: "Annupannu", aliases: ["Valium B4rbie"] }
];

export const pohhuManifestoAfterCore: string[] = [
	"jo$er (Andri J. Hook) joined us on 11 July 2025. As of 2026, Benakanister and Annupannu have left the collective."
];

export const pohhuPhysicalMediaDivider = "Physical media";
export const pohhuLineupDivider = "Lineup";
export const pohhuFundedReleasesSubsectionTitle = "{{$.pohhu¥}} × 963 Records";
export const pohhuExhibitionsEventsDivider = "Exhibitions & events";
export const pohhuMerchDivider = "Merch";

export const pohhuFundedReleasesIntro: string[] = [
	"Our first CD run was *12 LIITRIT* by Benakanister and mehkel, who produced the tracks. Then we helped SKIZØ and Benakanister put the *PÄRNU–TARTU* mixtape on cassette."
];

export const pohhuFundingModel: string[] = [
	"We cover the cost of a release up front and ask to get that much back. The artists keep the proceeds after costs. We joke about a 10/90 split, but if anyone wants to put something towards the next run, that’s up to them."
];

export interface MerchGalleryImage {
	image: string;
	alt: string;
	/** Wide hero — spans full row on md+ */
	banner?: boolean;
	title?: string;
}

export interface MerchProductDetail {
	label: string;
	value: string;
}

/** Shirts / merch — photos live in `public/images/pohhu/merch/` (see README there). */
export const kevilniusMerch = {
	vendor: "Kevilnius",
	title: "Artifact_01 // Project_Panther.exe",
	/** Current sale price */
	price: "30",
	/** Original / compare-at price (shown struck through) */
	compareAtPrice: "50",
	currency: "€",
	details: [
		{ label: "Blank", value: "Stanley/Stella Blaster 2.0" },
		{ label: "Fabric", value: "200 GSM · 100% cotton" },
		{ label: "Fit", value: "Heavyweight oversized boxy" },
		{ label: "Swag", value: "Infinite" }
	] as MerchProductDetail[],
	description: [
		"The box logo on Kevilnius’ first shirt comes from the cover of his single *watermelon lemonberry*. It’s a limited run.",
		"Oliver doesn’t come with the shirt."
	],
	orderFormUrl: "https://forms.gle/v5saqsBvRHETZmMz9",
	orderFormLabel: "Order the shirt",
	instagramUrl: "https://www.instagram.com/kevilnius/",
	instagramLabel: "Message on Instagram",
	modelCredit: {
		name: "Oliver Ode",
		instagramHandle: "odenaator",
		instagramUrl: "https://www.instagram.com/odenaator/"
	},
	gallery: [
		{
			image: "/images/pohhu/merch/oll_smoking.jpg",
			alt: "Oliver Ode sitting against a graffiti wall in the Artifact_01 shirt"
		},
		{
			image: "/images/pohhu/merch/oll_h6lmadlahti.jpg",
			alt: "Oliver Ode holding his jacket open to show the box logo"
		},
		{
			image: "/images/pohhu/merch/oll_next_to_wall.jpg",
			alt: "Oliver Ode with one arm raised beside green graffiti, wearing the box-logo shirt"
		},
		{
			image: "/images/pohhu/merch/oll_liputaja.jpg",
			alt: "Oliver Ode holding the sides of the shirt to show the print"
		}
	] as MerchGalleryImage[]
};

export const aleksandriPub = {
	title: "Aleksandri 15",
	subtitle: "Alexandri Pubi",
	body:
		"The pub was Gustav Müürimägi’s apartment in central Tartu. Gustav threw the parties and the rest of us kept turning up.",
	mapUrl: "https://share.google/Er2h9c2BqqFeoqCIL",
	mapLinkLabel: "View on map"
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
		"Our show at Kivi Baar opened at 21:00 on 7 January 2026 with prints of our digital work. Most were by Kevilnius. Nigol brought two of his favourites.",
		"Our friend Tairi handled the back-and-forth with the bar. The prints stayed up until early February. Most sold, and we gave the rest to friends and family."
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
	gallery: [
		{
			image: "/images/pohhu/kivi-art-show/banner.jpg",
			alt: "Purple $.pohhu¥ poster for the 7 January art show at Kivi Baar",
			banner: true
		},
		{
			image: "/images/pohhu/kivi-art-show/01.jpg",
			alt: "A $.pohhu¥ forearm tattoo beside a print at Kivi Baar"
		},
		{
			image: "/images/pohhu/kivi-art-show/02.jpg",
			alt: "A print lit purple on the wall at Kivi Baar"
		},
		{
			image: "/images/pohhu/kivi-art-show/03.jpg",
			alt: "A framed print on a pale brick wall at Kivi Baar"
		},
		{
			image: "/images/pohhu/kivi-art-show/04.jpg",
			alt: "A collage mounted on an exposed brick wall at Kivi Baar"
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
		pressRun: "100 CDs"
	},
	{
		artists: "SKIZØ, Benakanister",
		title: "PÄRNU - TARTU MIXTAPE",
		format: "Cassette + sticker release",
		releaseYear: 2025,
		spotifyUrl:
			"https://open.spotify.com/track/77cu8RLW53G43WYXdFLm78",
		coverImage: "/images/pohhu/releases/parnu-tartu-mixtape.jpg",
		pressRun: "50 cassettes + stickers"
	},
	{
		banner: true,
		title: "PÄRNU–TARTU mixtape release show",
		description:
			"We covered the artists’ fees for the show through 963 Records."
	}
];

export const certifiedArtists: CertifiedArtistProfile[] = [
	{
		spotifyId: "1TP2IwbXVJvlH5acCxmPZL",
		profileImage: "/images/pohhu/artists/kevilnius.jpg",
		bio: "Kevilnius has been making music in Estonia since 2018. He puts hazy melodies over trap drums. He joined us in 2023 and makes visual art too, including the pieces he showed at Kivi Baar.",
		playlist: {
			id: "1ppZiVsWl1qqWGUkg8HEcd",
			title: "Kevilnius × $.pohhu¥"
		}
	}
];
