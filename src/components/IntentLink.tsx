"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type Props = Pick<
	ComponentProps<typeof Link>,
	"children" | "className" | "aria-label" | "aria-current"
> & { href: string };

// Keep other pages' assets off the initial request path. Restore Next's
// normal prefetch when a visitor points at or focuses this destination.
export function IntentLink({ href, ...props }: Props) {
	const [intent, setIntent] = useState<string>();
	return (
		<Link
			{...props}
			href={href}
			prefetch={intent === href ? null : false}
			onPointerEnter={event => {
				if (event.pointerType !== "touch") setIntent(href);
			}}
			onFocus={() => setIntent(href)}
		/>
	);
}
