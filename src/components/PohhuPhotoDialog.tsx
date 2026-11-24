"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FormattedText } from "./FormattedText";

export interface Photo {
	image: string;
	alt: string;
}

interface PhotoDialogProps {
	items: Photo[];
	initialIndex: number;
	label: string;
	onClose: () => void;
}

export function PohhuPhotoDialog({
	items,
	initialIndex,
	label,
	onClose
}: PhotoDialogProps) {
	const dialog = useRef<HTMLDialogElement>(null);
	const touch = useRef<{ x: number; y: number } | null>(null);
	const [index, setIndex] = useState(initialIndex);
	const current = items[index];
	const step = (offset: number) =>
		setIndex(previous => (previous + offset + items.length) % items.length);

	useEffect(() => {
		dialog.current?.showModal();
	}, []);

	return (
		<dialog
			ref={dialog}
			className="pohhu-photo-dialog"
			aria-label={label}
			onClose={onClose}
			onClick={event => {
				if (event.target === dialog.current) dialog.current?.close();
			}}
			onKeyDown={event => {
				if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
					event.preventDefault();
					step(event.key === "ArrowLeft" ? -1 : 1);
				}
			}}
		>
			<div className="pohhu-photo-dialog__content">
				<button
					type="button"
					className="focus-ring pohhu-photo-dialog__close"
					onClick={() => dialog.current?.close()}
				>
					Close <span aria-hidden>×</span>
				</button>
				<div
					className="pohhu-photo-dialog__image"
					onTouchStart={event => {
						const point = event.touches[0];
						touch.current =
							event.touches.length === 1
								? { x: point.clientX, y: point.clientY }
								: null;
					}}
					onTouchCancel={() => {
						touch.current = null;
					}}
					onTouchEnd={event => {
						const origin = touch.current;
						touch.current = null;
						if (!origin) return;
						const point = event.changedTouches[0];
						const dx = point.clientX - origin.x;
						if (
							Math.abs(dx) > 50 &&
							Math.abs(dx) > Math.abs(point.clientY - origin.y)
						)
							step(dx > 0 ? -1 : 1);
					}}
				>
					<Image
						src={current.image}
						alt={current.alt}
						fill
						sizes="(min-width: 1280px) 72rem, 96vw"
						loading="eager"
						draggable={false}
					/>
				</div>
				<div className="pohhu-photo-dialog__controls">
					{items.length > 1 && (
						<button
							type="button"
							className="focus-ring"
							aria-label="Previous image"
							onClick={() => step(-1)}
						>
							←
						</button>
					)}
					<p aria-live="polite" aria-atomic="true">
						{index + 1} / {items.length} ·{" "}
						<FormattedText text={current.alt} />
					</p>
					{items.length > 1 && (
						<button
							type="button"
							className="focus-ring"
							aria-label="Next image"
							onClick={() => step(1)}
						>
							→
						</button>
					)}
				</div>
			</div>
		</dialog>
	);
}
