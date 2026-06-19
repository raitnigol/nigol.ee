interface SocialIconLinkProps {
	href: string;
	image: string;
	label: string;
	caption?: string;
	/** Bordered tile — pairs with adjacent merch / CTA buttons */
	boxed?: boolean;
	size?: "default" | "lg";
}

export function SocialIconLink({
	href,
	image,
	label,
	caption,
	boxed = false,
	size = "default"
}: SocialIconLinkProps) {
	const imageClassName =
		size === "lg"
			? "social-icon-link__image social-icon-link__image--lg"
			: "social-icon-link__image";

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={label}
			title={label}
			className={
				boxed
					? "social-icon-link focus-ring group inline-flex min-h-[3.375rem] min-w-[5.5rem] flex-col items-center justify-center gap-1 border border-white/20 px-5 py-2 transition hover:border-white/40"
					: "social-icon-link focus-ring group flex flex-col items-center gap-1.5"
			}
		>
			<span
				className={imageClassName}
				style={{
					WebkitMaskImage: `url(${image})`,
					maskImage: `url(${image})`
				}}
				aria-hidden
			/>
			{caption ? (
				<span className="text-[10px] font-medium text-subtle transition group-hover:text-muted">
					{caption}
				</span>
			) : null}
		</a>
	);
}
