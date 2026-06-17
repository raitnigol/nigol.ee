export interface PhysicalMediaItem {
	id: string;
	title: string;
	artists?: string;
	/** Square cover art — under `public/images/physical-media/covers/` */
	coverImage: string;
	/** Spotify album ID — metadata fetched live via `/api/physicalMedia`. */
	spotifyAlbumId: string;
}

export const physicalMediaCollection: PhysicalMediaItem[] = [
	{
		id: "born-to-die-paradise-edition",
		title: "Born To Die (Paradise Edition)",
		artists: "Lana Del Rey",
		coverImage:
			"/images/physical-media/covers/born-to-die-paradise-edition.jpg",
		spotifyAlbumId: "5VoeRuTrGhTbKelUfwymwu"
	},
	{
		id: "slim-shady-lp",
		title: "The Slim Shady LP",
		artists: "Eminem",
		coverImage: "/images/physical-media/covers/slim-shady-lp.jpg",
		spotifyAlbumId: "0vE6mttRTBXRe9rKghyr1l"
	},
	{
		id: "illmatic",
		title: "Illmatic",
		artists: "Nas",
		coverImage: "/images/physical-media/covers/illmatic.png",
		spotifyAlbumId: "3kEtdS2pH6hKcMU9Wioob1"
	},
	{
		id: "the-miseducation-of-lauryn-hill",
		title: "The Miseducation of Lauryn Hill",
		artists: "Lauryn Hill",
		coverImage:
			"/images/physical-media/covers/the-miseducation-of-lauryn-hill.jpg",
		spotifyAlbumId: "1BZoqf8Zje5nGdwZhOjAtD"
	},
	{
		id: "the-most-known-unknown",
		title: "Most Known Unknown",
		artists: "Three 6 Mafia",
		coverImage: "/images/physical-media/covers/the-most-known-unknown.jpg",
		spotifyAlbumId: "0kTLdP4XPeJGsbr2L8ikyF"
	},
	{
		id: "long-live-asap",
		title: "LONG.LIVE.A$AP",
		artists: "A$AP Rocky",
		coverImage: "/images/physical-media/covers/long-live-asap.jpg",
		spotifyAlbumId: "6rzMufuu8sLkIizM4q9c7J"
	},
	{
		id: "at-long-last-asap",
		title: "AT.LONG.LAST.A$AP",
		artists: "A$AP Rocky",
		coverImage: "/images/physical-media/covers/at-long-last-asap.jpg",
		spotifyAlbumId: "3arNdjotCvtiiLFfjKngMc"
	},
	{
		id: "ds2",
		title: "DS2",
		artists: "Future",
		coverImage: "/images/physical-media/covers/ds2.jpg",
		spotifyAlbumId: "0fUy6IdLHDpGNwavIlhEsl"
	}
];
