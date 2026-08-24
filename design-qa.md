# PoopSlaves RCA-style outcome carousel QA

## Reference characteristics checked

- Black canvas with five-column vertical guide lines.
- One centred feature image occupying roughly 60% of the desktop viewport.
- Circular previous and next controls outside the image.
- Black editorial caption block aligned to the image and occupying roughly two thirds of its width.
- Orange category label, underlined white title, and restrained grey supporting copy.
- Mobile layout becomes a full-width single card with paired controls beneath the content.

## Implementation verification

- Desktop viewport: 1280 × 720.
- Feature image: 768 × 413 px at x = 256 px.
- Caption: 512 px wide, aligned with the image's left edge.
- No horizontal overflow at desktop or 390 px mobile width.
- Previous and next controls update the image, counter, title, English text, and Chinese text together.
- All five outcome images retain their original project assets and aspect ratio.

## Intentional differences

- RCA branding, copy, type assets, and imagery are not reproduced.
- The typography uses the portfolio site's existing font stack while matching the reference hierarchy and scale.
- Bilingual captions are retained because they are part of Yutong Chen's portfolio content.
