"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNowPlaying } from "../SpotifyPlayback";
import type { PublishedRecord } from "../../lib/publishedRecord";
import { matchOwnedRecords } from "../../lib/matchOwnedRecords";
import { playbackTime, plinthDisplay } from "../../lib/plinth/display";
import { loadPlinthViewer, type PlinthViewer } from "../../lib/plinth/viewer";
import { formatNames } from "./RecordArt";

export function PlinthNowPlaying({
	records,
	onOpenRecord
}: {
	records: PublishedRecord[];
	onOpenRecord: (record: PublishedRecord) => void;
}) {
	const { ref, inView } = useInView({ threshold: 0, fallbackInView: true });
	const [foreground, setForeground] = useState(true);
	useEffect(() => {
		const update = () => setForeground(!document.hidden);
		update();
		document.addEventListener("visibilitychange", update);
		return () => document.removeEventListener("visibilitychange", update);
	}, []);
	const visible = inView && foreground;
	const { data, failed, isLoading, playedAgo, progressMs } =
		useNowPlaying(visible);
	const track = data?.track;
	const copies = matchOwnedRecords(records, track || null);
	const [requested, setRequested] = useState(false);
	const [attempt, setAttempt] = useState(0);
	const [ready, setReady] = useState(false);
	const [sceneFailed, setSceneFailed] = useState(false);
	const [view, setView] = useState<"studio" | "overhead">("studio");
	const scene = useRef<HTMLDivElement>(null);
	const viewer = useRef<PlinthViewer | null>(null);
	const latest = useRef({
		display: plinthDisplay(data, progressMs),
		visible,
		view
	});

	useEffect(() => {
		const display = plinthDisplay(data, progressMs);
		latest.current = { display, visible, view };
		viewer.current?.update(display);
	}, [data, progressMs, visible, view]);
	useEffect(() => {
		viewer.current?.setVisible(visible);
	}, [visible]);
	useEffect(() => {
		viewer.current?.setView(view);
	}, [view]);

	useEffect(() => {
		if (!requested || !scene.current) return;
		const container = scene.current;
		let cancelled = false;
		let instance: PlinthViewer | undefined;
		loadPlinthViewer()
			.then(mount => {
				if (cancelled) return;
				instance = mount(
					container,
					() => {
						if (!cancelled) setReady(true);
					},
					() => {
						if (!cancelled) {
							setSceneFailed(true);
							instance?.destroy();
						}
					}
				);
				viewer.current = instance;
				instance.update(latest.current.display);
				instance.setVisible(latest.current.visible);
				instance.setView(latest.current.view);
			})
			.catch(() => {
				if (!cancelled) setSceneFailed(true);
			});
		return () => {
			cancelled = true;
			instance?.destroy();
			if (viewer.current === instance) viewer.current = null;
		};
	}, [requested, attempt]);

	function loadScene() {
		setReady(false);
		setSceneFailed(false);
		setRequested(true);
		setAttempt(value => value + 1);
	}
	const status = isLoading
		? "Connecting to Spotify…"
		: failed
		? "Spotify is temporarily unavailable"
		: !track
		? "Nothing playing right now"
		: data?.isPlayingNow
		? data.isPaused
			? "Paused"
			: "Now playing"
		: "Last played";
	const artwork =
		track?.album.images.find(image => image.width && image.width >= 300)
			?.url || track?.album.images[0]?.url;
	const trackUrl = track?.external_urls.spotify;

	return (
		<div ref={ref} className="rr-plinth">
			<div className="rr-plinth-stage">
				<div
					ref={scene}
					className="rr-plinth-scene"
					aria-hidden="true"
				/>
				{(!ready || sceneFailed) && (
					<div className="rr-plinth-placeholder">
						<div className="rr-plinth-record" aria-hidden="true">
							<span>$.pohhu¥</span>
						</div>
						{!requested || sceneFailed ? (
							<button
								type="button"
								className="rr-button"
								onClick={loadScene}
							>
								{sceneFailed
									? "Retry 3D view"
									: "Load Plinth 3D view"}
							</button>
						) : (
							<p role="status">Loading the gramophone…</p>
						)}
						{sceneFailed && (
							<p role="status">
								The 3D view could not load. Track details are
								still available.
							</p>
						)}
					</div>
				)}
				{ready && !sceneFailed && (
					<div
						className="rr-plinth-views"
						role="group"
						aria-label="Gramophone camera"
					>
						{(
							[
								["studio", "Room"],
								["overhead", "Record"]
							] as const
						).map(([value, label]) => (
							<button
								type="button"
								key={value}
								aria-pressed={view === value}
								onClick={() => setView(value)}
							>
								{label}
							</button>
						))}
					</div>
				)}
			</div>
			<div className="rr-plinth-info">
				<p className="rr-plinth-status" role="status">
					{status}
				</p>
				{track ? (
					<>
						<div className="rr-plinth-track">
							{artwork && (
								<Image
									className="rr-plinth-cover"
									src={artwork}
									alt={`${track.album.name} cover`}
									width={160}
									height={160}
									sizes="(max-width: 44rem) 80px, 112px"
								/>
							)}
							<div>
								<h3>{track.name}</h3>
								<p>
									{track.artists
										.map(artist => artist.name)
										.join(", ")}
								</p>
								<p className="rr-plinth-album">
									{track.album.name}
								</p>
							</div>
						</div>
						{data?.isPlayingNow ? (
							<div className="rr-plinth-progress">
								<progress
									value={Math.max(
										0,
										Math.min(progressMs, track.duration_ms)
									)}
									max={track.duration_ms || 1}
									aria-label="Track progress"
								/>
								<div aria-hidden="true">
									<span>
										{playbackTime(
											Math.min(
												progressMs,
												track.duration_ms
											)
										)}
									</span>
									<span>
										{playbackTime(track.duration_ms)}
									</span>
								</div>
							</div>
						) : (
							playedAgo && (
								<p className="rr-plinth-last-played">
									{playedAgo}
								</p>
							)
						)}
						{trackUrl && (
							<a
								className="rr-spotify-link"
								href={trackUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Image
									src="/collection-design/spotify.svg"
									alt=""
									width={20}
									height={20}
									unoptimized
								/>
								Open in Spotify
							</a>
						)}
						{copies.length > 0 && (
							<div className="rr-plinth-copies">
								<p>In my collection</p>
								{copies.map(copy => {
									const record = records.find(
										item => item.copyId === copy.copyId
									)!;
									return (
										<button
											type="button"
											className="rr-button"
											key={copy.copyId}
											onClick={() => onOpenRecord(record)}
										>
											{formatNames[copy.format]}
											{copies.filter(
												item =>
													item.format === copy.format
											).length > 1 &&
												` · ${
													record.color ||
													record.editionDate ||
													record.catalogNumber ||
													record.title
												}`}
										</button>
									);
								})}
							</div>
						)}
					</>
				) : (
					<p className="rr-plinth-empty">
						{failed
							? "The display will reconnect automatically."
							: isLoading
							? ""
							: "My Spotify session appears here when I listen."}
					</p>
				)}
				<p className="rr-plinth-note">
					My listening session. Playback stays on my devices.
				</p>
			</div>
		</div>
	);
}
