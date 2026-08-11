import { useEffect } from "preact/hooks";
import { useRouter } from "next/router";

import GenericMeta from "./GenericMeta";
import { PhysicalMediaCoverflow } from "./PhysicalMediaCoverflow";
import { SpotifyListeningSection } from "./SpotifyListeningSection";
import {
	getPhysicalMediaIdFromHash,
	physicalMediaAlbumHref
} from "../lib/physicalMediaMatch";

export type PhysicalMediaViewProps = {
	/** Deep-linked album id — drives initial slide, OG, and disc-pull. */
	focusId?: string | null;
	/** Open Graph / document title overrides for album pages. */
	metaTitle?: string;
	metaDescription?: string;
	metaImage?: string;
	metaPath?: string;
};

export function PhysicalMediaView({
	focusId = null,
	metaTitle = "CD Collection",
	metaDescription = "My physical CD collection — discs I own and keep on the shelf, plus Spotify top tracks and artists.",
	metaImage,
	metaPath = "/physical-media"
}: PhysicalMediaViewProps) {
	const router = useRouter();

	// Old `#id` links → canonical path so shares get album Open Graph next time.
	useEffect(() => {
		if (focusId) return;
		const id = getPhysicalMediaIdFromHash(window.location.hash);
		if (!id) return;
		void router.replace(physicalMediaAlbumHref(id), undefined, {
			scroll: false
		});
	}, [focusId, router]);

	return (
		<>
			<GenericMeta
				title={metaTitle}
				description={metaDescription}
				path={metaPath}
				image={metaImage}
				imageWidth={metaImage ? 640 : undefined}
				imageHeight={metaImage ? 640 : undefined}
			/>

			<div className="mb-10">
				<h1 className="mb-5 font-heading text-3xl font-extrabold uppercase tracking-[0.06em] text-white md:mb-6 md:text-4xl md:tracking-[0.08em] lg:text-5xl">
					My physical CD collection
					<span
						className="mt-3 block h-px w-14 bg-violet-400/75 md:mt-4 md:w-16"
						aria-hidden
					/>
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-secondary md:text-lg">
					One of my hobbies is collecting CDs from my favourite artists. Below is
					the full catalogue of discs I own and keep on the shelf.
				</p>
			</div>

			<PhysicalMediaCoverflow
				focusId={focusId}
				syncUrl={Boolean(focusId)}
			/>

			<SpotifyListeningSection />
		</>
	);
}
