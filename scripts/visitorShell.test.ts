import assert from "node:assert/strict";
import { test } from "node:test";
import {
	completeVisitorCommand,
	runVisitorCommand,
	SHELL_INPUT_LIMIT
} from "../src/lib/visitorShell";

test("every file listed by ls resolves to its content panel", () => {
	const result = runVisitorCommand("ls -1");
	assert.equal(result.kind, "files");
	assert.equal(result.onePerLine, true);
	assert.deepEqual(runVisitorCommand("ls"), { ...result, onePerLine: false });
	for (const name of result.files) {
		for (const prefix of ["", "./", "~/", "/home/guest/"]) {
			assert.deepEqual(runVisitorCommand("cat " + prefix + name), {
				kind: "file",
				file: name
			});
		}
	}
	assert.deepEqual(runVisitorCommand(' cat  "bio.txt"  '), {
		kind: "file",
		file: "bio.txt"
	});
	assert.equal(runVisitorCommand("cat missing.txt").kind, "error");
	assert.equal(runVisitorCommand("cat ../private.txt").kind, "error");
	assert.match(
		(runVisitorCommand("whoami") as { text: string }).text,
		/^guest\n.*cat bio\.txt/
	);
	assert.deepEqual(runVisitorCommand("pwd"), {
		kind: "text",
		text: "/home/guest"
	});
});

test("site destinations and Spotify accept supported commands only", () => {
	assert.deepEqual(runVisitorCommand("open music"), {
		kind: "navigate",
		href: "/music"
	});
	assert.deepEqual(runVisitorCommand("open collection"), {
		kind: "navigate",
		href: "/physical-media"
	});
	assert.deepEqual(runVisitorCommand("spotifyctl status"), {
		kind: "spotify"
	});
	for (const command of [
		"open https://example.com",
		"open //example.com",
		"open __proto__",
		"open music extra",
		"spotifyctl token",
		"clear unexpected",
		"constructor"
	]) {
		assert.equal(runVisitorCommand(command).kind, "error", command);
	}
});

test("cowsay distinguishes a literal message from the bundled copypasta", () => {
	assert.deepEqual(runVisitorCommand("cowsay hello,   Tartu"), {
		kind: "cow",
		message: "hello,   Tartu"
	});
	assert.deepEqual(runVisitorCommand('cowsay "<tag> hello"'), {
		kind: "cow",
		message: "<tag> hello"
	});
	for (const command of [
		"cowsay",
		"cowsay < copypasta.txt",
		"cowsay <./copypasta.txt"
	]) {
		assert.deepEqual(runVisitorCommand(command), { kind: "cowFile" });
	}
	assert.equal(runVisitorCommand("cowsay < ghost.txt").kind, "error");
	assert.deepEqual(runVisitorCommand("history", ["pwd", "history"]), {
		kind: "text",
		text: "  1  pwd\n  2  history"
	});
	assert.deepEqual(runVisitorCommand("clear"), { kind: "clear" });
	assert.equal(
		runVisitorCommand("a".repeat(SHELL_INPUT_LIMIT + 1)).kind,
		"error"
	);
});

test("Tab completes commands, filenames, bounded page names and redirection", () => {
	assert.deepEqual(completeVisitorCommand("sp"), {
		value: "spotifyctl ",
		matches: ["spotifyctl"]
	});
	assert.deepEqual(completeVisitorCommand("  cat ./a"), {
		value: "  cat ./a",
		matches: ["  cat ./about.txt", "  cat ./achievements.txt"]
	});
	assert.equal(completeVisitorCommand("cat ~/bi").value, "cat ~/bio.txt");
	assert.equal(completeVisitorCommand("open co").value, "open collection");
	assert.equal(
		completeVisitorCommand("spotifyctl st").value,
		"spotifyctl status"
	);
	assert.equal(
		completeVisitorCommand("cowsay < co").value,
		"cowsay < copypasta.txt"
	);
	assert.deepEqual(completeVisitorCommand("cat no"), {
		value: "cat no",
		matches: []
	});
	assert.deepEqual(completeVisitorCommand("cat < co"), {
		value: "cat < co",
		matches: []
	});
});
