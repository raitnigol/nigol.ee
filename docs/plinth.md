# Plinth in the collection

The listening room at `/physical-media#listening` displays the owner's Spotify session with Plinth's gramophone in an Annelinn-inspired apartment. Spotify is the playback source for both applications. Starting or skipping a track in the private Plinth player, desktop Spotify or another device on the same account is reflected by the existing `/api/nowPlaying` feed. Plinth does not need to remain open.

The website has no owner playback controls, Spotify SDK, browser access token or write endpoint. The progress bar is read-only. Room and Record buttons change only the visitor's camera. Record links open the matching published physical copies in the collection. Existing Spotify embeds still play through the visitor's own Spotify session; they cannot access the owner's credentials.

Playback uses the existing server-only `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REFRESH_TOKEN`. No new credential or scope is required. Both apps must use the same Spotify account. The existing client polls every five seconds during playback and every ten seconds when idle; errors and Spotify's Retry-After are respected. This is a periodically refreshed display, not an audio broadcast. The public site sends no audio to visitors.

## Loading and accessibility

The listening room loads near the viewport. Its track information works immediately; the roughly 4.5 MB 3D scene loads only after **Load Plinth 3D view**. Scene files use content-addressed URLs and immutable caching. The renderer suspends outside the viewport or in a hidden tab, honours reduced motion, and has a software fallback. Track details remain usable if graphics fail. The public canvas has no pointer or keyboard controls, so mobile scrolling remains available.

Spotify's complete album cover is displayed beside the track. The disc centre and standing album jacket beside the Victrola use the same Spotify album or single artwork. The shared Plinth loader keeps the previous cover visible until the replacement is validated and decoded. The jacket lifts and settles as both textures change together; reduced-motion mode swaps immediately. Missing or stalled artwork gets five seconds before the printed title/artist fallback; definite image errors fall back directly. Requests for previous tracks are cancelled and failed downloads retry after a cooldown. No MusicBrainz searches are made. The record's motion reflects playing/paused state, not beat analysis. The widened sideboard separates the sleeve from the instrument. Shared camera bounds keep private free orbit out of the wall unit, ceiling and lights; the public Record view uses a clear oblique close-up without clipping through the horn.

## Updating from Plinth

The source of the model, materials, camera and renderers remains the private Plinth Sites repository. `src/lib/plinth/upstream.json` records the source project, exact commit, file checksums and the local compatibility patch. Private Spotify code, session data, connection UI and credentials are excluded.

1. Open a clean, current Plinth source checkout through Sites.
2. Run `npm run plinth:sync -- /absolute/path/to/plinth-checkout` in this repository.
3. Review the imported changes and manifest, then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
4. Check the Vercel preview before merging. Syncing is deliberate: a Plinth edit cannot silently change production nigol.ee.

The importer currently adds `setSuspended` forwarding to Plinth's facade; both underlying renderers already implement it. The credential-free `pressing-art.js` module is imported intact so both apps use the same artwork-first behavior. Other renderer files and model assets are copied byte for byte. An unexpected facade change stops the import for review. Old content-addressed assets are retained so cached clients continue to work.
