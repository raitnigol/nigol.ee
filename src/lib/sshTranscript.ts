export const SSH_LOGIN_BANNER = [
	"The authenticity of host 'nigol.ee' can't be established.",
	"ED25519 key fingerprint is SHA256:cR6d6V8xJzjE8zzv9Q8kK5fFq2sYw0lVx0m9Nq2vH1A",
	"Are you sure you want to continue connecting (yes/no/[fingerprint])? yes",
	"Warning: Permanently added 'nigol.ee' (ED25519) to the list of known hosts.",
	'Authenticated to nigol.ee using "publickey".',
	"Linux nigol-ee 6.12.0-trixie-amd64 #1 SMP PREEMPT_DYNAMIC Debian 13 x86_64",
	"Debian GNU/Linux 13 (trixie)"
];

/** OpenSSH-style `Last login` timestamp in the visitor's local timezone. */
export function formatSshLastLogin(at: Date, ip?: string): string {
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const weekday = at.toLocaleDateString("en-US", {
		weekday: "short",
		timeZone
	});
	const month = at.toLocaleDateString("en-US", { month: "short", timeZone });
	const day = String(
		Number(at.toLocaleDateString("en-US", { day: "numeric", timeZone }))
	).padStart(2, " ");
	const time = at.toLocaleTimeString("en-GB", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
	const year = at.toLocaleDateString("en-US", { year: "numeric", timeZone });

	return `Last login: ${weekday} ${month} ${day} ${time} ${year} ${
		ip ? `from ${ip}` : ""
	}`.trimEnd();
}
