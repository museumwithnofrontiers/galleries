// The website's chrome files (inventory-app#2233, decision D7), all legacy's
// and kept in this repository under theme/assets/: viewer-layout's map of
// them (README, "Site chrome"), keyed by the path after `theme/assets/`.
// `chrome/<path>` holds a picture the package names by its legacy path (a
// gallery's tile, `image_path`).
export const chrome = import.meta.glob('../theme/assets/**/*.{jpg,jpeg,png,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})
