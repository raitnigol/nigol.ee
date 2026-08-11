import type { GetStaticPaths, GetStaticProps } from "next";

import GenericMeta from "../../components/GenericMeta";
import { PoeticWorkReading } from "../../components/PoeticJusticeView";
import {
	findPoeticWork,
	isPoeticWorkId,
	listedPoeticWorks,
	poeticWorkHref,
	type PoeticWork
} from "../../data/poeticJustice";

type PoeticWorkPageProps = {
	work: PoeticWork;
};

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: listedPoeticWorks.map(work => ({
		params: { id: work.id }
	})),
	fallback: false
});

export const getStaticProps: GetStaticProps<PoeticWorkPageProps> = async context => {
	const id = context.params?.id;
	if (typeof id !== "string" || !isPoeticWorkId(id)) {
		return { notFound: true };
	}

	const work = findPoeticWork(id);
	if (!work) {
		return { notFound: true };
	}

	return {
		props: { work }
	};
};

export default function PoeticWorkPage({ work }: PoeticWorkPageProps) {
	return (
		<>
			<GenericMeta
				title={work.title}
				description={work.blurb}
				path={poeticWorkHref(work.id)}
			/>

			<div className="poetic-justice">
				<PoeticWorkReading work={work} />
			</div>
		</>
	);
}
