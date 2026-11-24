"use client";

import { useRouter } from "next/navigation";
import {
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode
} from "react";

import {
	completeVisitorCommand,
	runVisitorCommand,
	SHELL_INPUT_LIMIT,
	type ShellResult
} from "../lib/visitorShell";
import { CowsayTerminal } from "./CowsayTerminal";

const filePanels = {
	"bio.txt": "bio",
	"about.txt": "about",
	"achievements.txt": "achievements",
	"dot-ee.txt": "domain",
	"copypasta.txt": "copypasta"
} as const;

type PanelKey =
	| (typeof filePanels)[keyof typeof filePanels]
	| "spotify"
	| "cowFile";
type Panels = Record<PanelKey, ReactNode>;
type Entry = { id: number; command: string; result: ShellResult };
const historyLimit = 50;
const quickCommands = ["help", "ls", "spotifyctl status"];

function Prompt() {
	return (
		<span className="visitor-shell__prompt" aria-hidden="true">
			<span className="visitor-shell__identity">guest@nigol.ee:</span>~$
		</span>
	);
}

function CommandResult({
	result,
	panels,
	onCommand
}: {
	result: ShellResult;
	panels: Panels;
	onCommand: (command: string, focusInput: boolean) => void;
}) {
	switch (result.kind) {
		case "help":
			return (
				<dl className="visitor-shell__manual">
					{result.entries.map(([usage, description]) => (
						<div key={usage}>
							<dt>{usage}</dt>
							<dd>{description}</dd>
						</div>
					))}
				</dl>
			);
		case "files":
			return (
				<ul
					className={
						result.onePerLine
							? "visitor-shell__files visitor-shell__files--list"
							: "visitor-shell__files"
					}
				>
					{result.files.map(file => (
						<li key={file}>
							<button
								type="button"
								aria-label={`Read ${file}`}
								onClick={event =>
									onCommand(`cat ${file}`, event.detail === 0)
								}
							>
								{file}
							</button>
						</li>
					))}
				</ul>
			);
		case "text":
		case "error":
			return (
				<pre
					className={
						result.kind === "error"
							? "visitor-shell__text visitor-shell__error"
							: "visitor-shell__text"
					}
				>
					{result.text}
				</pre>
			);
		case "file":
			return panels[filePanels[result.file]];
		case "spotify":
			return panels.spotify;
		case "cowFile":
			return panels.cowFile;
		case "cow":
			return <CowsayTerminal message={result.message} />;
		case "navigate":
			return <a href={result.href}>{result.href}</a>;
		case "clear":
			return null;
	}
}

export function VisitorShell({
	children,
	panels
}: {
	children: ReactNode;
	panels: Panels;
}) {
	const router = useRouter();
	const inputId = useId();
	const [value, setValue] = useState("");
	const [entries, setEntries] = useState<Entry[]>([]);
	const [showIntro, setShowIntro] = useState(true);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const input = useRef<HTMLInputElement>(null);
	const screen = useRef<HTMLDivElement>(null);
	const lastEntry = useRef<HTMLDivElement>(null);
	const nextId = useRef(0);
	const history = useRef<string[]>([]);
	const historyIndex = useRef<number | null>(null);
	const draft = useRef("");

	useLayoutEffect(() => {
		const viewport = screen.current;
		const latest = lastEntry.current;
		if (!viewport || !latest) return;
		// Show the beginning of long output. Scroll only inside the console.
		const offset =
			latest.getBoundingClientRect().top -
			viewport.getBoundingClientRect().top;
		viewport.scrollTop += offset;
	}, [entries]);

	function clearScreen() {
		setShowIntro(false);
		setEntries([]);
		setSuggestions([]);
	}

	function run(line: string, focusInput = true) {
		const command = line.trim();
		if (!command) return;
		history.current = [...history.current, command].slice(-historyLimit);
		historyIndex.current = null;
		draft.current = "";
		setValue("");
		setSuggestions([]);

		const result = runVisitorCommand(command, history.current);
		if (result.kind === "clear") {
			clearScreen();
		} else {
			const entry = { id: nextId.current++, command, result };
			setEntries(previous => [...previous, entry].slice(-historyLimit));
		}
		if (result.kind === "navigate") {
			router.push(result.href);
		} else if (focusInput) {
			input.current?.focus({ preventScroll: true });
		}
	}

	function edit(next: string) {
		historyIndex.current = null;
		draft.current = "";
		setValue(next);
		setSuggestions([]);
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
			return;
		if (
			event.ctrlKey &&
			!event.metaKey &&
			!event.altKey &&
			event.key.toLowerCase() === "l"
		) {
			event.preventDefault();
			clearScreen();
			return;
		}
		if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
			return;

		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			const length = history.current.length;
			const index = historyIndex.current ?? length;
			if (!length || (event.key === "ArrowDown" && index === length))
				return;
			event.preventDefault();
			if (index === length) draft.current = value;
			const next =
				event.key === "ArrowUp" ? Math.max(0, index - 1) : index + 1;
			historyIndex.current = next === length ? null : next;
			setValue(next === length ? draft.current : history.current[next]);
			setSuggestions([]);
			return;
		}

		if (event.key === "Escape" && suggestions.length) {
			event.preventDefault();
			setSuggestions([]);
			return;
		}
		if (event.key !== "Tab" || !value.trim() || suggestions.length) return;
		if (
			event.currentTarget.selectionEnd !== value.length ||
			event.currentTarget.selectionStart !== value.length
		)
			return;
		const completion = completeVisitorCommand(value);
		if (completion.value !== value) {
			event.preventDefault();
			edit(completion.value);
		}
		if (completion.matches.length > 1) {
			event.preventDefault();
			setSuggestions(completion.matches);
		}
	}

	return (
		<div className="visitor-shell">
			<div
				className="visitor-shell__screen"
				tabIndex={0}
				role="region"
				aria-label="Terminal output"
				ref={screen}
			>
				{showIntro && children}
				<div
					className="visitor-shell__log"
					role="log"
					aria-label="Command results"
					aria-relevant="additions"
				>
					{entries.map((entry, index) => (
						<div
							className="visitor-shell__entry"
							key={entry.id}
							ref={
								index === entries.length - 1 ? lastEntry : null
							}
						>
							<p className="visitor-shell__command">
								<Prompt /> {entry.command}
							</p>
							<div className="visitor-shell__result">
								<CommandResult
									result={entry.result}
									panels={panels}
									onCommand={run}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="visitor-shell__controls">
				<form
					className="visitor-shell__form"
					onSubmit={event => {
						event.preventDefault();
						run(value);
					}}
				>
					<label htmlFor={inputId}>
						<Prompt />
						<span className="sr-only">Terminal command</span>
					</label>
					<input
						id={inputId}
						ref={input}
						className="visitor-shell__input"
						type="text"
						value={value}
						placeholder="Type a command"
						spellCheck={false}
						autoCapitalize="none"
						autoCorrect="off"
						autoComplete="off"
						enterKeyHint="go"
						maxLength={SHELL_INPUT_LIMIT}
						aria-describedby={inputId + "-keys"}
						onChange={event => edit(event.target.value)}
						onKeyDown={onKeyDown}
					/>
					<button type="submit" className="visitor-shell__submit">
						Run
					</button>
				</form>
				<span id={inputId + "-keys"} className="sr-only">
					Up and down arrows recall commands. Tab completes a command.
					Control L clears the screen.
				</span>
				{suggestions.length > 0 && (
					<div
						className="visitor-shell__completions"
						role="group"
						aria-label="Possible completions"
					>
						{suggestions.map(match => (
							<button
								key={match}
								type="button"
								onClick={() => {
									edit(match);
									input.current?.focus({
										preventScroll: true
									});
								}}
							>
								{match}
							</button>
						))}
					</div>
				)}
				<div
					className="visitor-shell__shortcuts"
					role="group"
					aria-label="Quick commands"
				>
					{quickCommands.map(command => (
						<button
							key={command}
							type="button"
							onClick={event => run(command, event.detail === 0)}
						>
							{command}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
