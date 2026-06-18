# Physical media — coverflow assets

Files here are served at `/images/physical-media/...` (folder `public/images/physical-media/`).

## Layout

```
physical-media/
  covers/
    born-to-die-paradise-edition.jpg
```

## Cover art (`covers/`)

- **Square** — 1:1 ratio works best (e.g. 500×500 or 1000×1000).
- **JPG, PNG, or WebP** — same as pohhu release covers.
- Drop a square cover into `covers/`.

## Quick checklist

1. Add `covers/your-album.jpg` (square cover art).
2. Add an entry in `src/data/physicalMedia.ts` with `coverImage: "/images/physical-media/covers/your-album.jpg"` and the Spotify album ID.
