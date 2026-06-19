import {
	ChevronLeftIcon,
	ChevronRightIcon,
	XIcon
} from "@heroicons/react/solid";
import Image from "next/future/image";
import { createPortal } from "preact/compat";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/swiper-bundle.css";

const MERCH_IMAGE_SIZES = "(min-width: 1280px) 40vw, (min-width: 1024px) 50vw, 100vw";

export interface MerchCarouselImage {
	image: string;
	alt: string;
}

interface MerchProductCarouselProps {
	items: MerchCarouselImage[];
	dialogLabel?: string;
	autoplayMs?: number;
}

export function MerchProductCarousel({
	items,
	dialogLabel = "Merch photos",
	autoplayMs = 5000
}: MerchProductCarouselProps) {
	const [mounted, setMounted] = useState(false);
	const [reduceMotion, setReduceMotion] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const [portalReady, setPortalReady] = useState(false);
	const swiperRef = useRef<SwiperInstance | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const loop = items.length > 1;
	const current = openIndex !== null ? items[openIndex] : null;

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
		setMounted(true);
		setPortalReady(true);
		setReduceMotion(
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		);
	}, []);

	useEffect(() => {
		const el = containerRef.current;
		if (!el || !mounted || !loop) return;

		const onWheel = (event: WheelEvent) => {
			const swiper = swiperRef.current;
			if (!swiper) return;

			if (Math.abs(event.deltaY) < 4) return;
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

			event.preventDefault();

			if (event.deltaY > 0) swiper.slideNext();
			else swiper.slidePrev();
		};

		el.addEventListener("wheel", onWheel, { passive: false });

		return () => el.removeEventListener("wheel", onWheel);
	}, [mounted, loop]);

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

	if (items.length === 0) return null;

	const goTo = (index: number) => {
		const swiper = swiperRef.current;
		if (!swiper) return;

		if (loop) swiper.slideToLoop(index);
		else swiper.slideTo(index);
	};

	return (
		<>
			<div
				className="merch-product-carousel group/carousel"
				aria-label={dialogLabel}
				aria-roledescription="carousel"
			>
				<div ref={containerRef} className="merch-product-carousel__stage">
					{loop ? (
						<>
							<button
								type="button"
								className="merch-product-carousel__nav merch-product-carousel__nav--prev focus-ring"
								onClick={() => swiperRef.current?.slidePrev()}
								aria-label="Previous photo"
							>
								<ChevronLeftIcon className="h-6 w-6 md:h-7 md:w-7" />
							</button>
							<button
								type="button"
								className="merch-product-carousel__nav merch-product-carousel__nav--next focus-ring"
								onClick={() => swiperRef.current?.slideNext()}
								aria-label="Next photo"
							>
								<ChevronRightIcon className="h-6 w-6 md:h-7 md:w-7" />
							</button>
						</>
					) : null}

					{mounted ? (
					<Swiper
						className="merch-product-carousel__swiper"
						modules={[Autoplay, Keyboard]}
						slidesPerView={1}
						spaceBetween={0}
						loop={loop}
						grabCursor={loop}
						speed={320}
						keyboard={{ enabled: true }}
						autoplay={
							loop && !reduceMotion
								? {
										delay: autoplayMs,
										disableOnInteraction: false,
										pauseOnMouseEnter: true
								  }
								: false
						}
						onSwiper={(swiper: SwiperInstance) => {
							swiperRef.current = swiper;
						}}
						onSlideChange={(swiper: SwiperInstance) => {
							setActiveIndex(
								loop ? swiper.realIndex : swiper.activeIndex
							);
						}}
					>
						{items.map((item, index) => (
							<SwiperSlide key={item.image}>
								<button
									type="button"
									className="merch-product-carousel__slide focus-ring"
									onClick={() => setOpenIndex(index)}
									aria-label={`Open image: ${item.alt}`}
								>
									<Image
										src={item.image}
										alt={item.alt}
										width={800}
										height={1000}
										priority={index === 0}
										loading={index === 0 ? undefined : "lazy"}
										sizes={MERCH_IMAGE_SIZES}
										className="merch-product-carousel__img"
										draggable={false}
									/>
								</button>
							</SwiperSlide>
						))}
					</Swiper>
				) : (
					<button
						type="button"
						className="merch-product-carousel__slide focus-ring"
						onClick={() => setOpenIndex(0)}
						aria-label={`Open image: ${items[0].alt}`}
					>
						<Image
							src={items[0].image}
							alt={items[0].alt}
							width={800}
							height={1000}
							priority
							sizes={MERCH_IMAGE_SIZES}
							className="merch-product-carousel__img"
							draggable={false}
						/>
					</button>
				)}

				</div>

				{loop ? (
					<div
						className="merch-product-carousel__dots"
						role="tablist"
						aria-label="Photo navigation"
					>
						{items.map((item, index) => (
							<button
								key={item.image}
								type="button"
								role="tab"
								className={`merch-product-carousel__dot focus-ring${
									index === activeIndex
										? " merch-product-carousel__dot--active"
										: ""
								}`}
								aria-selected={index === activeIndex}
								aria-label={`Photo ${index + 1} of ${items.length}`}
								onClick={() => goTo(index)}
							/>
						))}
					</div>
				) : null}
			</div>

			{portalReady && openIndex !== null && current
				? createPortal(
						<div
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
							role="dialog"
							aria-modal="true"
							aria-label={dialogLabel}
							onClick={close}
						>
							<button
								type="button"
								onClick={close}
								className="focus-ring absolute right-4 top-4 z-10 rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
								aria-label="Close gallery"
							>
								<XIcon className="h-7 w-7" />
							</button>

							{items.length > 1 ? (
								<>
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
								</>
							) : null}

							<figure
								className="relative z-[1] flex max-h-[85vh] max-w-full flex-col items-center px-10 md:px-14"
								onClick={event => event.stopPropagation()}
							>
								<img
									src={current.image}
									alt={current.alt}
									width={1600}
									height={2000}
									className="max-h-[78vh] w-auto max-w-full select-none object-contain"
									draggable={false}
									decoding="async"
								/>
								{items.length > 1 ? (
									<figcaption className="mt-3 text-center text-sm text-muted">
										{openIndex + 1} / {items.length}
									</figcaption>
								) : null}
							</figure>
						</div>,
						document.body
				  )
				: null}
		</>
	);
}
