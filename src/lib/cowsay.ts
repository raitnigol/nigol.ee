function wrapText(text: string, maxWidth: number): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	if (!words.length) return [];

	const lines: string[] = [];
	let current = "";

	for (const word of words) {
		const next = current ? `${current} ${word}` : word;
		if (next.length <= maxWidth) {
			current = next;
			continue;
		}

		if (current) lines.push(current);
		let offset = 0;
		while (word.length - offset > maxWidth) {
			lines.push(word.slice(offset, offset + maxWidth));
			offset += maxWidth;
		}
		current = word.slice(offset);
	}

	if (current) lines.push(current);
	return lines;
}

/** Characters added by cowsay borders, e.g. `< text >`. */
const COWSAY_BORDER_CHARS = 4;

/** Classic cowsay bubble + cow. */
export function cowsay(text: string, maxWidth = 48): string {
	const paragraphs = text
		.split(/\n\n+/)
		.map(part => part.trim())
		.filter(Boolean);
	const lines = paragraphs.flatMap((paragraph, index) => {
		const wrapped = wrapText(paragraph, Math.max(1, Math.floor(maxWidth)));
		if (!wrapped.length) return [];
		return index > 0 ? ["", ...wrapped] : wrapped;
	});
	if (!lines.length) return "";

	const width = Math.max(...lines.map(line => line.length));
	const pad = (line: string) => `${line}${" ".repeat(width - line.length)}`;

	const bubble =
		lines.length === 1
			? [
					` ${"_".repeat(width + 2)}`,
					`< ${pad(lines[0])} >`,
					` ${"-".repeat(width + 2)}`
			  ]
			: [
					` ${"_".repeat(width + 2)}`,
					...lines.map((line, index) => {
						if (index === 0) return `/ ${pad(line)} \\`;
						if (index === lines.length - 1)
							return `\\ ${pad(line)} /`;
						return `| ${pad(line)} |`;
					}),
					` ${"-".repeat(width + 2)}`
			  ];

	const cow = [
		"        \\   ^__^",
		"         \\  (oo)\\_______",
		"            (__)\\       )\\/\\",
		"                ||----w |",
		"                ||     ||"
	];

	return [...bubble, ...cow].join("\n");
}

/** Measure the rendered monospace font so the borders fit at any zoom level. */
export function getCowsayMaxWidth(pre: HTMLPreElement): number {
	const ctx = document.createElement("canvas").getContext("2d");
	if (!ctx || pre.clientWidth <= 0) return 32;

	const style = getComputedStyle(pre);
	ctx.font = `${style.fontSize} ${style.fontFamily}`;
	const charWidth = ctx.measureText("m").width;
	if (charWidth <= 0) return 32;

	return Math.max(
		1,
		Math.min(
			78,
			Math.floor(pre.clientWidth / charWidth) - COWSAY_BORDER_CHARS
		)
	);
}
