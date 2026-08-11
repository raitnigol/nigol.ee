import {
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
