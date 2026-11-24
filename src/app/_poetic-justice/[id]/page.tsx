import { notFound } from "next/navigation";

import { PoeticWorkReading } from "../../../components/PoeticJusticeView";
import {
	findPoeticWork,
	listedPoeticWorks,
	poeticWorkHref
} from "../../../data/poeticJustice";
import { pageMetadata } from "../../../lib/metadata";

type WorkPageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return listedPoeticWorks.map(({ id }) => ({ id }));
}

async function getWork({ params }: WorkPageProps) {
	const { id } = await params;
	return findPoeticWork(id) ?? notFound();
}

export async function generateMetadata(props: WorkPageProps) {
	const work = await getWork(props);
	return pageMetadata(work.title, work.blurb, poeticWorkHref(work.id));
}

export default async function PoeticWorkPage(props: WorkPageProps) {
	const work = await getWork(props);

	return (
		<div className="poetic-justice">
			<PoeticWorkReading work={work} />
		</div>
	);
}
