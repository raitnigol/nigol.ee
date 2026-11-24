"use client";

import { useEffect, useRef, useState } from "react";

import { COPYPASTA_LAST_ID_KEY, pickCopypasta } from "../lib/copypasta";
import { cowsay, getCowsayMaxWidth } from "../lib/cowsay";

let sessionFile: Promise<string[]> | undefined;

function readCopypastaFile() {
	// Both cat and cowsay read the same file for the life of this page.
	sessionFile ??= import("../data/copypastas")
		.then(({ copypastas }) => {
			let lastId: string | null = null;
			try {
				lastId = sessionStorage.getItem(COPYPASTA_LAST_ID_KEY);
			} catch {}
			const entry = pickCopypasta(copypastas, lastId);
			try {
				sessionStorage.setItem(COPYPASTA_LAST_ID_KEY, entry.id);
			} catch {}
			return entry.paragraphs;
		})
		.catch(error => {
			sessionFile = undefined;
			throw error;
		});
	return sessionFile;
}

type CowsayProps =
	| { initial: string[]; plain?: boolean; message?: never }
	| { message: string; initial?: never; plain?: never };

export function CowsayTerminal({ initial, plain, message }: CowsayProps) {
	const pre = useRef<HTMLPreElement>(null);
	const [paragraphs, setParagraphs] = useState(initial ?? []);
	const [width, setWidth] = useState(32);

	useEffect(() => {
		if (message !== undefined) return;
		let active = true;
		void readCopypastaFile()
			.then(lines => {
				if (active) setParagraphs(lines);
			})
			.catch(() => {});
		return () => {
			active = false;
		};
	}, [message]);

	useEffect(() => {
		const element = pre.current;
		if (!element) return;
		const resize = () => setWidth(getCowsayMaxWidth(element));
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		return () => observer.disconnect();
	}, [plain]);

	if (plain) {
		return (
			<div className="home-terminal__text">
				{paragraphs.map((line, index) => (
					<p key={index}>{line}</p>
				))}
			</div>
		);
	}

	const text = message ?? paragraphs.join("\n\n");
	return (
		<div className="home-terminal__cowsay">
			<pre ref={pre} aria-hidden>
				{cowsay(text, width)}
			</pre>
			<span className="sr-only">{text}</span>
		</div>
	);
}
