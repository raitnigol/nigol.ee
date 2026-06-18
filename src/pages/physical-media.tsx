import GenericMeta from "../components/GenericMeta";
import { PhysicalMediaCoverflow } from "../components/PhysicalMediaCoverflow";

export default function PhysicalMedia() {
	return (
		<>
			<GenericMeta
				title="CD Collection"
				description="Physical CD copies from my favourite artists."
				path="/physical-media"
			/>

			<div className="mb-10 max-w-2xl">
				<p className="mb-4">
					<span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
						Work in progress
					</span>
				</p>
				<p className="text-lg text-secondary">
					Physical copies of CDs from my favourite artists — the ones I actually
					own and keep on the shelf.
				</p>
			</div>

			<PhysicalMediaCoverflow />
		</>
	);
}
