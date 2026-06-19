import type { NextApiRequest, NextApiResponse } from "next";

export type VisitorResponse = {
	ip: string | null;
};

function headerValue(value: string | string[] | undefined): string | null {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed || null;
	}

	if (Array.isArray(value)) {
		for (const entry of value) {
			const trimmed = entry.trim();
			if (trimmed) return trimmed;
		}
	}

	return null;
}

function firstForwardedIp(value: string): string | null {
	const first = value.split(",")[0]?.trim();
	return first || null;
}

function getClientIp(req: NextApiRequest): string | null {
	const cfConnectingIp = headerValue(req.headers["cf-connecting-ip"]);
	if (cfConnectingIp) return cfConnectingIp;

	const realIp = headerValue(req.headers["x-real-ip"]);
	if (realIp) return realIp;

	const forwardedFor = headerValue(req.headers["x-forwarded-for"]);
	if (forwardedFor) {
		const first = firstForwardedIp(forwardedFor);
		if (first) return first;
	}

	const remoteAddress = req.socket?.remoteAddress?.trim();
	if (remoteAddress) return remoteAddress;

	return null;
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<VisitorResponse>
) {
	if (req.method !== "GET") {
		res.setHeader("Allow", "GET");
		res.status(405).json({ ip: null });
		return;
	}

	res.setHeader("Cache-Control", "no-store");
	res.status(200).json({ ip: getClientIp(req) });
}
