import { getPublishedArtwork } from "../../../../lib/publishedCollection";

export const dynamic = "force-dynamic";

export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	return getPublishedArtwork((await context.params).id);
}
