// ─── NovelDetector ────────────────────────────────────────────────────────────
// Detects whether the current page is a novel/chapter reading page.

export class NovelDetector {
  private static NOVEL_SITE_PATTERNS = [
    /novelupdates\.com/,
    /wuxiaworld\.com/,
    /webnovel\.com/,
    /royalroad\.com/,
    /scribblehub\.com/,
    /novelbin\.com/,
    /lightnovelworld\.com/,
  ];

  isNovelSite(url: string): boolean {
    return NovelDetector.NOVEL_SITE_PATTERNS.some((p) => p.test(url));
  }

  hasChapterContent(): boolean {
    return this.detectChapterContainer() !== null;
  }

  detectChapterContainer(): Element | null {
    const selectors = [
      '.chapter-content',
      '.chapter-text',
      '#chapter-content',
      '#novel-content',
      '.reading-content',
      'article.entry-content',
      '.content-wrap',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && (el.textContent?.length ?? 0) > 500) return el;
    }

    return null;
  }
}
