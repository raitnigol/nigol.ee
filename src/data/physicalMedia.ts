export interface PhysicalMediaItem {
	id: string;
	/** Optional fallback when Spotify metadata is unavailable. */
	title?: string;
	artists?: string;
	/** Spotify album or track ID — synced via `yarn spotify:sync`. */
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
		spotifyAlbumId: "5gWn3pZ5MqGYSOjATkqNoK"
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
	},

	{
		id: "gang-starr-moment-of-truth",
		title: "Moment Of Truth",
		artists: "Gang Starr",
		spotifyAlbumId: "5f6Nz2v1DESbpu1NerEql2"
	},
	{
		id: "black-eyed-peas-the-end",
		title: "THE E.N.D. (THE ENERGY NEVER DIES)",
		artists: "Black Eyed Peas",
		spotifyAlbumId: "3lng6RAtdksQ2q02Fk5jaB"
	},
	{
		id: "eminem-music-to-be-murdered-by",
		title: "Music To Be Murdered By",
		artists: "Eminem",
		spotifyAlbumId: "4otkd9As6YaxxEkIjXPiZ6"
	},
	{
		id: "notorious-big-born-again",
		title: "Born Again",
		artists: "The Notorious B.I.G.",
		spotifyAlbumId: "43giRpsldWH8a0BamKbdu9"
	},
	{
		id: "nas-it-was-written",
		title: "It Was Written",
		artists: "Nas",
		spotifyAlbumId: "78Fgb88MY0ECc4GVMejqTg"
	},
	{
		id: "mobb-deep-the-infamous",
		title: "The Infamous",
		artists: "Mobb Deep",
		spotifyAlbumId: "1cCAb1vN8uUsdfEylVmTLs"
	},
	{
		id: "50-cent-get-rich-or-die-tryin",
		title: "Get Rich Or Die Tryin'",
		artists: "50 Cent",
		spotifyAlbumId: "5G5rgQHzdQnw32SI0WjIo5"
	},
	{
		id: "gza-liquid-swords",
		title: "Liquid Swords",
		artists: "GZA",
		spotifyAlbumId: "3k8xoyOXkGgZxUKgpmxz4P"
	},
	{
		id: "fugees-the-score",
		title: "The Score",
		artists: "Fugees",
		spotifyAlbumId: "4z6F5s3RVaOsekuaegbLfD"
	},
	{
		id: "eminem-encore",
		title: "Encore",
		artists: "Eminem",
		spotifyAlbumId: "7tsXPtLqhab1zWeubbf6JH"
	},
	{
		id: "eminem-kamikaze",
		title: "Kamikaze",
		artists: "Eminem",
		spotifyAlbumId: "3HNnxK7NgLXbDoxRZxNWiR"
	},
	{
		id: "eminem-recovery",
		title: "Recovery",
		artists: "Eminem",
		spotifyAlbumId: "47BiFcV59TQi2s9SkBo2pb"
	},
	{
		id: "travis-scott-astroworld",
		title: "ASTROWORLD",
		artists: "Travis Scott",
		spotifyAlbumId: "41GuZcammIkupMPKH2OJ6I"
	},
	{
		id: "lana-del-rey-did-you-know-that-theres-a-tunnel-under-ocean-blvd",
		title: "Did you know that there's a tunnel under Ocean Blvd",
		artists: "Lana Del Rey",
		spotifyAlbumId: "5HOHne1wzItQlIYmLXLYfZ"
	},
	{
		id: "lana-del-rey-lust-for-life",
		title: "Lust For Life",
		artists: "Lana Del Rey",
		spotifyAlbumId: "7xYiTrbTL57QO0bb4hXIKo"
	},
	{
		id: "lana-del-rey-blue-banisters",
		title: "Blue Banisters",
		artists: "Lana Del Rey",
		spotifyAlbumId: "2wwCc6fcyhp1tfY3J6Javr"
	},
	{
		id: "lana-del-rey-chemtrails-over-the-country-club",
		title: "Chemtrails Over The Country Club",
		artists: "Lana Del Rey",
		spotifyAlbumId: "6QeosPQpJckkW0Obir5RT8"
	},
	{
		id: "lana-del-rey-norman-fucking-rockwell",
		title: "Norman Fucking Rockwell!",
		artists: "Lana Del Rey",
		spotifyAlbumId: "5XpEKORZ4y6OrCZSKsi46A"
	},
	{
		id: "charli-xcx-brat-and-its-completely-different-but-also-still-brat",
		title: "Brat and it's completely different but also still brat",
		artists: "Charli xcx",
		spotifyAlbumId: "36P07bti6xD99o7S1acmin"
	},
	{
		id: "daft-punk-random-access-memories-10th-anniversary-edition",
		title: "Random Access Memories (10th Anniversary Edition)",
		artists: "Daft Punk",
		spotifyAlbumId: "4mAhdh996uW5SnnFKXUmC0"
	},
	{
		id: "tyler-the-creator-igor",
		title: "IGOR",
		artists: "Tyler, The Creator",
		spotifyAlbumId: "5zi7WsKlIiUXv09tbGLKsE"
	},
	{
		id: "mac-miller-circles",
		title: "Circles",
		artists: "Mac Miller",
		spotifyAlbumId: "5sY6UIQ32GqwMLAfSNEaXb"
	},
	{
		id: "doja-cat-scarlet",
		title: "Scarlet",
		artists: "Doja Cat",
		spotifyAlbumId: "6DmPNcfpkXBVRJsEIJY9tl"
	},
	{
		id: "mac-miller-swimming",
		title: "Swimming",
		artists: "Mac Miller",
		spotifyAlbumId: "5wtE5aLX5r7jOosmPhJhhk"
	},
	{
		id: "kanye-west-ye",
		title: "ye",
		artists: "Kanye West",
		spotifyAlbumId: "2Ek1q2haOnxVqhvVKqMvJe"
	},
	{
		id: "jay-z-kanye-west-watch-the-throne",
		title: "Watch The Throne",
		artists: "JAY-Z, Kanye West",
		spotifyAlbumId: "0OcMap99vLEeGkBCfCwRwS"
	},
	{
		id: "doja-cat-planet-her-deluxe",
		title: "Planet Her (Deluxe)",
		artists: "Doja Cat",
		spotifyAlbumId: "4XLPYMERZZaBzkJg0mkdvO"
	},
	{
		id: "xxxtentacion-question-mark",
		title: "?",
		artists: "XXXTENTACION",
		spotifyAlbumId: "2Ti79nwTsont5ZHfdxIzAm"
	},
	{
		id: "juice-wrld-legends-never-die",
		title: "Legends Never Die",
		artists: "Juice WRLD",
		spotifyAlbumId: "6n9DKpOxwifT5hOXtgLZSL"
	},
	{
		id: "juice-wrld-death-race-for-love",
		title: "Death Race For Love",
		artists: "Juice WRLD",
		spotifyAlbumId: "1GYVNOzwhx1nMcIJDogSNp"
	},
	{
		id: "xxxtentacion-skins",
		title: "SKINS",
		artists: "XXXTENTACION",
		spotifyAlbumId: "1qsQOC4Jn0fnaUZLAbs4dz"
	},
	{
		id: "pop-smoke-meet-the-woo",
		title: "Meet The Woo",
		artists: "Pop Smoke",
		spotifyAlbumId: "3PL3Of7YmQ76TzbQPrHC50"
	},
	{
		id: "playboi-carti-music",
		title: "MUSIC",
		artists: "Playboi Carti",
		spotifyAlbumId: "0fSfkmx0tdPqFYkJuNX74a"
	},
	{
		id: "playboi-carti-whole-lotta-red",
		title: "Whole Lotta Red",
		artists: "Playboi Carti",
		spotifyAlbumId: "2QRedhP5RmKJiJ1i8VgDGR"
	},
	{
		id: "playboi-carti-playboi-carti",
		title: "Playboi Carti",
		artists: "Playboi Carti",
		spotifyAlbumId: "4rJgzzfFHAVFhCSt2P4I3j"
	},
	{
		id: "mobb-deep-hell-on-earth",
		title: "Hell On Earth",
		artists: "Mobb Deep",
		spotifyAlbumId: "6BWf3fxsgSDhES4Cm4oyy5"
	},
	{
		id: "mobb-deep-murda-muzik",
		title: "Murda Muzik",
		artists: "Mobb Deep",
		spotifyAlbumId: "25NNQGZBd9oLAO1xTeq5oQ"
	},
	{
		id: "mobb-deep-infamy",
		title: "Infamy",
		artists: "Mobb Deep",
		spotifyAlbumId: "2hSnMHuLYfpp8hvdpZRjAk"
	},
	{
		id: "mobb-deep-amerikaz-nightmare",
		title: "Amerikaz Nightmare",
		artists: "Mobb Deep",
		spotifyAlbumId: "7j358KRnAMmabpFQoymvCp"
	},
	{
		id: "kanye-west-late-registration",
		title: "Late Registration",
		artists: "Kanye West",
		spotifyAlbumId: "5ll74bqtkcXlKE7wwkMq4g"
	},
	{
		id: "wu-tang-clan-enter-the-wu-tang-36-chambers",
		title: "Enter The Wu-Tang (36 Chambers)",
		artists: "Wu-Tang Clan",
		spotifyAlbumId: "0ujpvwNskNwgU6nb2krDZS"
	},
	{
		id: "wu-tang-clan-wu-tang-forever",
		title: "Wu-Tang Forever",
		artists: "Wu-Tang Clan",
		spotifyAlbumId: "4r3TaXjF2b1qwCpxjIpW43"
	},
	{
		id: "outkast-stankonia",
		title: "Stankonia",
		artists: "Outkast",
		spotifyAlbumId: "2tm3Ht61kqqRZtIYsBjxEj"
	},
	{
		id: "kendrick-lamar-mr-morale-and-the-big-steppers",
		title: "Mr. Morale & The Big Steppers",
		artists: "Kendrick Lamar",
		spotifyAlbumId: "79ONNoS4M9tfIA1mYLBYVX"
	},
	{
		id: "notorious-big-ready-to-die-10th-anniversary-edition",
		title: "Ready To Die (10th Anniversary Edition)",
		artists: "The Notorious B.I.G.",
		spotifyAlbumId: "3cn4R9wTztnrWLVf87FESr"
	},
	{
		id: "kendrick-lamar-to-pimp-a-butterfly",
		title: "To Pimp A Butterfly",
		artists: "Kendrick Lamar",
		spotifyAlbumId: "7ycBtnsMtyVbbwTfJwRjSP"
	},
	{
		id: "future-metro-boomin-we-dont-trust-you",
		title: "WE DON'T TRUST YOU",
		artists: "Future, Metro Boomin",
		spotifyAlbumId: "4iqbFIdGOTzXeDtt9owjQn"
	},
	{
		id: "tyler-the-creator-call-me-if-you-get-lost",
		title: "CALL ME IF YOU GET LOST",
		artists: "Tyler, The Creator",
		spotifyAlbumId: "45ba6QAtNrdv6Ke4MFOKk9"
	},
	{
		id: "tyler-the-creator-wolf",
		title: "Wolf",
		artists: "Tyler, The Creator",
		spotifyAlbumId: "40QTqOBBxCEIQlLNdSjFQB"
	},
	{
		id: "tyler-the-creator-flower-boy",
		title: "Flower Boy",
		artists: "Tyler, The Creator",
		spotifyAlbumId: "2nkto6YNI4rUYTLqEwWJ3o"
	},
	{
		id: "mac-miller-balloonerism",
		title: "Balloonerism",
		artists: "Mac Miller",
		spotifyAlbumId: "2ANFIaCb53iam0MBkFFoxY"
	},
	{
		id: "kendrick-lamar-damn",
		title: "DAMN.",
		artists: "Kendrick Lamar",
		spotifyAlbumId: "4eLPsYPBmXABThSJ821sqY"
	},
	{
		id: "kid-cudi-man-on-the-moon-the-end-of-day",
		title: "Man On The Moon: The End Of Day",
		artists: "Kid Cudi",
		spotifyAlbumId: "47y3PbX8oIDCkYAFylCJz0"
	},
	{
		id: "skepta-konnichiwa",
		title: "Konnichiwa",
		artists: "Skepta",
		spotifyAlbumId: "6s4vWWWxNrGcKhrOFYRZzk"
	},
	{
		id: "melanie-martinez-cry-baby-deluxe-edition",
		title: "Cry Baby (Deluxe Edition)",
		artists: "Melanie Martinez",
		spotifyAlbumId: "5JpH5T1sCYnUyZD6TM0QaY"
	}
];

export function isPhysicalMediaListed(item: PhysicalMediaItem): boolean {
	return Boolean(item.spotifyAlbumId || item.spotifyShowId);
}

/** CDs with a Spotify ID — shown in the coverflow and total count. */
export const listedPhysicalMediaCollection = physicalMediaCollection.filter(
	isPhysicalMediaListed
);
