// ─── PageParser ───────────────────────────────────────────────────────────────
// Parses metadata from novel pages (title, chapter number, novel name etc.)

export class PageParser {
  parseChapterNumber(title: string): number | undefined {
    const match = title.match(/chapter\s+(\d+)/i) ?? title.match(/ch\.?\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return undefined;
  }

  parseNovelTitle(): string | undefined {
    // Try OG tags first
    const og = document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]');
    if (og?.content) return og.content;

    // Try breadcrumbs
    const crumbs = document.querySelectorAll('nav.breadcrumb a, .breadcrumbs a');
    if (crumbs.length > 0) return (crumbs[0] as HTMLAnchorElement).textContent?.trim();

    return undefined;
  }
}
