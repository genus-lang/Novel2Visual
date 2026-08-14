// ─── Novel Content Script Entry Point ────────────────────────────────────────
// Injected into all pages — detects novel chapters and reports them.

import { NovelDetector } from './NovelDetector';
import { ChapterExtractor } from './ChapterExtractor';
import { PageParser } from './PageParser';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NovelContent');
const detector = new NovelDetector();
const extractor = new ChapterExtractor();
const parser = new PageParser();

logger.info('Novel content script loaded');

// Listen for side panel asking to extract the current chapter
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_CHAPTER') {
    const result = extractor.extract();
    if (!result) {
      sendResponse({ success: false, error: 'No chapter content detected on this page' });
      return;
    }

    const chapterNumber = parser.parseChapterNumber(result.title);
    const novelTitle = parser.parseNovelTitle();

    sendResponse({
      success: true,
      data: {
        ...result,
        chapterNumber,
        novelTitle,
        url: window.location.href,
      },
    });
  }

  if (message.type === 'CHECK_NOVEL_PAGE') {
    sendResponse({ isNovelPage: detector.hasChapterContent() });
  }
});
