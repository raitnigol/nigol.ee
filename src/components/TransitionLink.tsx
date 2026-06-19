import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { cloneElement, isValidElement } from "preact";
import type { ComponentChildren, JSX, VNode } from "preact";

import { runViewTransition } from "../lib/viewTransition";

function isModifiedClick(
	event: JSX.TargetedMouseEvent<HTMLAnchorElement>
): boolean {
	return (
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey ||
		event.button !== 0
	);
}

function isHashOnlyHref(href: string): boolean {
	return href === "" || href.startsWith("#");
}

function isExternalHref(href: string): boolean {
	return (
		href.startsWith("mailto:") ||
		href.startsWith("tel:") ||
		href.startsWith("http://") ||
		href.startsWith("https://")
	);
}

function shouldTransition(
	href: LinkProps["href"],
	target?: string
): boolean {
	if (target === "_blank") return false;

	const path = typeof href === "string" ? href : href.pathname ?? "/";

	if (isHashOnlyHref(path) || isExternalHref(path)) return false;

	return true;
}

type TransitionLinkProps = LinkProps & {
	children: ComponentChildren;
};

export default function TransitionLink({
	href,
	replace,
	children,
	...props
}: TransitionLinkProps) {
	const router = useRouter();

	if (!isValidElement(children)) {
		return (
			<Link href={href} replace={replace} {...props}>
				{children}
			</Link>
		);
	}

	const child = children as VNode<{
		onClick?: (event: JSX.TargetedMouseEvent<HTMLAnchorElement>) => void;
		target?: string;
	}>;

	return (
		<Link href={href} replace={replace} {...props}>
			{cloneElement(child, {
				onClick: (event: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
					child.props.onClick?.(event);
					if (event.defaultPrevented) return;
					if (!shouldTransition(href, (child.props as { target?: string }).target)) return;
					if (isModifiedClick(event)) return;

					event.preventDefault();

					runViewTransition(async () => {
						if (replace) await router.replace(href);
						else await router.push(href);
					});
				}
			})}
		</Link>
	);
}
