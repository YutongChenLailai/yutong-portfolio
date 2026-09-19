# Portfolio media structure

Only browser-ready WebP files live in this deploy folder. Original PNG, JPG,
camera and working files are kept outside the deployed site.

## Folders

- `site/home` — homepage portraits and shared homepage media
- `site/about` — About page media
- `projects/<project-name>/cover` — listing cover, thumbnail and detail hero
- `projects/<project-name>/gallery` — final outcomes shown in galleries
- `projects/<project-name>/portfolio` — application portfolio spreads
- `projects/<project-name>/research` — papers, posters, exhibitions and awards
- `projects/<project-name>/process` — storyboards and process documentation

## Naming

- Full display source: `name.webp`
- Phone source: `name-480.webp`
- Tablet/small desktop source: `name-960.webp`
- Listing thumbnail: `cover-thumb.webp`

HTML and JavaScript use responsive `srcset` images. Detail content outside the
first screen is registered for intersection-based deferred loading.
