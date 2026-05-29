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
			className={`flex items-center gap-3 ${className}`}
			role="separator"
			aria-label={ariaLabel ?? label}
		>
			<div className="h-px flex-1 bg-slate-800/90" />
			<span
				className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-gray-600 md:text-xs md:tracking-[0.14em] ${labelClassName}`}
			>
				{label}
			</span>
			<div className="h-px flex-1 bg-slate-800/90" />
		</div>
	);
}
