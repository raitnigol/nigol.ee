import { useEffect, useState } from "preact/hooks";

import { copypastas } from "../data/copypastas";
import { COPYPASTA_LAST_ID_KEY, pickCopypasta } from "../lib/copypasta";

export function CopypastaBlock() {
	const [paragraphs, setParagraphs] = useState<string[] | null>(null);

	useEffect(() => {
		const lastId = sessionStorage.getItem(COPYPASTA_LAST_ID_KEY);
		const picked = pickCopypasta(copypastas, lastId);
		sessionStorage.setItem(COPYPASTA_LAST_ID_KEY, picked.id);
		setParagraphs(picked.paragraphs);
	}, []);

	if (!paragraphs) {
		return (
			<blockquote
				className="prose-readable border-l-2 border-slate-700 pl-4 text-base leading-relaxed text-gray-400 md:text-lg"
				aria-hidden
			>
				<p className="invisible">Loading</p>
			</blockquote>
		);
	}

	return (
		<blockquote className="prose-readable border-l-2 border-slate-700 pl-4 text-base leading-relaxed text-gray-400 md:text-lg">
			{paragraphs.map((paragraph, i) => (
				<p key={i} className={i > 0 ? "mt-4" : undefined}>
					{paragraph}
				</p>
			))}
		</blockquote>
	);
}
