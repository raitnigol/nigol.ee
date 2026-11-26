"use client";

import { useEffect, useState } from "react";

const chapters = [
	{ id: "pohhu-manifesto", label: "Manifesto" },
	{ id: "pohhu-physical-media", label: "Physical media" },
	{ id: "pohhu-merch", label: "Merch" },
	{ id: "pohhu-exhibitions-events", label: "Events" },
	{ id: "pohhu-lineup", label: "Lineup" }
];

export default function MusicChapterNav() {
	const [current, setCurrent] = useState<string>();

	useEffect(() => {
		const headings = chapters
			.map(chapter => document.getElementById(chapter.id))
			.filter((element): element is HTMLElement => element !== null);
		if (!headings.length) return;

		let frame = 0;
		function update() {
			frame = 0;
			const atEnd =
				window.scrollY > 0 &&
				window.scrollY + window.innerHeight >=
					document.documentElement.scrollHeight - 1;
			const anchorOffset =
				parseFloat(getComputedStyle(headings[0]).scrollMarginTop) || 0;
			const readingLine = Math.max(
				anchorOffset + 1,
				window.innerHeight * 0.25
			);
			let active = headings[0];
			for (const heading of headings) {
				if (!atEnd && heading.getBoundingClientRect().top > readingLine)
					break;
				active = heading;
			}
			setCurrent(active.id);
		}

		function scheduleUpdate() {
			if (!frame) frame = window.requestAnimationFrame(update);
		}

		scheduleUpdate();
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate);
		window.addEventListener("pageshow", scheduleUpdate);
		window.addEventListener("hashchange", scheduleUpdate);
		const resize = new ResizeObserver(scheduleUpdate);
		const article = headings[0].closest("article");
		if (article) resize.observe(article);

		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
			window.removeEventListener("pageshow", scheduleUpdate);
			window.removeEventListener("hashchange", scheduleUpdate);
			resize.disconnect();
		};
	}, []);

	return (
		<nav
			id="pohhu-contents"
			className="collective-index"
			aria-label="Music contents"
		>
			<ul>
				{chapters.map(chapter => (
					<li key={chapter.id}>
						<a
							href={`#${chapter.id}`}
							aria-current={
								current === chapter.id ? "location" : undefined
							}
						>
							{chapter.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
