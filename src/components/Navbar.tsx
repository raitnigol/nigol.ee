import { MenuIcon, XIcon } from "@heroicons/react/solid";
import TransitionLink from "./TransitionLink";
import { useRouter } from "next/router";
import { createPortal } from "preact/compat";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

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
		title: "Media Collection",
		color: "text-emerald-400"
	},
	{
		href: "/poetic-justice",
		title: "Poetic Justice",
		color: "text-rose-300"
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
						isMobile
							? "site-nav__link--active-mobile"
							: "after:inset-x-0"
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
	const [portalReady, setPortalReady] = useState(false);
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const mobileNavRef = useRef<HTMLElement>(null);

	const closeMenu = useCallback((restoreFocus = true) => {
		setMenuOpen(false);
		if (restoreFocus) {
			requestAnimationFrame(() => menuButtonRef.current?.focus());
		}
	}, []);
	const closeAfterNavigate = useCallback(() => closeMenu(false), [closeMenu]);

	useEffect(() => setPortalReady(true), []);

	useEffect(() => {
		const onRouteChange = () => setMenuOpen(false);
		router.events.on("routeChangeStart", onRouteChange);
		return () => router.events.off("routeChangeStart", onRouteChange);
	}, [router.events]);

	useEffect(() => {
		if (!menuOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const focusFrame = requestAnimationFrame(() => {
			mobileNavRef.current
				?.querySelector<HTMLAnchorElement>("a")
				?.focus();
		});

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closeMenu();
				return;
			}

			if (event.key !== "Tab") return;

			const links = Array.from(
				mobileNavRef.current?.querySelectorAll<HTMLAnchorElement>(
					"a"
				) ?? []
			);
			const first = menuButtonRef.current;
			const last = links.at(-1);
			if (!first || !last) return;

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			cancelAnimationFrame(focusFrame);
			document.body.style.overflow = previousOverflow;
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
					ref={menuButtonRef}
					type="button"
					className="site-nav__toggle focus-ring lg:hidden"
					aria-expanded={menuOpen}
					aria-controls={menuOpen ? "site-mobile-nav" : undefined}
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
				>
					{menuOpen ? (
						<XIcon className="h-6 w-6" aria-hidden />
					) : (
						<MenuIcon className="h-6 w-6" aria-hidden />
					)}
				</button>

				<nav
					className="site-nav site-nav--desktop"
					aria-label="Primary"
				>
					<NavItems variant="desktop" />
				</nav>
			</div>

			{portalReady && menuOpen
				? createPortal(
						<div className="site-header__mobile-panel lg:hidden">
							<div className="site-shell">
								<nav
									id="site-mobile-nav"
									ref={mobileNavRef}
									className="site-nav site-nav--mobile"
									aria-label="Primary"
								>
									<NavItems
										variant="mobile"
										onNavigate={closeAfterNavigate}
									/>
								</nav>
							</div>
						</div>,
						document.body
				  )
				: null}
		</header>
	);
}
