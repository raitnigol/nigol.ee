interface SectionDividerProps {
	label: string;
	ariaLabel?: string;
	className?: string;
	labelClassName?: string;
}

export function SectionDivider({
	label,
	ariaLabel,
	className = "my-10",
	labelClassName = ""
}: SectionDividerProps) {
	return (
		<div
			className={`flex items-center gap-4 ${className}`}
			role="separator"
			aria-label={ariaLabel ?? label}
		>
			<div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/12 to-white/12" />
			<span
				className={`shrink-0 font-heading text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 ${labelClassName}`}
			>
				{label}
			</span>
			<div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/12 to-white/12" />
		</div>
	);
}
