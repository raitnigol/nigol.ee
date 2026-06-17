import type { Copypasta } from "../data/copypastas";

export const COPYPASTA_LAST_ID_KEY = "nigol-copypasta-last";

export function pickCopypasta(
	copypastas: Copypasta[],
	lastId: string | null
): Copypasta {
	if (copypastas.length === 0) {
		throw new Error("copypastas must not be empty");
	}

	if (copypastas.length === 1) {
		return copypastas[0];
	}

	const pool = lastId
		? copypastas.filter(entry => entry.id !== lastId)
		: copypastas;

	return pool[Math.floor(Math.random() * pool.length)];
}
