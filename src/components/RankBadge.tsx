interface RankBadgeProps {
	rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
	const isTopThree = rank <= 3;

	return (
		<span
			className={`absolute left-1.5 top-1.5 z-20 flex h-6 min-w-[1.5rem] items-center justify-center rounded-md px-1 text-xs font-bold tabular-nums shadow-sm ${
				isTopThree
					? "bg-violet-500 text-white"
					: "bg-black/80 text-white ring-1 ring-white/20"
			}`}
			aria-label={`Rank ${rank}`}
		>
			{rank}
		</span>
	);
}
