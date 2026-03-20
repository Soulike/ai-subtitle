import type { TingwuParagraph } from '@/types/tingwu.js';

import type { SubtitleLine } from '../type/subtitle.js';

interface Fragment {
  start: number;
  end: number;
  text: string;
}

export function convertParagraphsToLines(
  paragraphs: TingwuParagraph[],
  maxDurationMsPerLine: number,
): SubtitleLine[] {
  const fragments = splitOnPunctuation(paragraphs);
  return mergeShortFragments(fragments, maxDurationMsPerLine);
}

function splitOnPunctuation(paragraphs: TingwuParagraph[]): Fragment[] {
  const punctuationPattern = /[。？！、，.?!,]$/;
  const fragments: Fragment[] = [];
  let current: Fragment | null = null;

  for (const para of paragraphs) {
    for (const word of para.Words) {
      if (!current) {
        current = { start: word.Start, end: word.End, text: '' };
      }
      current.end = word.End;
      current.text += word.Text;

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
  fragments: Fragment[],
  maxDurationMs: number,
): SubtitleLine[] {
  const merged: SubtitleLine[] = [];
  let current: Fragment | null = null;

  for (const frag of fragments) {
    if (!current) {
      current = { ...frag };
      continue;
    }

    const mergedDuration = frag.end - current.start;
    if (mergedDuration <= maxDurationMs) {
      current.end = frag.end;
      current.text += frag.text;
    } else {
      merged.push(current);
      current = { ...frag };
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
}
