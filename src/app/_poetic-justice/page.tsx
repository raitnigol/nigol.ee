import { PoeticJusticeIndexHeader } from "../../components/PoeticJusticeView";
import {
	formatPoeticKind,
	listedPoeticWorks,
	poeticWorkHref
} from "../../data/poeticJustice";
import { pageMetadata } from "../../lib/metadata";
import PoeticWorksList from "./PoeticWorksList";

export const metadata = pageMetadata(
	"Poetic Justice",
	"Poems and rap lyrics written as a coping mechanism — open to read, share, and adapt under CC BY 4.0. Credit nigol.ee or Rait Nigol when you reuse.",
	"/poetic-justice"
);

export default function PoeticJusticeIndex() {
	const works = listedPoeticWorks.map(
		({ id, title, kind, language, blurb }) => ({
			href: poeticWorkHref(id),
			title,
			kind,
			kindLabel: formatPoeticKind(kind),
			language,
			blurb
		})
	);

	return (
		<div className="poetic-justice">
			<PoeticJusticeIndexHeader />
			<PoeticWorksList works={works} />
		</div>
	);
}
