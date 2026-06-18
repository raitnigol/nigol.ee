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
		current = word.length > maxWidth ? word.slice(0, maxWidth) : word;
	}

	if (current) lines.push(current);
	return lines;
}

/** Characters added by cowsay borders, e.g. `< text >`. */
const COWSAY_BORDER_CHARS = 4;

/** Classic cowsay bubble + cow. */
export function cowsay(text: string, maxWidth = 48): string {
	const paragraphs = text.split(/\n\n+/).map(part => part.trim()).filter(Boolean);
	const lines = paragraphs.flatMap((paragraph, index) => {
		const wrapped = wrapText(paragraph, maxWidth);
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
						if (index === lines.length - 1) return `\\ ${pad(line)} /`;
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

/** Fit cowsay text width to the terminal body (cowsay pre is 0.75rem). */
export function getCowsayMaxWidth(container: HTMLElement): number {
	const style = getComputedStyle(container);
	const paddingX =
		parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
	const available = container.clientWidth - paddingX;
	if (available <= 0) return 40;

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) return 40;

	ctx.font = `0.75rem ${style.fontFamily}`;
	const charWidth = ctx.measureText("m").width;
	if (charWidth <= 0) return 40;

	return Math.max(24, Math.floor(available / charWidth) - COWSAY_BORDER_CHARS);
}
