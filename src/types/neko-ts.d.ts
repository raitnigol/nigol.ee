declare module "neko-ts" {
	export enum NekoSizeVariations {
		SMALL = 32,
		MEDIUM = 38,
		LARGE = 42
	}

	export class Neko {
		constructor(options?: {
			nekoId?: number | null;
			nekoSize?: NekoSizeVariations | null;
			speed?: number | null;
			origin?: { x: number; y: number };
			parent?: HTMLElement;
			defaultState?: "awake" | "sleep";
			animationSpeed?: number;
		});

		destroy(id?: number): void;
		sleep(): void;
		wake(): void;
	}
}
