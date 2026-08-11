import { useState } from "preact/hooks";

import GenericMeta from "../../components/GenericMeta";
import {
	PoeticJusticeIndexHeader,
	PoeticWorksList
} from "../../components/PoeticJusticeView";
import {
	listedPoeticWorks,
	type PoeticWorkKind
} from "../../data/poeticJustice";

export default function PoeticJusticeIndex() {
	const [activeKind, setActiveKind] = useState<PoeticWorkKind | "all">("all");

	return (
		<>
			<GenericMeta
				title="Poetic Justice"
				description="Poems and rap lyrics written as a coping mechanism — open to read, share, and adapt under CC BY 4.0. Credit nigol.ee or Rait Nigol when you reuse."
				path="/poetic-justice"
			/>

			<div className="poetic-justice">
				<PoeticJusticeIndexHeader />
				<PoeticWorksList
					works={listedPoeticWorks}
					activeKind={activeKind}
					onKindChange={setActiveKind}
				/>
			</div>
		</>
	);
}
