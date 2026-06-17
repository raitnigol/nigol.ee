# Physical media — coverflow assets

Files here are served at `/images/physical-media/...` (folder `public/images/physical-media/`).

## Layout

```
physical-media/
  jewel-case.png          ← one shared PNG frame (transparent window for art)
  covers/
    born-to-die-paradise-edition.jpg
```

## Cover art (`covers/`)

- **Square** — 1:1 ratio works best (e.g. 500×500 or 1000×1000).
- **JPG, PNG, or WebP** — same as pohhu release covers.
- Drop a square cover into `covers/` (JPG, PNG, or WebP).

## Jewel case (`jewel-case.png`)

One **PNG with transparency**:

- Opaque parts = plastic case edges, spine, reflections.
- **Transparent cutout** in the center = where the insert art shows through.

In the UI we stack layers (back → front):

1. Album cover image (`covers/…`)
2. `jewel-case.png` on top (`position: absolute`, full size, `pointer-events: none`)

The cover is scaled/positioned behind the frame so it lines up with the window. You only need **one** case PNG if all items use the same jewel case look.

Optional later: `jewel-case-empty.png` for “no disc” slots, or per-format overlays (digipak, cassette) in `overlays/`.

## Quick test checklist

1. Add `covers/born-to-die-paradise-edition.jpg` (square cover art).
2. Add `covers/jewel-case.png` (export with **transparent** centre, not black fill).
3. Coverflow reads from `src/data/physicalMedia.ts` — e.g.:
   - `coverImage: "/images/physical-media/covers/born-to-die-paradise-edition.jpg"`
   - Case overlay: `/images/physical-media/jewel-case.png` (shared, not per album).
