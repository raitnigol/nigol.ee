"use client";

import Image from "next/image";
import { Fragment, useState, type ReactNode } from "react";

import { PohhuPhotoDialog, type Photo } from "./PohhuPhotoDialog";

interface ImageLightboxGalleryProps {
	items: (Photo & { banner?: boolean })[];
	dialogLabel: string;
	bannerFooter?: ReactNode;
	photosStartLabel?: string;
}

export function ImageLightboxGallery({
	items,
	dialogLabel,
	bannerFooter,
	photosStartLabel
}: ImageLightboxGalleryProps) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const firstPhoto = items.findIndex(item => !item.banner);

	return (
		<>
			<ul className="pohhu-event-photos">
				{items.map((item, index) => (
					<Fragment key={item.image}>
						{photosStartLabel && index === firstPhoto && (
							<li className="pohhu-event-photos__heading">
								{photosStartLabel}
							</li>
						)}
						<li
							className={
								item.banner
									? "pohhu-event-photos__banner"
									: undefined
							}
						>
							<a
								href={item.image}
								className="pohhu-event-photos__link focus-ring"
								aria-label={`Enlarge ${item.alt}`}
								aria-haspopup="dialog"
								onClick={event => {
									if (
										event.metaKey ||
										event.ctrlKey ||
										event.shiftKey ||
										event.altKey
									)
										return;
									event.preventDefault();
									setOpenIndex(index);
								}}
							>
								<Image
									src={item.image}
									alt={item.alt}
									fill
									sizes={
										item.banner
											? "(min-width: 1280px) 80rem, 95vw"
											: "(min-width: 1280px) 38rem, (min-width: 768px) 48vw, 95vw"
									}
								/>
							</a>
							{item.banner && bannerFooter && (
								<div className="mt-3">{bannerFooter}</div>
							)}
						</li>
					</Fragment>
				))}
			</ul>
			{openIndex !== null && (
				<PohhuPhotoDialog
					items={items}
					initialIndex={openIndex}
					label={dialogLabel}
					onClose={() => setOpenIndex(null)}
				/>
			)}
		</>
	);
}
