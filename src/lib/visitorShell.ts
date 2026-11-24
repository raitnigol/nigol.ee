export const SHELL_INPUT_LIMIT = 512;

const home = "/home/guest";
const files = [
	"about.txt",
	"achievements.txt",
	"bio.txt",
	"copypasta.txt",
	"dot-ee.txt"
] as const;

export type ShellFile = (typeof files)[number];
export type ShellResult =
	| { kind: "text"; text: string }
	| { kind: "error"; text: string }
	| { kind: "file"; file: ShellFile }
	| { kind: "files"; files: readonly ShellFile[]; onePerLine: boolean }
	| { kind: "help"; entries: readonly (readonly [string, string])[] }
	| { kind: "navigate"; href: "/music" | "/physical-media" }
	| { kind: "spotify" }
	| { kind: "cow"; message: string }
	| { kind: "cowFile" }
	| { kind: "clear" };

const manual = {
	help: ["help", "Show commands"],
	ls: ["ls [-1]", "List files"],
	pwd: ["pwd", "Print the current directory"],
	whoami: ["whoami", "Show the current user"],
	cat: ["cat FILE", "Read a file"],
	open: ["open music | collection", "Open a page"],
	spotifyctl: ["spotifyctl status", "See what Rait is listening to"],
	cowsay: [
		"cowsay [MESSAGE]",
		"Give the cow a line, or run it for a copypasta"
	],
	history: ["history", "List commands from this session"],
	clear: ["clear", "Clear the screen"]
} as const;

type Command = keyof typeof manual;
const commands = Object.keys(manual) as Command[];
const helpEntries = Object.values(manual);

function resolveFile(path: string) {
	return files.find(name =>
		[name, `./${name}`, `~/${name}`, `${home}/${name}`].includes(path)
	);
}

function unquote(value: string) {
	return value.replace(/^(["'])([\s\S]*)\1$/, "$2");
}

export function runVisitorCommand(
	input: string,
	history: readonly string[] = []
): ShellResult {
	if (input.length > SHELL_INPUT_LIMIT) {
		return {
			kind: "error",
			text: `Command too long (maximum ${SHELL_INPUT_LIMIT} characters).`
		};
	}
	const match = /^(\S+)(?:\s+([\s\S]*))?$/.exec(input.trim());
	if (!match) return { kind: "text", text: "" };
	const command = commands.find(name => name === match[1]);
	if (!command)
		return {
			kind: "error",
			text: `${match[1]}: command not found. Try help.`
		};
	const argument = match[2] ?? "";
	const usage: ShellResult = {
		kind: "error",
		text: `usage: ${manual[command][0]}`
	};
	if (argument && manual[command][0] === command) return usage;

	switch (command) {
		case "help":
			return { kind: "help", entries: helpEntries };
		case "ls":
			if (
				argument &&
				!["-1", ".", "./", "~", "~/", home, `${home}/`].includes(
					argument
				)
			)
				return usage;
			return { kind: "files", files, onePerLine: argument === "-1" };
		case "pwd":
			return { kind: "text", text: home };
		case "whoami":
			return {
				kind: "text",
				text: "guest\nRead Rait’s profile with cat bio.txt."
			};
		case "cat": {
			if (!argument) return usage;
			const file = resolveFile(unquote(argument));
			return file
				? { kind: "file", file }
				: {
						kind: "error",
						text: `cat: ${argument}: no such file. Try ls.`
				  };
		}
		case "open":
			switch (argument) {
				case "music":
				case "/music":
					return { kind: "navigate", href: "/music" };
				case "collection":
				case "/physical-media":
					return { kind: "navigate", href: "/physical-media" };
				default:
					return usage;
			}
		case "spotifyctl":
			return argument === "status" ? { kind: "spotify" } : usage;
		case "cowsay": {
			if (!argument) return { kind: "cowFile" };
			if (argument.startsWith("<")) {
				const file = unquote(argument.slice(1).trim());
				return resolveFile(file) === "copypasta.txt"
					? { kind: "cowFile" }
					: { kind: "error", text: "usage: cowsay < copypasta.txt" };
			}
			const message = unquote(argument);
			return message.trim() ? { kind: "cow", message } : usage;
		}
		case "history":
			return {
				kind: "text",
				text: history
					.map((line, i) => `${String(i + 1).padStart(3)}  ${line}`)
					.join("\n")
			};
		case "clear":
			return { kind: "clear" };
	}
}

/** Complete the last word. A shared prefix can be inserted even with several matches. */
export function completeVisitorCommand(input: string): {
	value: string;
	matches: string[];
} {
	const match = /^(\s*)(\S*)(\s*)(.*)$/.exec(input);
	if (!match || input.length > SHELL_INPUT_LIMIT)
		return { value: input, matches: [] };
	const [, leading, name, separator, argument] = match;
	let choices: readonly string[] = commands;
	let prefix = leading;
	let fragment = name;
	if (separator) {
		prefix += name + separator;
		fragment = argument;
		if (name === "cat" || (name === "cowsay" && fragment.startsWith("<"))) {
			if (name === "cowsay") {
				const redirection = fragment.match(/^<\s*/)?.[0] ?? "";
				prefix += redirection;
				fragment = fragment.slice(redirection.length);
			}
			const directory =
				["./", "~/", `${home}/`].find(path =>
					fragment.startsWith(path)
				) ?? "";
			prefix += directory;
			fragment = fragment.slice(directory.length);
			choices = name === "cat" ? files : ["copypasta.txt"];
		} else if (name === "open") {
			choices = fragment.startsWith("/")
				? ["/music", "/physical-media"]
				: ["music", "collection"];
		} else if (name === "spotifyctl") {
			choices = ["status"];
		} else {
			choices = [];
		}
	}
	const matches = choices
		.filter(word => word.startsWith(fragment))
		.map(word => prefix + word)
		.sort();
	if (!matches.length) return { value: input, matches };
	let value = matches[0];
	const last = matches[matches.length - 1];
	while (!last.startsWith(value)) value = value.slice(0, -1);
	if (
		matches.length === 1 &&
		!separator &&
		["cat", "open", "spotifyctl", "cowsay"].includes(value.trim())
	)
		value += " ";
	return { value, matches };
}
