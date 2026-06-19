const FALLBACK_ACCENT = "rgb(52 211 153)";

/** Average opaque pixel color from a cover image (same-origin). */
export function sampleCoverAccent(src: string): Promise<string> {
	return new Promise(resolve => {
		const img = new Image();
		img.decoding = "async";

		img.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				resolve(FALLBACK_ACCENT);
				return;
			}

			const size = 40;
			canvas.width = size;
			canvas.height = size;
			ctx.drawImage(img, 0, 0, size, size);

			const { data } = ctx.getImageData(0, 0, size, size);
			let r = 0;
			let g = 0;
			let b = 0;
			let count = 0;

			for (let i = 0; i < data.length; i += 4) {
				if (data[i + 3] < 140) continue;
				r += data[i];
				g += data[i + 1];
				b += data[i + 2];
				count += 1;
			}

			if (!count) {
				resolve(FALLBACK_ACCENT);
				return;
			}

			resolve(
				`rgb(${Math.round(r / count)} ${Math.round(g / count)} ${Math.round(
					b / count
				)})`
			);
		};

		img.onerror = () => resolve(FALLBACK_ACCENT);
		if (src.startsWith("http")) {
			img.crossOrigin = "anonymous";
		}
		img.src = src;
	});
}
