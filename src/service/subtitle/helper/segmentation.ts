import type { Segment, SubtitleLine } from '../type/subtitle.js';
import type { TingwuParagraph } from '../type/tingwu-transcription.js';

export function convertParagraphsToLines(
  paragraphs: TingwuParagraph[],
  maxDurationMsPerLine: number,
): SubtitleLine[] {
  const fragments = splitOnPunctuation(paragraphs);
  const merged = mergeShortFragments(fragments, maxDurationMsPerLine);
  return forceSplitLongSegments(merged, maxDurationMsPerLine);
}

function splitOnPunctuation(paragraphs: TingwuParagraph[]): Segment[] {
  const punctuationPattern = /[。？！、，.?!,]$/;
  const fragments: Segment[] = [];
  let current: Segment | null = null;

  for (const para of paragraphs) {
    for (const word of para.Words) {
      if (!current) {
        current = { start: word.Start, end: word.End, text: '', words: [] };
      }
      current.end = word.End;
      current.text += word.Text;
      current.words.push(word);

      if (punctuationPattern.test(word.Text)) {
        fragments.push(current);
        current = null;
      }
    }

    if (current) {
      fragments.push(current);
      current = null;
    }
  }

  return fragments;
}

function mergeShortFragments(
  fragments: Segment[],
  maxDurationMs: number,
): Segment[] {
  const merged: Segment[] = [];
  let current: Segment | null = null;

  for (const frag of fragments) {
    if (!current) {
      current = { ...frag, words: [...frag.words] };
      continue;
    }

    const mergedDuration = frag.end - current.start;
    if (mergedDuration <= maxDurationMs) {
      current.end = frag.end;
      current.text += frag.text;
      current.words.push(...frag.words);
    } else {
      merged.push(current);
      current = { ...frag, words: [...frag.words] };
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}

function forceSplitLongSegments(
  segments: Segment[],
  maxDurationMs: number,
): SubtitleLine[] {
  const result: SubtitleLine[] = [];

  for (const seg of segments) {
    const duration = seg.end - seg.start;
    if (duration <= maxDurationMs) {
      result.push({ start: seg.start, end: seg.end, text: seg.text });
      continue;
    }

    const { words } = seg;
    let chunkStart = words[0].Start;
    let chunkText = '';

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      chunkText += w.Text;
      const chunkDuration = w.End - chunkStart;
      const isLast = i === words.length - 1;

      if (chunkDuration >= maxDurationMs || isLast) {
        result.push({ start: chunkStart, end: w.End, text: chunkText });
        if (!isLast) {
          chunkStart = words[i + 1].Start;
          chunkText = '';
        }
      }
    }
  }

  return result;
}
