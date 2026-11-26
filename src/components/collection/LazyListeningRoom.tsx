"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import type { PublishedRecord } from "../../lib/publishedRecord";

const ListeningRoom = dynamic(
	() => import("./ListeningRoom").then(module => module.ListeningRoom),
	{
		loading: () => <p role="status">Loading listening room…</p>
	}
);

export function LazyListeningRoom({ records }: { records: PublishedRecord[] }) {
	const { ref, inView } = useInView({
		rootMargin: "320px 0px",
		triggerOnce: true,
		fallbackInView: true
	});
	const [requested, setRequested] = useState(false);

	return (
		<section
			ref={ref}
			id="listening"
			className="rr-section"
			aria-labelledby="rr-listening-title"
		>
			<h2 id="rr-listening-title" className="rr-heading">
				Listening room
			</h2>
			<div className="rr-listening-content">
				{inView || requested ? (
					<ListeningRoom records={records} />
				) : (
					<button
						type="button"
						className="rr-button"
						onClick={() => setRequested(true)}
					>
						Load listening room
					</button>
				)}
			</div>
		</section>
	);
}
