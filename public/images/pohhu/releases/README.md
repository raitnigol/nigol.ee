# Funded release cover art

Drop square cover images here (JPG, PNG, or WebP).

| File | Release |
|------|---------|
| `12-liitrit.jpg` | Benakanister, mehkel – 12 LIITRIT |
| `parnu-tartu-mixtape.jpg` | SKIZØ, Benakanister – PÄRNU - TARTU MIXTAPE |

You can also use `.png` or `.webp` — update `coverImage` in `src/data/pohhu.ts` if the extension differs.

## Adding entries

Edit the `fundedReleases` array in `src/data/pohhu.ts`:

- **Square release card** — `title`, `artists`, `format`, `pressRun` (e.g. `"100 CDs"`), `releaseYear`, `spotifyUrl`, `coverImage`, optional `investmentNote` (shown on cover art)
- **Full-width banner** — set `banner: true`, plus `title`, `subtitle`, `description`, optional `investmentNote` (no cover image required)
