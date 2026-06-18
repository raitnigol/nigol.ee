import {
	CollectionIcon,
	HomeIcon,
	PhotographIcon
} from "@heroicons/react/solid";
import Link from "next/link";

import ActiveLink from "./ActiveLink";

interface PageData {
	href: string;
	title: string;
	Icon?: (props: { className?: string }) => JSX.Element;
	color?: string;
}

const pages: PageData[] = [
	{
		href: "/",
		title: "Home",
		Icon: HomeIcon,
		color: "text-orange-400"
	},
	{
		href: "/music",
		title: "$.pohhu¥",
		color: "text-violet-300"
	},
	{
		href: "/physical-media",
		title: "CD Collection",
		Icon: PhotographIcon,
		color: "text-emerald-400"
	},
	{
		href: "/projects",
		title: "Projects",
		Icon: CollectionIcon,
		color: "text-blue-400"
	}
];

export default function SiteHeader() {
	return (
		<header className="site-header">
			<div className="site-shell site-header__inner">
				<Link href="/">
					<a className="site-logo focus-ring font-heading text-xl font-extrabold tracking-tighter text-white sm:text-2xl">
						nigol<span className="text-blue-400">.ee</span>
					</a>
				</Link>

				<nav
					className="site-nav"
					aria-label="Primary"
				>
					{pages.map(({ href, title, Icon, color }) => (
						<ActiveLink
							href={href}
							key={href}
							activeClass="after:inset-x-0"
							nonActiveClass="after:opacity-0 after:inset-x-1/2 hover:after:opacity-100 hover:after:inset-x-1/4"
						>
							<a
								className={`site-nav__link focus-ring relative flex items-center py-1.5 after:absolute after:bottom-0 after:h-0.5 after:rounded after:bg-white after:transition-all ${
									color ?? ""
								}`}
							>
								{title}
								{Icon ? (
									<Icon className="ml-1.5 h-4 w-4 opacity-90" />
								) : null}
							</a>
						</ActiveLink>
					))}
				</nav>
			</div>
		</header>
	);
}
