"use client";

import { useEffect, useRef, useState } from "react";

import { COPYPASTA_LAST_ID_KEY, pickCopypasta } from "../lib/copypasta";
import { cowsay, getCowsayMaxWidth } from "../lib/cowsay";

export function CowsayTerminal({ initial }: { initial: string[] }) {
	const artRef = useRef<HTMLPreElement>(null);
	const [paragraphs, setParagraphs] = useState(initial);
	const [width, setWidth] = useState(32);

	useEffect(() => {
		const pre = artRef.current;
		if (!pre) return;

		const resize = () => setWidth(getCowsayMaxWidth(pre));
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(pre);
		let active = true;

		async function randomize() {
			const { copypastas } = await import("../data/copypastas");
			if (!active) return;
			let lastId: string | null = null;
			try {
				lastId = window.sessionStorage.getItem(COPYPASTA_LAST_ID_KEY);
			} catch {
				// Storage is optional in private browsing.
			}
			const picked = pickCopypasta(copypastas, lastId);
			setParagraphs(picked.paragraphs);
			try {
				window.sessionStorage.setItem(COPYPASTA_LAST_ID_KEY, picked.id);
			} catch {}
		}

		const nearViewport = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting)) {
					nearViewport.disconnect();
					// Keep the server-rendered entry if the additional entries fail to load.
					void randomize().catch(() => {});
				}
			},
			{ rootMargin: "400px" }
		);
		nearViewport.observe(pre);
		return () => {
			active = false;
			observer.disconnect();
			nearViewport.disconnect();
		};
	}, []);

	return (
		<blockquote className="home-terminal__cowsay">
			<pre ref={artRef} aria-hidden>
				{cowsay(paragraphs.join("\n\n"), width)}
			</pre>
			<span className="sr-only">{paragraphs.join("\n\n")}</span>
		</blockquote>
	);
}
