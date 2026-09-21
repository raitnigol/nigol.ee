type PhysicalMediaSectionHeaderProps = {
	id: string;
	title: React.ReactNode;
	description?: React.ReactNode;
	meta?: string;
	level?: 1 | 2;
	variant?: "default" | "hero";
};

export function PhysicalMediaSectionHeader({
	id,
	title,
	description,
	meta,
	level = 2,
	variant = "default"
}: PhysicalMediaSectionHeaderProps) {
	return (
		<div
			className={
				variant === "hero"
					? "physical-media-section__header physical-media-section__header--hero"
					: "physical-media-section__header"
			}
		>
			<div>
				{level === 1 ? (
					<h1 id={id} className="physical-media-section__heading">
						{title}
					</h1>
				) : (
					<h2 id={id} className="physical-media-section__heading">
						{title}
					</h2>
				)}
				{description ? (
					typeof description === "string" ? (
						<p className="physical-media-section__description">
							{description}
						</p>
					) : (
						description
					)
				) : null}
			</div>

			{meta ? (
				<p className="physical-media-section__count">{meta}</p>
			) : null}
		</div>
	);
}
