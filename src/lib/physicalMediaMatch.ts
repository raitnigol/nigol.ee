import {
	listedPhysicalMediaCollection,
	physicalMediaCollection,
	type PhysicalMediaItem
} from "../data/physicalMedia";

export function findOwnedPhysicalMedia(
	spotifyAlbumId: string | null | undefined
): PhysicalMediaItem | undefined {
	if (!spotifyAlbumId) return undefined;

	return physicalMediaCollection.find(
		item => item.spotifyAlbumId === spotifyAlbumId
	);
}

export function getListedPhysicalMediaIndex(id: string): number {
	return listedPhysicalMediaCollection.findIndex(item => item.id === id);
}

export function physicalMediaAlbumHref(id: string): string {
	return `/physical-media#${id}`;
}

export function getPhysicalMediaIdFromHash(hash: string): string | null {
	if (!hash.startsWith("#")) return null;

	const id = hash.slice(1);
	if (!id) return null;

	return listedPhysicalMediaCollection.some(item => item.id === id) ? id : null;
}
