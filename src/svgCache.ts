// SVG cache - preload all icons in background (non-blocking)
export const svgCache = new Map<string, string>();

function resolvePublicAsset(path: string): string {
  const safePath = path.replace(/^\//, "");
  const base = typeof document !== "undefined" ? document.baseURI : window.location.href;
  return new URL(safePath, base).toString();
}

export function preloadAllSVGs() {
  const svgPaths = [
    "icons/wake-up.svg",
    "icons/brush-teeth.svg",
    "icons/take-shower.svg",
    "icons/get-dressed.svg",
    "icons/eat-breakfast.svg",
    "icons/read-book.svg",
    "icons/lamp-table.svg",
    "icons/moon-stars.svg",
    "icons/bedtime.svg",
    "icons/star.svg",
  ];

  // Use setTimeout to defer loading, making it non-blocking
  setTimeout(() => {
    svgPaths.forEach((path, index) => {
      // Stagger the requests slightly
      setTimeout(() => {
        fetch(resolvePublicAsset(path))
          .then(res => res.text())
          .then(svg => svgCache.set(path, svg))
          .catch(err => console.debug(`Could not preload ${path}: ${err.message}`));
      }, index * 100);
    });
  }, 500);
}

