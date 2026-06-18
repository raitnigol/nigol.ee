import GenericMeta from "../components/GenericMeta";
import PohhuSection from "../components/PohhuSection";

export default function Music() {
	return (
		<>
			<GenericMeta
				title="$.pohhu¥"
				description="$.pohhu¥ — creative collective from Tartu. Manifesto, funded physical releases in Estonia, Kivi Baar art show, and certified artists."
				path="/music"
			/>

			<PohhuSection />
		</>
	);
}
