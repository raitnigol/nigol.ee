import Image from "next/future/image";

interface SocialIconLinkProps {
	href: string;
	image: string;
	label: string;
	caption?: string;
}

export function SocialIconLink({
	href,
	image,
	label,
	caption
}: SocialIconLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={label}
			title={label}
			className="focus-ring group flex flex-col items-center gap-1.5"
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
