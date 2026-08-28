# Visual thesis — brutalist concrete and moss

Bookmark Freshness Review treats an old archive like a concrete field station that nature has started to reclaim. Concrete signals durable, local infrastructure. Moss signals age, survival, and the useful links that remain alive. The UI is blunt, tactile, and calm: heavy rules, square cuts, stamped labels, and small organic green marks. It must never resemble a centered SaaS hero or a glossy browser dashboard.

## Palette

The primary treatment is a warm light workbench. A dark treatment follows the operating-system preference and feels like wet concrete at dusk.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--concrete` | `#e7e3d6` | `#20241f` | page ground |
| `--slab` | `#f7f3e7` | `#2b302a` | raised working surface |
| `--ink` | `#182016` | `#f0eee2` | primary text |
| `--muted` | `#4e584a` | `#b9c1b3` | secondary text |
| `--moss` | `#365f2b` | `#9ac786` | action and living status |
| `--moss-deep` | `#23431c` | `#c6e5b8` | action emphasis |
| `--rust` | `#8a3c22` | `#ef9c79` | dead or destructive state |
| `--lichen` | `#b18b20` | `#efd06e` | stale, restricted, waiting |
| `--line` | `#30382d` | `#7b8677` | structural rules |

All text combinations are designed for at least 4.5:1 contrast. State text includes a word or symbol, never color alone.

## Type and spacing

- Display and labels: self-hosted **Archivo Black**, with a system sans fallback. Its compressed mass feels like concrete signage.
- Body and data: self-hosted **Atkinson Hyperlegible**, with a system sans fallback. It keeps long URLs and status tables readable.
- Type scale: 14, 16, 18, 24, 40, and a fluid 56 px landing headline.
- Spacing uses an 8 px base with 4 px details. Main section gaps are 64–96 px. The extension uses a denser 8–32 px rhythm.
- Shape language: 0–4 px corners, 2 px rules, offset hard shadows. Cards appear only for independent bookmark records or purchase terms.

## Composition and interaction grammar

- Landing: an asymmetric two-column first screen. The headline sits like a survey marker while the generated archive slab crosses the grid.
- App: a fixed review rail and a broad ledger. On narrow screens, the rail becomes a compact toolbar and the ledger becomes a vertical stack.
- Primary buttons are moss blocks with a one-pixel inset highlight. Secondary actions are concrete with an ink border. Links remain underlined.
- A small four-square “moss plot” is the recurring product mark. It is hand-authored SVG, not a third-party icon.
- Focus uses a 3 px lichen outline with a 3 px offset. Touch targets are at least 44 px.

## Motion

The signature motion is **field sampling**: when a check completes, a thin moss bar grows once from left to right and the record settles upward by 4 px. UI transitions last 160–240 ms and use only opacity and transform. Nothing loops. Under `prefers-reduced-motion: reduce`, movement is removed and state changes are immediate; progress remains visible through text and width changes without animation.

## Asset plan and prompt sheet

Hero asset: a generated still-life of a weathered concrete archive drawer split into layers, with paper bookmark slips, tiny moss growth, stamped status dots, and a portable field-tool feeling. Three-quarter overhead view, diffuse northern light, muted cement, bone paper, deep forest moss, restrained rust accents, tactile editorial photography. No people, devices, text, logos, brands, gradients, neon, glassmorphism, perfect symmetry, or watermark.

The source PNG and prompt sidecar live in `assets/src/`. The shipped hero is an optimized WebP at no more than 300 KB, with fixed dimensions. The Open Graph image is composed locally from the same original art and product tokens. The moss-plot mark, favicon, and interface symbols are hand-authored SVG/CSS.

## Provenance

- Hero image: generated for this product on 2026-08-28 with the Factory Azure image deployment through `/opt/fleet/lib/gen-image.sh`. Original work; prompt recorded in `assets/src/hero-concrete-moss.json`.
- Moss-plot mark and icons: hand-authored for this repository on 2026-08-28. MIT licensed with the product.

