export interface PhysicalMediaItem {
	id: string;
	/** Optional fallback when Spotify metadata is unavailable. */
	title?: string;
	artists?: string;
	/** Spotify album or track ID — metadata and cover art via `/api/physicalMedia`. */
	spotifyAlbumId?: string | null;
	/** Spotify podcast/audiobook show ID when the item is not an album. */
	spotifyShowId?: string | null;
}

export const physicalMediaCollection: PhysicalMediaItem[] = [
	{
		id: "born-to-die-paradise-edition",
		title: "Born To Die (Paradise Edition)",
		artists: "Lana Del Rey",
		spotifyAlbumId: "5VoeRuTrGhTbKelUfwymwu"
	},
	{
		id: "slim-shady-lp",
		title: "The Slim Shady LP",
		artists: "Eminem",
		spotifyAlbumId: "0vE6mttRTBXRe9rKghyr1l"
	},
	{
		id: "illmatic",
		title: "Illmatic",
		artists: "Nas",
		spotifyAlbumId: "3kEtdS2pH6hKcMU9Wioob1"
	},
	{
		id: "the-miseducation-of-lauryn-hill",
		title: "The Miseducation of Lauryn Hill",
		artists: "Lauryn Hill",
		spotifyAlbumId: "1BZoqf8Zje5nGdwZhOjAtD"
	},
	{
		id: "the-most-known-unknown",
		title: "Most Known Unknown",
		artists: "Three 6 Mafia",
		spotifyAlbumId: "0kTLdP4XPeJGsbr2L8ikyF"
	},
	{
		id: "long-live-asap",
		title: "LONG.LIVE.A$AP",
		artists: "A$AP Rocky",
		spotifyAlbumId: "6rzMufuu8sLkIizM4q9c7J"
	},
	{
		id: "at-long-last-asap",
		title: "AT.LONG.LAST.A$AP",
		artists: "A$AP Rocky",
		spotifyAlbumId: "3arNdjotCvtiiLFfjKngMc"
	},
	{
		id: "ds2",
		title: "DS2",
		artists: "Future",
		spotifyAlbumId: "0fUy6IdLHDpGNwavIlhEsl"
	},
	{
		id: "mouse-and-the-mask",
		title: "The Mouse & The Mask",
		artists: "DANGERDOOM",
		spotifyAlbumId: "1p6SQm3DKSpjkUCHcQUdz8"
	},
	{
		id: "miss-e-so-addictive",
		title: "Miss E... So Addictive",
		artists: "Missy Elliott",
		spotifyAlbumId: "20t54K6C80QQH7vbcpfJcP"
	},
	{
		id: "revival",
		title: "Revival",
		artists: "Eminem",
		spotifyAlbumId: "0U6ldwLBEMkwgfQRY4V6D2"
	},
	{
		id: "mmlp2",
		title: "The Marshall Mathers LP2",
		artists: "Eminem",
		spotifyAlbumId: "3vOgbDjgsZBAPwV2M3bNOj"
	},
	{
		id: "efil4zaggin",
		title: "Niggaz4Life",
		artists: "N.W.A",
		spotifyAlbumId: "3OSID3YChn6nOjfUAlSXQZ"
	},
	{
		id: "straight-outta-compton",
		title: "Straight Outta Compton",
		artists: "N.W.A",
		spotifyAlbumId: "0Y7qkJVZ06tS2GUCDptzyW"
	},
	{
		id: "e-1999-eternal",
		title: "E. 1999 Eternal",
		artists: "Bone Thugs-N-Harmony",
		spotifyAlbumId: "3r25XjxAmLMOhOWoV6X8N9"
	},
	{
		id: "gods-son",
		title: "God's Son",
		artists: "Nas",
		spotifyAlbumId: "3rV1aPkrWyMs6YTvTpSbIY"
	},
	{
		id: "life-after-death",
		title: "Life After Death",
		artists: "The Notorious B.I.G.",
		spotifyAlbumId: "7dRdaGSxgcBdJnrOviQRuB"
	},
	{
		id: "me-against-the-world",
		title: "Me Against the World",
		artists: "2Pac",
		spotifyAlbumId: "3OrucS4sHv6Bl9GS4rafEk"
	},
	{
		id: "violet-bent-backwards-over-the-grass",
		spotifyShowId: "3DIkc5GRg2bP8cm6UP0N65"
	},
	{
		id: "the-eminem-show",
		spotifyAlbumId: "2cWBwpqMsDJC1ZUwz813lo"
	},
	{
		id: "missy-elliott-under-construction",
		spotifyAlbumId: "6DeU398qrJ1bLuryetSmup"
	},
	{
		id: "dr-dre-2001",
		spotifyAlbumId: "7q2B4M5EiBkqrlsNW8lB7N"
	},
	{
		id: "taio-cruz-the-rokstarr-collection",
		spotifyAlbumId: "0eGvq1J5Ke7VlLLOYIlY4k"
	},
	{
		id: "vaike-pd-tagasi-objektile",
		spotifyAlbumId: "6QSFhZyYLBb6H5xqWIRtVl"
	},
	{
		id: "dido-no-angel",
		spotifyAlbumId: "7ydMeYrv8bFFRkkHepoJM4"
	},
	{
		id: "justin-bieber-my-worlds-the-collection",
		spotifyAlbumId: "4xRYS2fVx6x2Vb0MKeFjyo"
	},
	{
		id: "bad-art-pealik",
		spotifyAlbumId: "3rALdJxx6PPXbU07Mkucw0"
	},
	{
		id: "bastille-bad-blood",
		spotifyAlbumId: "64fQ94AVziavTPdnkCS6Nj"
	},
	{
		id: "ms-dynamite-a-little-deeper",
		spotifyAlbumId: "4hF66CtQgAPU6LzedAQi4V"
	},
	{
		id: "stormzy-this-is-what-i-mean",
		spotifyAlbumId: "5feRs2ejrMcxuM5hcDDSBb"
	},
	{
		id: "tennessee-ernie-ford-sixteen-tons",
		spotifyAlbumId: "0X96CJyHwoBEzSj24CISo4"
	},
	{
		id: "meghan-trainor-title",
		spotifyAlbumId: "64xzmGX1FWXy4Co4wZp7A7"
	},
	{
		id: "the-fray-how-to-save-a-life",
		spotifyAlbumId: "1IM3GwptCGYjRkzCBolyFK"
	},
	{
		id: "k-flay-solutions",
		spotifyAlbumId: "1CJDBCPg27ASz4eWE7oeNz"
	},
	{
		id: "stone-temple-pilots-thank-you",
		spotifyAlbumId: "1fyLNx6wxgDA59wFInnyup"
	},
	{
		id: "enya-a-day-without-rain",
		spotifyAlbumId: "2ioso1tqQ5zABQDVYyiUi5"
	},
	{
		id: "mckinneys-cotton-pickers",
		spotifyAlbumId: "5MyDu5gUaJ2R3tMLbh3ODC"
	},
	{
		id: "the-ink-spots-the-ultimate-collection",
		spotifyAlbumId: "0XygOuz63t6eiK2gPrXGhN"
	},
	{
		id: "warren-g-regulate-g-funk-era",
		spotifyAlbumId: "00tCy4SMjRgPKj9zay9DIk"
	},
	{
		id: "le-fabuleux-destin-damelie-poulain",
		spotifyAlbumId: "14EeFDaGuWiLwr5yD3PiWz"
	},
	{
		id: "anne-veski-lootus",
		spotifyAlbumId: "6plrzyAcOf9E5mmspBMtPn"
	},
	{
		id: "imogen-heap-ellipse",
		spotifyAlbumId: "1H8velOQ9zUFqpuQPd2bkO"
	},
	{
		id: "deftones-around-the-fur",
		spotifyAlbumId: "7o4UsmV37Sg5It2Eb7vHzu"
	},
	{
		id: "ookulm-valk-selgest-taevast",
		spotifyAlbumId: "6DkQTyNaX21BMCVlwSib62"
	},
	{
		id: "roovel-oobik-ringrada",
		spotifyAlbumId: "7faySaGaPrxVpleROgwz1F"
	},
	{
		id: "metsatoll-terast-mis-hangund-me-hinge",
		spotifyAlbumId: "2FhuzLOj04qjOk8J8kucKR"
	},
	{
		id: "untsakad-metsa-laksid-sa",
		spotifyAlbumId: "2nWoj1nEws6vh15bWUUzjo"
	},
	{
		id: "untsakad-metsa-laksid-sa-2",
		spotifyAlbumId: "4l38jpl377wnaTLXToImQF"
	},
	{
		id: "ursula-annamenou",
		spotifyAlbumId: "3R1U5p75FRuLgTZM8Wtu9q"
	},
	{
		id: "john-legend-love-in-the-future",
		spotifyAlbumId: "1aX41cQgMNeRscbLtPVt6F"
	},
	{
		id: "grimes-visions",
		spotifyAlbumId: "3HED2IUaNSnbOe88a7ZdwM"
	},
	{
		id: "erkki-hyva-varjust-rambini",
		spotifyAlbumId: "1ecl1zfy1Ehb7iaW9xUO8B"
	},
	{
		id: "the-best-of-dolly-parton",
		spotifyAlbumId: "5jTDb0T6N65C4OTKzrinRY"
	},
	{
		id: "ella-and-her-fellas-blue-skies",
		spotifyAlbumId: null
	},
	{
		id: "the-rogers-sisters-the-invisible-deck",
		spotifyAlbumId: "3BadYoqkGiOt9PYS8FIxMO"
	},
	{
		id: "tenuzu-no-chiizu-girls-like-us",
		spotifyAlbumId: null
	},
	{
		id: "will-smith-big-willie-style",
		spotifyAlbumId: "2esWeP8Ln1sXA0jbDmi3Zq"
	},
	{
		id: "billie-holiday-super-stars",
		spotifyAlbumId: null
	},
	{
		id: "shit-robot-from-the-cradle-to-the-rave",
		spotifyAlbumId: "1hSZSyYLFuJmNGWRf2ajZn"
	},
	{
		id: "lenny-kravitz-greatest-hits",
		spotifyAlbumId: "1cW0de5T5fdedlS4YqvyCv"
	},
	{
		id: "john-denver-unplugged",
		spotifyAlbumId: "1vQ86I2fyRZAYDJGsRtj96"
	},
	{
		id: "shaggy-hot-shot",
		spotifyAlbumId: "3MT88SSyxQGbqYXj4LVk3b"
	},
	{
		id: "r-kelly-public-announcement-born-into-the-90s",
		spotifyAlbumId: "0WkL3JulvpTfRsSJ7crh5S"
	},
	{
		id: "the-game-the-documentary-2",
		spotifyAlbumId: "6uQi7sMUciyWBT5alp1V2Y"
	},
	{
		id: "gigi-dagostino-tecno-fes",
		spotifyAlbumId: "6gfJJLx4XvS3AkLHFIS457"
	},
	{
		id: "estin-lennata",
		spotifyAlbumId: null
	},
	{
		id: "kutse-tantsule-14",
		spotifyAlbumId: null
	},
	{
		id: "mati-nuude-parimad-1",
		spotifyAlbumId: null
	},
	{
		id: "kutse-tantsule-2",
		spotifyAlbumId: null
	},
	{
		id: "kutse-tantsule-8",
		spotifyAlbumId: null
	},
	{
		id: "pets-ja-korsten-parimad-laulud",
		spotifyAlbumId: null
	},
	{
		id: "42go-miljonari-poeg",
		spotifyAlbumId: null
	},
	{
		id: "vaido-neigaus-yolo",
		spotifyAlbumId: "6ToB6w7dsydDwAshBOo5Sq"
	},
	{
		id: "bad-art-kriminoloogia",
		spotifyAlbumId: "5WJ5yGZHKBUd5u7W82yAC2"
	},
	{
		id: "legendaarne-records-audio-estonian-electronic-music-compilation-album",
		spotifyAlbumId: null
	},
	{
		id: "carine-jessica-ctrl-alt-del",
		spotifyAlbumId: "5qFG5RvAPC3PbVHbXWnCf9"
	},
	{
		id: "estin-esimene-lumi",
		spotifyAlbumId: "0wUrReQhmMUNwQFzCJSZvr"
	},
	{
		id: "catapulta-badminton",
		spotifyAlbumId: "1fH9kqF0pC5ah8YVNEYstc"
	},
	{
		id: "mati-nuude-75",
		spotifyAlbumId: "1GhwJCtigN7eqdNEEn2XIr"
	},
	{
		id: "marilyn-jurman-back-to-saturn",
		spotifyAlbumId: "720ViUzXxJIuvO1G3w5zor"
	},
	{
		id: "fap-vankmen",
		spotifyAlbumId: null
	},
	{
		id: "milk-maid-yucca",
		spotifyAlbumId: "1xIEEIKxHeovNz2WDEXzt2"
	},
	{
		id: "ines-kiusatus",
		spotifyAlbumId: "2UJzLg9QAkDEo2Kf5VWW5O"
	},
	{
		id: "autohitt-2009",
		spotifyAlbumId: null
	},
	{
		id: "edgar-savisaar-kaunis-maa",
		spotifyAlbumId: null
	},
	{
		id: "white-buildings-revisited",
		spotifyAlbumId: null
	},
	{
		id: "benakanister-12-liitrit",
		spotifyAlbumId: "4nAQMGAxq1RzdnYUUbtN3J"
	},
	{
		id: "pets-ja-korsten-raffa-aal",
		spotifyAlbumId: null
	},
	{
		id: "paks-matu-ja-roki-15-aastat-liiga-hilja",
		spotifyAlbumId: "3DxUydeUdVDyAK9Jbac0Y5"
	}
];

export function isPhysicalMediaListed(item: PhysicalMediaItem): boolean {
	return Boolean(item.spotifyAlbumId || item.spotifyShowId);
}

/** CDs with a Spotify ID — shown in the coverflow and total count. */
export const listedPhysicalMediaCollection = physicalMediaCollection.filter(
	isPhysicalMediaListed
);
