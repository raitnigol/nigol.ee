/** Hero logo: $.¥ → $.pohhu¥ on load (respects reduced motion). */
export function PohhuLogoReveal() {
	return (
		<span
			className="pohhu-logo-reveal inline-flex items-center justify-center font-heading text-5xl font-extrabold tracking-tighter text-violet-400 md:text-6xl"
			aria-hidden="true"
		>
			<span className="pohhu-logo-reveal__edge">$.</span>
			<span className="pohhu-logo-reveal__core">
				<span className="pohhu-logo-reveal__text">pohhu</span>
			</span>
			<span className="pohhu-logo-reveal__edge">¥</span>
		</span>
	);
}
