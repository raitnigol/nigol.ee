"use client";

import Link from "next/link";

export default function PhysicalMediaError() {
	return (
		<section className="site-shell site-main">
			<h1 className="signature mb-4 text-4xl font-bold">
				The collection is unavailable.
			</h1>
			<p>The published catalogue could not be loaded.</p>
			<div className="mt-5 flex flex-wrap items-center gap-5">
				<button
					className="focus-ring rounded border border-zinc-600 px-4 py-2 text-white"
					type="button"
					onClick={() => window.location.reload()}
				>
					Try again
				</button>
				<Link href="/" className="focus-ring underline">
					Back to home
				</Link>
			</div>
		</section>
	);
}
