import type { GetStaticPaths, GetStaticProps } from "next";

import { PhysicalMediaView } from "../../components/PhysicalMediaView";
import {
	findListedPhysicalMedia,
	isListedPhysicalMediaId,
	physicalMediaAlbumHref
} from "../../lib/physicalMediaMatch";
import { getGeneratedAlbumMeta } from "../../lib/loadPhysicalMediaMeta";
import { DEFAULT_OG_IMAGE } from "../../lib/site";
import { listedPhysicalMediaCollection } from "../../data/physicalMedia";

type AlbumPageProps = {
	albumId: string;
	metaTitle: string;
	metaDescription: string;
	metaImage: string;
	metaPath: string;
};

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: listedPhysicalMediaCollection.map(item => ({
		params: { id: item.id }
	})),
	fallback: false
});

export const getStaticProps: GetStaticProps<AlbumPageProps> = async context => {
	const albumId = context.params?.id;
	if (typeof albumId !== "string" || !isListedPhysicalMediaId(albumId)) {
		return { notFound: true };
	}

	const item = findListedPhysicalMedia(albumId);
	const meta = getGeneratedAlbumMeta(albumId);
	const title = meta?.name ?? item?.title ?? albumId;
	const artists = meta?.artists ?? item?.artists ?? "Unknown artist";
	const year = meta?.releaseYear ? ` (${meta.releaseYear})` : "";
	const metaDescription = `${title} by ${artists}${year} — from my physical CD shelf on nigol.ee.`;
	const metaImage = meta?.coverImageUrl || DEFAULT_OG_IMAGE;

	return {
		props: {
			albumId,
			metaTitle: title,
			metaDescription,
			metaImage,
			metaPath: physicalMediaAlbumHref(albumId)
		}
	};
};

export default function PhysicalMediaAlbumPage({
	albumId,
	metaTitle,
	metaDescription,
	metaImage,
	metaPath
}: AlbumPageProps) {
	return (
		<PhysicalMediaView
			focusId={albumId}
			metaTitle={metaTitle}
			metaDescription={metaDescription}
			metaImage={metaImage}
			metaPath={metaPath}
		/>
	);
}
