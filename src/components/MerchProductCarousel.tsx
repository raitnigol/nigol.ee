"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { PohhuPhotoDialog, type Photo } from "./PohhuPhotoDialog";

interface MerchProductCarouselProps {
	items: Photo[];
	dialogLabel: string;
}

export function MerchProductCarousel({
	items,
	dialogLabel
}: MerchProductCarouselProps) {
	const track = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(0);
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	if (!items.length) return null;

	function showPhoto(index: number) {
		const el = track.current;
		if (!el) return;
		const next = (index + items.length) % items.length;
		el.scrollLeft = el.clientWidth * next;
		setActive(next);
		if (el.contains(document.activeElement)) {
			el.querySelectorAll<HTMLAnchorElement>("a")[next]?.focus({
				preventScroll: true
			});
		}
	}

	return (
		<>
			<div
				className="merch-product-carousel"
				role="region"
				aria-label={dialogLabel}
				aria-roledescription="carousel"
				onKeyDown={event => {
					if (
						event.key === "ArrowLeft" ||
						event.key === "ArrowRight"
					) {
						event.preventDefault();
						showPhoto(
							active + (event.key === "ArrowLeft" ? -1 : 1)
						);
					}
				}}
			>
				<div className="merch-product-carousel__stage">
					<div
						ref={track}
						className="pohhu-merch-track"
						onScroll={event => {
							const el = event.currentTarget;
							setActive(
								Math.max(
									0,
									Math.min(
										items.length - 1,
										Math.round(
											el.scrollLeft / el.clientWidth
										)
									)
								)
							);
						}}
					>
						{items.map((item, index) => (
							<a
								key={item.image}
								href={item.image}
								aria-label={`Enlarge ${item.alt}`}
								aria-haspopup="dialog"
								tabIndex={active === index ? 0 : -1}
								className="focus-ring merch-product-carousel__slide"
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
									width={1080}
									height={1440}
									sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 50vw, 95vw"
									className="merch-product-carousel__img"
									draggable={false}
								/>
							</a>
						))}
					</div>
				</div>
				{items.length > 1 && (
					<div className="pohhu-merch-controls">
						<button
							className="focus-ring"
							type="button"
							aria-label="Previous merch photo"
							onClick={() => showPhoto(active - 1)}
						>
							←
						</button>
						<span aria-live="polite" aria-atomic="true">
							{active + 1} / {items.length}
						</span>
						<button
							className="focus-ring"
							type="button"
							aria-label="Next merch photo"
							onClick={() => showPhoto(active + 1)}
						>
							→
						</button>
					</div>
				)}
			</div>
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
