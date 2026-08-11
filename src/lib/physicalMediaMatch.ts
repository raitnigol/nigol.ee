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

export function findListedPhysicalMedia(
	id: string
): PhysicalMediaItem | undefined {
	return listedPhysicalMediaCollection.find(item => item.id === id);
}

/** Canonical shareable album URL (path-based so Open Graph crawlers can see it). */
export function physicalMediaAlbumHref(id: string): string {
	return `/physical-media/${id}`;
}

export function getPhysicalMediaIdFromHash(hash: string): string | null {
	if (!hash.startsWith("#")) return null;

	try {
		const id = decodeURIComponent(hash.slice(1));
		if (!id) return null;
		return listedPhysicalMediaCollection.some(item => item.id === id)
			? id
			: null;
	} catch {
		return null;
	}
}

export function isListedPhysicalMediaId(id: string): boolean {
	return listedPhysicalMediaCollection.some(item => item.id === id);
}
