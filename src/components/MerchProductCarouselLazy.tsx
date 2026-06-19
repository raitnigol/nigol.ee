import dynamic from "next/dynamic";
import Image from "next/future/image";
import { useEffect, useState } from "preact/hooks";

import type { MerchCarouselImage } from "./MerchProductCarousel";

const MERCH_IMAGE_SIZES = "(min-width: 1280px) 40vw, (min-width: 1024px) 50vw, 100vw";

const MerchProductCarousel = dynamic(
	() =>
		import("./MerchProductCarousel").then(module => module.MerchProductCarousel),
	{ ssr: false }
);

function MerchCarouselStatic({ items }: { items: MerchCarouselImage[] }) {
	const first = items[0];
	if (!first) return null;

	return (
		<div className="merch-product-carousel">
			<div className="merch-product-carousel__stage">
				<Image
					src={first.image}
					alt={first.alt}
					width={800}
					height={1000}
					priority
					sizes={MERCH_IMAGE_SIZES}
					className="merch-product-carousel__img"
				/>
			</div>
		</div>
	);
}

interface MerchProductCarouselLazyProps {
	items: MerchCarouselImage[];
	dialogLabel?: string;
	autoplayMs?: number;
}

export function MerchProductCarouselLazy({
	items,
	dialogLabel,
	autoplayMs
}: MerchProductCarouselLazyProps) {
	const [showCarousel, setShowCarousel] = useState(false);

	useEffect(() => {
		setShowCarousel(true);
	}, []);

	if (!showCarousel) {
		return <MerchCarouselStatic items={items} />;
	}

	return (
		<MerchProductCarousel
			items={items}
			dialogLabel={dialogLabel}
			autoplayMs={autoplayMs}
		/>
	);
}
