"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	weekday: "long",
	year: "numeric",
	month: "long",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hourCycle: "h23",
	timeZone: "Europe/Tallinn",
	timeZoneName: "short"
});

export function Clock() {
	const [now, setNow] = useState<number | null>(null);

	useEffect(() => {
		let timer: number | undefined;
		function sync() {
			window.clearInterval(timer);
			if (document.hidden) return;
			setNow(Date.now());
			timer = window.setInterval(() => setNow(Date.now()), 1000);
		}
		sync();
		document.addEventListener("visibilitychange", sync);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", sync);
		};
	}, []);

	if (now === null) return <span>Tallinn time</span>;
	const displayTime = formatter.format(now).replace(" at ", " · ");
	return (
		<time
			dateTime={new Date(now).toISOString()}
			aria-label={`Current time in Tallinn: ${displayTime}`}
		>
			{displayTime}
		</time>
	);
}
