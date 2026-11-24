import { connection } from "next/server";
import { CollectionShowcase } from "../../components/collection/CollectionShowcase";
import { getPublishedCollection } from "../../lib/publishedCollection";
import { pageMetadata } from "../../lib/metadata";
import "../../styles/collection-modern.css";

export const metadata = pageMetadata(
	"$.pohhu¥ media collection",
	"Browse Rait’s CD and vinyl collection by artist, release or pressing and listen on Spotify.",
	"/physical-media"
);

export default async function PhysicalMediaPage() {
	await connection();
	const records = await getPublishedCollection();
	return <CollectionShowcase records={records} />;
}
