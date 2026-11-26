"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { Photo } from "./PohhuPhotoDialog";

const PohhuPhotoDialog = dynamic(() =>
	import("./PohhuPhotoDialog").then(module => module.PohhuPhotoDialog)
);

interface ImageLightboxGalleryProps {
	items: Photo[];
	dialogLabel: string;
}

export function ImageLightboxGallery({
	items,
	dialogLabel
}: ImageLightboxGalleryProps) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const posterIndex = items.findIndex(item => item.banner);

	function photoLink(item: Photo, index: number) {
		return (
			<a
				href={item.image}
				className={
					item.banner
						? "pohhu-event-photos__link pohhu-event-poster focus-ring"
						: "pohhu-event-photos__link focus-ring"
				}
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
							? "auto, (min-width: 80rem) 30rem, (min-width: 60rem) 40vw, (min-width: 46rem) 45vw, 94vw"
							: "auto, (min-width: 80rem) 15rem, (min-width: 60rem) 19vw, (min-width: 46rem) 23vw, 46vw"
					}
				/>
			</a>
		);
	}

	return (
		<>
			{posterIndex >= 0 && photoLink(items[posterIndex], posterIndex)}
			<ul className="pohhu-event-photos" aria-label="Event photos">
				{items.map(
					(item, index) =>
						index !== posterIndex && (
							<li key={item.image}>{photoLink(item, index)}</li>
						)
				)}
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
