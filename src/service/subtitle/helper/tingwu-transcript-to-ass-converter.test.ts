import { describe, expect, it } from 'vitest';

import type { TingwuTranscription } from '@/types/tingwu.js';

import { TingwuTranscriptToAssConverter } from './tingwu-transcript-to-ass-converter.js';

function makeTranscription(
  paragraphs: Array<{
    paragraphId?: string;
    speakerId?: string;
    words: Array<{
      id?: number;
      sentenceId?: number;
      start: number;
      end: number;
      text: string;
    }>;
  }>,
): TingwuTranscription {
  return {
    Transcription: {
      AudioInfo: {
        Size: 1000,
        Duration: 60000,
        SampleRate: 16000,
        Language: 'zh',
      },
      Paragraphs: paragraphs.map((p, pIdx) => ({
        ParagraphId: p.paragraphId ?? `p${pIdx}`,
        SpeakerId: p.speakerId ?? '0',
        Words: p.words.map((w, wIdx) => ({
          Id: w.id ?? wIdx,
          SentenceId: w.sentenceId ?? 0,
          Start: w.start,
          End: w.end,
          Text: w.text,
        })),
      })),
    },
  };
}

function collectOutput(converter: TingwuTranscriptToAssConverter): string[] {
  return [...converter.generate()];
}

function getDialogueLines(output: string[]): string[] {
  return output.filter((line) => line.startsWith('Dialogue:'));
}

describe('TingwuTranscriptToAssConverter', () => {
  describe('empty paragraphs', () => {
    it('yields only the header when there are no paragraphs', () => {
      const transcription = makeTranscription([]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);

      expect(output.length).toBeGreaterThanOrEqual(1);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(0);
    });

    it('yields only the header when paragraphs have no words', () => {
      const transcription = makeTranscription([{ words: [] }]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);

      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(0);
    });
  });

  describe('single word, no punctuation', () => {
    it('yields header + one Dialogue line', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'hello' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);

      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(1);
      expect(dialogues[0]).toContain('hello');
    });
  });

  describe('punctuation splitting', () => {
    it('splits at Chinese period', () => {
      const transcription = makeTranscription([
        {
          words: [
            { start: 0, end: 1000, text: '你好。' },
            { start: 1000, end: 2000, text: '世界' },
          ],
        },
      ]);
      // maxDuration = 1000, so fragments won't merge
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
    });

    it('splits at Chinese exclamation mark', () => {
      const transcription = makeTranscription([
        {
          words: [
            {
              start: 0,
              end: 1000,
              text: '太好了！',
            },
            {
              start: 1000,
              end: 2000,
              text: '真棒',
            },
          ],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
    });

    it('splits at Chinese question mark', () => {
      const transcription = makeTranscription([
        {
          words: [
            {
              start: 0,
              end: 1000,
              text: '你好吗？',
            },
            {
              start: 1000,
              end: 2000,
              text: '我很好',
            },
          ],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
    });

    it('splits at Chinese comma', () => {
      const transcription = makeTranscription([
        {
          words: [
            {
              start: 0,
              end: 1000,
              text: '你好，',
            },
            {
              start: 1000,
              end: 2000,
              text: '世界',
            },
          ],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
    });

    it('splits at English punctuation (.?!,)', () => {
      const transcription = makeTranscription([
        {
          words: [
            { start: 0, end: 1000, text: 'Hello.' },
            { start: 1000, end: 2000, text: 'World!' },
            { start: 2000, end: 3000, text: 'How?' },
            { start: 3000, end: 4000, text: 'Fine,' },
            { start: 4000, end: 5000, text: 'thanks' },
          ],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      // Each punctuation-terminated word creates a fragment boundary
      // "Hello." | "World!" | "How?" | "Fine," | "thanks"
      // With 1000ms max, none merge (each is exactly 1000ms)
      expect(dialogues).toHaveLength(5);
    });

    it('splits at 、 (enumeration comma)', () => {
      const transcription = makeTranscription([
        {
          words: [
            {
              start: 0,
              end: 1000,
              text: '苹果、',
            },
            {
              start: 1000,
              end: 2000,
              text: '香蕉',
            },
          ],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
    });
  });

  describe('paragraph boundary terminates a fragment', () => {
    it('creates separate fragments for different paragraphs even without punctuation', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'first' }],
        },
        {
          words: [{ start: 1000, end: 2000, text: 'second' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
      expect(dialogues[0]).toContain('first');
      expect(dialogues[1]).toContain('second');
    });
  });

  describe('fragment merging', () => {
    it('merges consecutive short fragments when total duration <= maxDurationMsPerLine', () => {
      const transcription = makeTranscription([
        {
          words: [
            { start: 0, end: 500, text: '你好。' },
            { start: 500, end: 1000, text: '世界' },
          ],
        },
      ]);
      // maxDuration = 2000, total duration = 1000, should merge
      const converter = new TingwuTranscriptToAssConverter(transcription, 2000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(1);
      expect(dialogues[0]).toContain('你好。');
      expect(dialogues[0]).toContain('世界');
    });

    it('does not merge fragments when total duration > maxDurationMsPerLine', () => {
      const transcription = makeTranscription([
        {
          words: [
            { start: 0, end: 3000, text: '你好。' },
            { start: 3000, end: 6000, text: '世界' },
          ],
        },
      ]);
      // maxDuration = 3000, first fragment is 3000ms, second is 3000ms
      // combined would be 6000ms > 3000ms, should not merge
      const converter = new TingwuTranscriptToAssConverter(transcription, 3000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
    });

    it('merges multiple fragments up to the limit', () => {
      const transcription = makeTranscription([
        {
          words: [
            { start: 0, end: 1000, text: 'A.' },
            { start: 1000, end: 2000, text: 'B.' },
            { start: 2000, end: 3000, text: 'C.' },
            { start: 3000, end: 4000, text: 'D.' },
          ],
        },
      ]);
      // maxDuration = 2500: A+B = 2000ms (merge), C+D = 2000ms (merge)
      const converter = new TingwuTranscriptToAssConverter(transcription, 2500);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(2);
    });

    it('merges fragments across paragraph boundaries if duration allows', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 500, text: 'first' }],
        },
        {
          words: [{ start: 500, end: 1000, text: 'second' }],
        },
      ]);
      // Total duration (1000ms) <= maxDuration (5000ms),
      // fragments merge even across paragraph boundaries
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(1);
      expect(dialogues[0]).toContain('first');
      expect(dialogues[0]).toContain('second');
    });
  });

  describe('time formatting', () => {
    it('formats time as H:MM:SS.CC', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'test' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      // 0ms = 0:00:00.00, 1000ms = 0:00:01.00
      expect(dialogues[0]).toMatch(/Dialogue: 0,0:00:00\.00,0:00:01\.00,/);
    });

    it('formats 3661050ms correctly as 1:01:01.05', () => {
      // 3661050ms = 3661.050s = 61m1.050s = 1h1m1.050s
      // centiseconds = 05
      const transcription = makeTranscription([
        {
          words: [{ start: 3661050, end: 3662000, text: 'test' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues[0]).toContain('1:01:01.05');
    });

    it('formats times with zero-padded minutes and seconds', () => {
      // 5500ms = 5.5s = 0:00:05.50
      const transcription = makeTranscription([
        {
          words: [{ start: 5500, end: 65200, text: 'test' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(
        transcription,
        100000,
      );
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      // start: 5500ms = 0:00:05.50
      // end: 65200ms = 0:01:05.20
      expect(dialogues[0]).toMatch(/0:00:05\.50/);
      expect(dialogues[0]).toMatch(/0:01:05\.20/);
    });

    it('handles exact second boundaries', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 60000, end: 120000, text: 'test' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(
        transcription,
        100000,
      );
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      // 60000ms = 0:01:00.00, 120000ms = 0:02:00.00
      expect(dialogues[0]).toMatch(/0:01:00\.00/);
      expect(dialogues[0]).toMatch(/0:02:00\.00/);
    });
  });

  describe('text escaping', () => {
    it('escapes backslashes', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'path\\to\\file' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues[0]).toContain('path\\\\to\\\\file');
    });

    it('escapes opening curly braces', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'hello{world' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues[0]).toContain('hello\\{world');
    });

    it('escapes closing curly braces', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'hello}world' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues[0]).toContain('hello\\}world');
    });

    it('escapes all special characters together', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: '\\{test}' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues[0]).toContain('\\\\\\{test\\}');
    });
  });

  describe('Dialogue line format', () => {
    it('follows the correct Dialogue format', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'hello' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      // Format: Dialogue: 0,{start},{end},Default,,0,0,0,,{text}\n
      expect(dialogues[0]).toMatch(
        /^Dialogue: 0,\d:\d{2}:\d{2}\.\d{2},\d:\d{2}:\d{2}\.\d{2},Default,,0,0,0,,.*\n$/,
      );
    });
  });

  describe('header output', () => {
    it('yields at least one string before any Dialogue lines', () => {
      const transcription = makeTranscription([
        {
          words: [{ start: 0, end: 1000, text: 'test' }],
        },
      ]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);

      // Find the index of the first Dialogue line
      const firstDialogueIndex = output.findIndex((line) =>
        line.startsWith('Dialogue:'),
      );
      // There should be at least one element before the first Dialogue
      expect(firstDialogueIndex).toBeGreaterThan(0);
    });
  });

  describe('multiple paragraphs with mixed punctuation', () => {
    it('handles multiple paragraphs with various punctuation marks', () => {
      const transcription = makeTranscription([
        {
          words: [
            {
              start: 0,
              end: 1000,
              text: '你好。',
            },
            {
              start: 1000,
              end: 2000,
              text: '我是小明，',
            },
            {
              start: 2000,
              end: 3000,
              text: '你呢？',
            },
          ],
        },
        {
          words: [
            {
              start: 3000,
              end: 4000,
              text: 'Hello!',
            },
            {
              start: 4000,
              end: 5000,
              text: 'Nice to meet you.',
            },
          ],
        },
      ]);
      // maxDuration = 1000, so no merging
      const converter = new TingwuTranscriptToAssConverter(transcription, 1000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      // Paragraph 1: 3 fragments (all end with punctuation)
      // Paragraph 2: 2 fragments (both end with punctuation)
      expect(dialogues).toHaveLength(5);
    });

    it('merges fragments across paragraphs when duration allows', () => {
      const transcription = makeTranscription([
        {
          words: [
            {
              start: 0,
              end: 500,
              text: '你好。',
            },
            {
              start: 500,
              end: 1000,
              text: '世界',
            },
          ],
        },
        {
          words: [
            {
              start: 1000,
              end: 1500,
              text: 'Hello.',
            },
            {
              start: 1500,
              end: 2000,
              text: 'World',
            },
          ],
        },
      ]);
      // maxDuration = 5000, all fragments merge into one line
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const output = collectOutput(converter);
      const dialogues = getDialogueLines(output);
      expect(dialogues).toHaveLength(1);
    });
  });

  describe('generator protocol', () => {
    it('returns a proper generator', () => {
      const transcription = makeTranscription([]);
      const converter = new TingwuTranscriptToAssConverter(transcription, 5000);
      const gen = converter.generate();
      expect(gen[Symbol.iterator]).toBeDefined();
    });
  });
});
