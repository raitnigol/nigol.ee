import {
	ChevronLeftIcon,
	ChevronRightIcon,
	XIcon
} from "@heroicons/react/solid";
import Image from "next/future/image";
import type { ComponentChild } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export interface LightboxGalleryItem {
	image: string;
	alt: string;
	/** Spans both columns on md+ grid. */
	banner?: boolean;
	title?: string;
	description?: string;
}

interface ImageLightboxGalleryProps {
	items: LightboxGalleryItem[];
	className?: string;
	dialogLabel?: string;
	/** Rendered below the banner thumbnail (item with `banner: true`). */
	bannerFooter?: ComponentChild;
	/** Shown before the first non-banner image when a banner precedes photos. */
	photosStartLabel?: string;
}

const SWIPE_THRESHOLD_PX = 48;

function GalleryPhotosStartMarker({ label }: { label: string }) {
	return (
		<div
			className="flex items-center gap-3 py-1"
			aria-hidden="true"
		>
			<div className="h-px flex-1 bg-slate-800/80" />
			<span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-subtle">
				{label}
			</span>
			<div className="h-px flex-1 bg-slate-800/80" />
		</div>
	);
}

function GalleryThumbnail({
	item,
	onOpen
}: {
	item: LightboxGalleryItem;
	onOpen: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onOpen}
			className={`focus-ring group w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 text-left ring-1 ring-inset ring-white/5 transition hover:border-violet-500/35 ${
				item.banner
					? "relative aspect-[2/1] w-full"
					: "relative aspect-square w-full"
			}`}
			aria-label={`Open image: ${item.alt}`}
		>
			<Image
				src={item.image}
				alt={item.alt}
				width={800}
				height={item.banner ? 400 : 800}
				className="h-full w-full object-cover transition group-hover:brightness-110"
			/>
		</button>
	);
}

export function ImageLightboxGallery({
	items,
	className = "mb-10",
	dialogLabel = "Image gallery",
	bannerFooter,
	photosStartLabel
}: ImageLightboxGalleryProps) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const touchStartX = useRef<number | null>(null);

	const close = useCallback(() => setOpenIndex(null), []);

	const goPrev = useCallback(() => {
		setOpenIndex(index =>
			index === null ? null : (index + items.length - 1) % items.length
		);
	}, [items.length]);

	const goNext = useCallback(() => {
		setOpenIndex(index =>
			index === null ? null : (index + 1) % items.length
		);
	}, [items.length]);

	useEffect(() => {
		if (openIndex === null) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
			if (event.key === "ArrowLeft") goPrev();
			if (event.key === "ArrowRight") goNext();
		};

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [openIndex, close, goPrev, goNext]);

	const current = openIndex !== null ? items[openIndex] : null;
	const hasMultiple = items.length > 1;

	if (items.length === 0) return null;

	const firstPhotoIndex = items.findIndex(item => !item.banner);
	const hasBanner = items.some(item => item.banner);
	const showPhotosStartMarker = Boolean(photosStartLabel) && firstPhotoIndex >= 0;
	const markerBeforeIndex =
		hasBanner && firstPhotoIndex > 0 ? firstPhotoIndex : 0;

	return (
		<>
			<ul className={`grid list-none gap-4 md:grid-cols-2 ${className}`}>
				{items.flatMap((item, index) => {
					const nodes = [];

					if (showPhotosStartMarker && index === markerBeforeIndex) {
						nodes.push(
							<li key="photos-start" className="md:col-span-2">
								<GalleryPhotosStartMarker label={photosStartLabel!} />
							</li>
						);
					}

					nodes.push(
						<li
							key={item.image}
							className={item.banner ? "md:col-span-2" : undefined}
						>
							{item.title || item.description ? (
								<article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
									<div className="relative aspect-square w-full bg-slate-900 ring-1 ring-inset ring-white/5">
										<button
											type="button"
											onClick={() => setOpenIndex(index)}
											className="focus-ring group block h-full w-full cursor-zoom-in text-left"
											aria-label={`Open image: ${item.alt}`}
										>
											<Image
												src={item.image}
												alt={item.alt}
												width={800}
												height={800}
												className="h-full w-full object-cover transition group-hover:brightness-110"
											/>
										</button>
									</div>
									<div className="px-4 py-3">
										{item.title ? (
											<p className="text-sm font-bold text-white">
												{item.title}
											</p>
										) : null}
										{item.description ? (
											<p className="mt-1 text-xs text-muted">
												{item.description}
											</p>
										) : null}
									</div>
								</article>
							) : (
								<>
									<GalleryThumbnail
										item={item}
										onOpen={() => setOpenIndex(index)}
									/>
									{item.banner && bannerFooter ? (
										<div className="mt-3">{bannerFooter}</div>
									) : null}
								</>
							)}
						</li>
					);

					return nodes;
				})}
			</ul>

			{openIndex !== null && current ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm touch-pan-y"
					role="dialog"
					aria-modal="true"
					aria-label={dialogLabel}
					onClick={close}
					onTouchStart={event => {
						touchStartX.current = event.touches[0]?.clientX ?? null;
					}}
					onTouchEnd={event => {
						if (touchStartX.current === null || items.length < 2) return;

						const endX = event.changedTouches[0]?.clientX;
						if (endX === undefined) return;

						const delta = endX - touchStartX.current;
						touchStartX.current = null;

						if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
						if (delta > 0) goPrev();
						else goNext();
					}}
				>
					<button
						type="button"
						onClick={close}
						className="focus-ring absolute right-4 top-4 z-10 rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
						aria-label="Close gallery"
					>
						<XIcon className="h-7 w-7" />
					</button>

					{hasMultiple ? (
						<button
							type="button"
							onClick={event => {
								event.stopPropagation();
								goPrev();
							}}
							className="focus-ring absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white md:left-4"
							aria-label="Previous image"
						>
							<ChevronLeftIcon className="h-9 w-9 md:h-10 md:w-10" />
						</button>
					) : null}

					{hasMultiple ? (
						<button
							type="button"
							onClick={event => {
								event.stopPropagation();
								goNext();
							}}
							className="focus-ring absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white md:right-4"
							aria-label="Next image"
						>
							<ChevronRightIcon className="h-9 w-9 md:h-10 md:w-10" />
						</button>
					) : null}

					<figure
						className="relative flex max-h-[85vh] max-w-full flex-col items-center px-10 md:px-14"
						onClick={event => event.stopPropagation()}
					>
						<Image
							src={current.image}
							alt={current.alt}
							width={1600}
							height={current.banner ? 800 : 1600}
							className="max-h-[78vh] w-auto max-w-full select-none object-contain"
							draggable={false}
						/>
						<figcaption className="mt-3 max-w-lg text-center text-sm text-muted">
							{hasMultiple ? (
								<>
									{openIndex + 1} / {items.length}
									<span className="mx-2 text-subtle">·</span>
								</>
							) : null}
							{current.title ? (
								<span className="font-semibold text-secondary">
									{current.title}
								</span>
							) : (
								current.alt
							)}
							{hasMultiple ? (
								<span className="mt-2 block text-xs text-subtle md:hidden">
									Swipe to browse
								</span>
							) : null}
						</figcaption>
					</figure>
				</div>
			) : null}
		</>
	);
}
