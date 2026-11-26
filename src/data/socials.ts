export type SocialIcon = "github" | "facebook" | "spotify" | "reddit" | "steam" | "linkedin" | "youtube";

export interface SocialInfo {
    name: string;
    icon: SocialIcon;
    url: string;
}

export const socialPlatformIcons = {
	facebook: "/images/logos/facebook.png",
	instagram: "/images/logos/instagram.svg"
} as const;

export const socials: SocialInfo[] = [
    {
        name: "GitHub",
        icon: "github",
        url: "https://github.com/raitnigol"
    },
    {
        name: "Facebook",
        icon: "facebook",
        url: "https://facebook.com/rait.nigol"
    },
    {
        name: "Spotify",
        icon: "spotify",
        url: "https://open.spotify.com/user/1190538422"
    },
    {
        name: "Reddit",
        icon: "reddit",
        url: "https://www.reddit.com/user/xdNigol/"
    },
    {
        name: "Steam",
        icon: "steam",
        url: "https://steamcommunity.com/id/nigol_"
    },
    {
        name: "LinkedIn",
        icon: "linkedin",
        url: "https://www.linkedin.com/in/raitnigol/"
    },
    {
        name: "Youtube",
        icon: "youtube",
        url: "https://www.youtube.com/@Nigol/featured"
    },
];
