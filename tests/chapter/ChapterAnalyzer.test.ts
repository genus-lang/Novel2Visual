import { describe, it, expect } from 'vitest';
import { ChapterAnalyzer } from '@/core/chapter/ChapterAnalyzer';

describe('ChapterAnalyzer', () => {
  it('parses raw chapter text', () => {
    const analyzer = new ChapterAnalyzer();
    const result = analyzer.analyze('Kael walked into the forest. The trees were tall.', 'proj1', []);
    expect(result.chapter.wordCount).toBeGreaterThan(0);
  });
});
