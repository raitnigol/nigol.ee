interface RankBadgeProps {
	rank: number;
}

const rankStyles: Record<number, string> = {
	1: "bg-[#d4af37] text-black ring-1 ring-[#f0d878]/50",
	2: "bg-[#c0c0c0] text-black ring-1 ring-white/30",
	3: "bg-[#cd7f32] text-white ring-1 ring-[#e8a55c]/40"
};

export function RankBadge({ rank }: RankBadgeProps) {
	return (
		<span
			className={`absolute bottom-1.5 left-1.5 z-20 flex h-6 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums shadow-sm ${
				rankStyles[rank] ?? "bg-black/80 text-white ring-1 ring-white/20"
			}`}
			aria-label={`Rank ${rank}`}
		>
			#{rank}
		</span>
	);
}
