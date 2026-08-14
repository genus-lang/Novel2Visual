// ─── Chapter Types ────────────────────────────────────────────────────────────

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  number?: number;
  content: string;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface ParsedChapter extends Chapter {
  paragraphs: string[];
  cleanContent: string;
}
