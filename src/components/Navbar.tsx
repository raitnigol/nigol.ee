import {
	MenuIcon,
	XIcon
} from "@heroicons/react/solid";
import TransitionLink from "./TransitionLink";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "preact/hooks";

import ActiveLink from "./ActiveLink";

interface PageData {
	href: string;
	title: string;
	color?: string;
}

const pages: PageData[] = [
	{
		href: "/",
		title: "Home",
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
		color: "text-emerald-400"
	}
];

const linkBaseClass =
	"site-nav__link focus-ring relative flex items-center after:absolute after:bottom-0 after:h-0.5 after:rounded after:bg-white after:transition-all";

function NavItems({
	variant,
	onNavigate
}: {
	variant: "desktop" | "mobile";
	onNavigate?: () => void;
}) {
	const isMobile = variant === "mobile";

	return (
		<>
			{pages.map(({ href, title, color }) => (
				<ActiveLink
					href={href}
					key={href}
					activeClass={
						isMobile ? "site-nav__link--active-mobile" : "after:inset-x-0"
					}
					nonActiveClass={
						isMobile
							? ""
							: "after:opacity-0 after:inset-x-1/2 hover:after:opacity-100 hover:after:inset-x-1/4"
					}
				>
					<a
						className={`${linkBaseClass} ${color ?? ""} ${
							isMobile ? "site-nav__link--mobile" : "py-1.5"
						}`}
						onClick={onNavigate}
					>
						{title}
					</a>
				</ActiveLink>
			))}
		</>
	);
}

export default function SiteHeader() {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);

	const closeMenu = useCallback(() => setMenuOpen(false), []);

	useEffect(() => {
		const onRouteChange = () => setMenuOpen(false);
		router.events.on("routeChangeStart", onRouteChange);
		return () => router.events.off("routeChangeStart", onRouteChange);
	}, [router.events]);

	useEffect(() => {
		if (!menuOpen) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeMenu();
		};

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [menuOpen, closeMenu]);

	return (
		<header className="site-header">
			<div className="site-shell site-header__inner">
				<TransitionLink href="/">
					<a className="site-logo focus-ring font-heading text-xl font-extrabold tracking-tighter text-white sm:text-2xl">
						nigol<span className="text-blue-400">.ee</span>
					</a>
				</TransitionLink>

				<button
					type="button"
					className="site-nav__toggle focus-ring lg:hidden"
					aria-expanded={menuOpen}
					aria-controls="site-mobile-nav"
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					onClick={() => setMenuOpen(open => !open)}
				>
					{menuOpen ? (
						<XIcon className="h-6 w-6" aria-hidden />
					) : (
						<MenuIcon className="h-6 w-6" aria-hidden />
					)}
				</button>

				<nav className="site-nav site-nav--desktop" aria-label="Primary">
					<NavItems variant="desktop" />
				</nav>
			</div>

			{menuOpen ? (
				<div className="site-shell site-header__mobile-panel lg:hidden">
					<nav
						id="site-mobile-nav"
						className="site-nav site-nav--mobile"
						aria-label="Primary"
					>
						<NavItems variant="mobile" onNavigate={closeMenu} />
					</nav>
				</div>
			) : null}
		</header>
	);
}
