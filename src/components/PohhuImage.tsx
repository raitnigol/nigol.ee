"use client";

import Image from "next/image";
import { useState } from "react";

interface PohhuImageProps {
	src?: string;
	fallback?: string | null;
	alt: string;
	sizes: string;
	className: string;
}

export function PohhuImage({
	src,
	fallback,
	alt,
	sizes,
	className
}: PohhuImageProps) {
	const [failed, setFailed] = useState<string[]>([]);
	const image = [src, fallback].find(url => url && !failed.includes(url));

	if (!image) {
		return (
			<span className="flex h-full items-center justify-center text-subtle">
				{alt}
			</span>
		);
	}

	return (
		<Image
			src={image}
			alt={alt}
			width={640}
			height={640}
			sizes={sizes}
			className={className}
			onError={() => setFailed(previous => [...previous, image])}
		/>
	);
}
