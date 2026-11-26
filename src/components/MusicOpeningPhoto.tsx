import hero from "../../data/generated/musicHero.json";

const srcSet = hero.avif
	.map(image => `${image.src} ${image.width}w`)
	.join(", ");
const webpSrcSet = hero.webp
	.map(image => `${image.src} ${image.width}w`)
	.join(", ");
const fallback = hero.webp[hero.webp.length - 1];
const sizes =
	"(min-width: 85rem) 35rem, (min-width: 44rem) 40.6vw, calc(100vw - max(2rem, 5vw))";

export function MusicOpeningPhoto() {
	return (
		<>
			<link
				rel="preload"
				as="image"
				type="image/avif"
				imageSrcSet={srcSet}
				imageSizes={sizes}
				fetchPriority="high"
			/>
			<picture>
				<source type="image/avif" srcSet={srcSet} sizes={sizes} />
				<img
					src={fallback.src}
					srcSet={webpSrcSet}
					sizes={sizes}
					width={fallback.width}
					height={fallback.height}
					alt="A $.pohhu¥ tattoo in front of a print at Kivi Baar"
					fetchPriority="high"
				/>
			</picture>
		</>
	);
}
