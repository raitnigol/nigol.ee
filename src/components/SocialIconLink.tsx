import Image from "next/future/image";

interface SocialIconLinkProps {
	href: string;
	image: string;
	label: string;
	caption?: string;
	/** Bordered tile — pairs with adjacent merch / CTA buttons */
	boxed?: boolean;
}

export function SocialIconLink({
	href,
	image,
	label,
	caption,
	boxed = false
}: SocialIconLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={label}
			title={label}
			className={
				boxed
					? "focus-ring group inline-flex min-h-[3.375rem] min-w-[5.5rem] flex-col items-center justify-center gap-1 border border-white/20 px-5 py-2 transition hover:border-white/40"
					: "focus-ring group flex flex-col items-center gap-1.5"
			}
		>
			<Image
				src={image}
				alt=""
				width={64}
				height={64}
				className="h-6 w-6 opacity-90 transition group-hover:opacity-100"
			/>
			{caption ? (
				<span className="text-[10px] font-medium text-subtle transition group-hover:text-muted">
					{caption}
				</span>
			) : null}
		</a>
	);
}
