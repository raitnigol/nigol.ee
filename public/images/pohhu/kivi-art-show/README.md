# Kivi Baar × $.pohhu¥ Art Show — gallery uploads

| File | Usage |
|------|--------|
| `banner.jpg` | Wide banner (spans full row on desktop) |
| `01.jpg` … `04.jpg` | Square gallery photos (add more in `src/data/pohhu.ts` if needed) |

Recommended: banner ~1600×800 (2:1), squares ~1200×1200.

`01.jpg` is also the opening photo on the music page. After replacing it with a portrait, run `node scripts/prepare-music-hero.mjs` from the project root and commit the updated `public/images/pohhu/opening/` files and `data/generated/musicHero.json`.
