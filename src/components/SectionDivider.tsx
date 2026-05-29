interface SectionDividerProps {
	label: string;
	ariaLabel?: string;
	className?: string;
}

export function SectionDivider({
	label,
	ariaLabel,
	className = "my-10"
}: SectionDividerProps) {
	return (
		<div
			className={`flex items-center gap-3 ${className}`}
			role="separator"
			aria-label={ariaLabel ?? label}
		>
			<div className="h-px flex-1 bg-slate-800/90" />
			<span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-600">
				{label}
			</span>
			<div className="h-px flex-1 bg-slate-800/90" />
		</div>
	);
}
