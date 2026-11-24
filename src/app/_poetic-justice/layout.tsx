import type { ReactNode } from "react";
import "./poetic-justice.scss";

export default function PoetryLayout({ children }: { children: ReactNode }) {
	return <div className="site-shell site-main">{children}</div>;
}
