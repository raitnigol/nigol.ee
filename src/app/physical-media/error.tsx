"use client";

import Link from "next/link";

export default function PhysicalMediaError() {
	return (
		<section className="rr-room rr-section rr-error">
			<h1 className="rr-heading">The collection is unavailable.</h1>
			<p>The published catalogue could not be loaded.</p>
			<div className="rr-hero-actions">
				<button
					className="rr-button rr-acid-button"
					type="button"
					onClick={() => window.location.reload()}
				>
					Try again
				</button>
				<Link href="/">Back to home</Link>
			</div>
		</section>
	);
}
