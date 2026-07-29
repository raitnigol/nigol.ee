import { EIF_URL, SITE_URL } from "./site";

export const profileSchema = {
	"@context": "https://schema.org",
	"@type": "ProfilePage",
	mainEntity: {
		"@type": "Person",
		name: "Rait Nigol",
		url: SITE_URL,
		jobTitle: "Chief Information Security Officer & System Administrator",
		worksFor: {
			"@type": "Organization",
			name: "Estonian Internet Foundation",
			url: EIF_URL
		},
		sameAs: [
			"https://github.com/raitnigol",
			"https://www.linkedin.com/in/raitnigol/",
			"https://open.spotify.com/user/1190538422"
		]
	}
} as const;
