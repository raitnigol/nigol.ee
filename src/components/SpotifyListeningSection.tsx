"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import type { ListeningHistory } from "../lib/listeningHistory";

const ListeningHistoryCharts = dynamic(() =>
	import("./ListeningHistoryCharts").then(
		module => module.ListeningHistoryCharts
	)
);

export function SpotifyListeningSection() {
	const { ref: rootRef, inView: shouldFetch } = useInView({
		rootMargin: "320px 0px",
		triggerOnce: true,
		fallbackInView: true
	});
	const [topMusic, setTopMusic] = useState<ListeningHistory | null>(null);
	const [loadFailed, setLoadFailed] = useState(false);

	useEffect(() => {
		if (!shouldFetch) return;

		const controller = new AbortController();

		fetch("/api/topMusic?view=history", { signal: controller.signal })
			.then(async response => {
				if (!response.ok) {
					throw new Error("Spotify listening data request failed");
				}
				return response.json() as Promise<ListeningHistory>;
			})
			.then(info => {
				setTopMusic(info);
			})
			.catch(error => {
				if (
					error instanceof DOMException &&
					error.name === "AbortError"
				) {
					return;
				}
				setLoadFailed(true);
			});

		return () => controller.abort();
	}, [shouldFetch]);

	return (
		<>
			<h2 id="spotify-listening-heading" className="rr-heading">
				My Spotify listening
			</h2>
			<div
				ref={rootRef}
				className={
					shouldFetch
						? "physical-media-spotify"
						: "physical-media-spotify physical-media-spotify--deferred"
				}
				aria-busy={shouldFetch && !topMusic && !loadFailed}
			>
				{loadFailed ? (
					<p
						role="status"
						className="text-base text-secondary md:text-lg"
					>
						Spotify listening data is temporarily unavailable.
					</p>
				) : (
					shouldFetch && <ListeningHistoryCharts history={topMusic} />
				)}
			</div>
		</>
	);
}
