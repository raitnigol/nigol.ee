export interface StackIconItem {
	name: string;
	icon: string;
	src?: never;
}

export interface StackCustomItem {
	name: string;
	icon?: never;
	src: string;
}

export interface ProjectInfo {
	name: string;
	description: React.ReactNode;
	image: string;
	url: string;
	stack: (StackIconItem | StackCustomItem)[];
}

export const projects: ProjectInfo[] = [
	{
		name: "HYPERVM-GUI",
		description:
			"A GUI written in PowerShell to manage HYPERVM Virtual Machines",
		image: "/images/projects/hypervmgui.png",
		url: "https://github.com/raitnigol/HYPERVM-GUI",
		stack: [
			{
				name: "PowerShell",
				icon: "powershell"
			}
		]
	},
	{
		name: "CLEANDESKTOP",
		description:
			"A GUI written in PowerShell to clean desktop from junk.",
		image: "/images/projects/cleandesktop_project.png",
		url: "https://github.com/raitnigol/CLEANDESKTOP-REVAMPED",
		stack: [
			{
				name: "PowerShell",
				icon: "powershell"
			}
		]
	},
	{
		name: "IHA.EE - TASUTA VIP",
		description:
			"An UserScript for Estonian erotica & dating site iha.ee to preview paid images for free.",
		image: "/images/projects/cubedhuang.webp",
		url: "https://github.com/raitnigol/IHA.EE-TASUTA-VIP",
		stack: [
			{
				name: "JavaScript",
				icon: "js"
			}
		]
	},
	{
		name: "Tartu Tänavad FiveM loading screen",
		description:
			"A FiveM loading screen that was used in my Estonian FiveM server 'Tartu Tänavad'.",
		image: "/images/projects/tartutanavad_loadingscreen_project.png",
		url: "https://github.com/raitnigol/fivem-loadingscreen",
		stack: [
			{
				name: "HTML",
				icon: "html"
			},
			{
				name: "CSS",
				icon: "css"
			},
			{
				name: "JavaScript",
				icon: "js"
			}
		]
	}
];
