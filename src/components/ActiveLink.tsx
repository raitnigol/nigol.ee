import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { cloneElement } from "preact";

export interface ActiveLinkProps extends LinkProps {
	children: React.ReactElement;
	activeClass: string;
	nonActiveClass?: string;
}

function linkPathname(href: ActiveLinkProps["href"]): string {
	if (typeof href === "string") {
		return href.split("#")[0] || "/";
	}
	if (typeof href === "object" && href.pathname) {
		return href.pathname.split("#")[0];
	}
	return "/";
}

export default function ActiveLink({
	children,
	href,
	activeClass,
	nonActiveClass = "",
	...props
}: ActiveLinkProps) {
	const router = useRouter();
	const isActive = router.pathname === linkPathname(href);

	return (
		<Link href={href} {...props}>
			{cloneElement(children, {
				className:
					isActive
						? children.props.className
							? `${children.props.className} ${activeClass}`
							: activeClass
						: children.props.className
						? `${children.props.className} ${nonActiveClass}`
						: nonActiveClass
			})}
		</Link>
	);
}
