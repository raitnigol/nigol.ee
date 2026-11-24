"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
	{ href: "/", title: "Home", color: "text-orange-400" },
	{ href: "/music", title: "$.pohhu¥", color: "text-violet-300 signature" },
	{
		href: "/physical-media",
		title: "Media Collection",
		color: "text-emerald-400"
	},
	{ href: "/poetic-justice", title: "Poetic Justice", color: "text-rose-300" }
];

export default function SiteHeader() {
	const pathname = usePathname();
	return (
		<header className="site-header">
			<div className="site-shell site-header__inner">
				<Link
					href="/"
					aria-label="nigol.ee home"
					className="site-logo focus-ring font-heading text-xl font-extrabold tracking-tighter text-white sm:text-2xl"
				>
					nigol<span className="text-blue-400">.ee</span>
				</Link>
				<nav className="site-nav primary-nav" aria-label="Primary">
					{pages.map(({ href, title, color }) => {
						const active =
							pathname === href ||
							(href !== "/" && pathname?.startsWith(href + "/"));
						return (
							<Link
								key={href}
								href={href}
								aria-current={active ? "page" : undefined}
								className={`site-nav__link focus-ring ${color}`}
							>
								{title}
							</Link>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
