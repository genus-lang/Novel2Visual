// ─── ChapterAnalyzer ─────────────────────────────────────────────────────────
// Orchestrates the full chapter analysis pipeline.

import { ChapterParser } from './ChapterParser';
import { ParagraphSplitter } from './ParagraphSplitter';
import type { ParsedChapter } from '@/types/chapter';

export interface ChapterAnalysis {
  chapter: ParsedChapter;
  dialogueParagraphIndices: number[];
  actionParagraphIndices: number[];
}

export class ChapterAnalyzer {
  private parser = new ChapterParser();
  private splitter = new ParagraphSplitter();

  analyze(rawText: string, projectId: string, actionKeywords: string[]): ChapterAnalysis {
    const chapter = this.parser.parse(rawText, projectId);

    const dialogueParagraphIndices = this.splitter.findDialogueParagraphs(chapter.paragraphs);
    const actionParagraphIndices = this.splitter.findActionParagraphs(
      chapter.paragraphs,
      actionKeywords,
    );

    return { chapter, dialogueParagraphIndices, actionParagraphIndices };
  }
}
