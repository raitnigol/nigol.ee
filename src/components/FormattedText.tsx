import type { ComponentChild } from "preact";

/** Parse {{accent}}, [[danger]], *italic* inside a plain segment (no **). */
function parseEmphasis(
	text: string,
	keyPrefix: string,
	accentClass: string,
	dangerClass: string
): ComponentChild[] {
	const pattern = /\{\{(.+?)\}\}|\[\[(.+?)\]\]|\*(.+?)\*/g;
	const nodes: ComponentChild[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let i = 0;

	while ((match = pattern.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}

		const key = `${keyPrefix}-${i++}`;

		if (match[1]) {
			nodes.push(
				<span key={key} className={accentClass}>
					{match[1]}
				</span>
			);
		} else if (match[2]) {
			nodes.push(
				<span key={key} className={dangerClass}>
					{match[2]}
				</span>
			);
		} else if (match[3]) {
			nodes.push(
				<em key={key} className="italic text-muted">
					{match[3]}
				</em>
			);
		}

		lastIndex = pattern.lastIndex;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
}

export function FormattedText({
	text,
	accentClass = "font-semibold text-violet-400",
	dangerClass = "font-bold text-red-400"
}: {
	text: string;
	accentClass?: string;
	dangerClass?: string;
}) {
	const nodes: ComponentChild[] = [];
	const boldPattern = /\*\*(.+?)\*\*/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let key = 0;

	while ((match = boldPattern.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(
				...parseEmphasis(
					text.slice(lastIndex, match.index),
					`p${key}`,
					accentClass,
					dangerClass
				)
			);
		}

		nodes.push(
			<strong key={`b${key}`} className="font-bold text-white">
				{parseEmphasis(match[1], `b${key}`, accentClass, dangerClass)}
			</strong>
		);

		lastIndex = boldPattern.lastIndex;
		key += 1;
	}

	if (lastIndex < text.length) {
		nodes.push(
			...parseEmphasis(text.slice(lastIndex), `e${key}`, accentClass, dangerClass)
		);
	}

	return <>{nodes}</>;
}
