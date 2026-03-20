import type { TingwuParagraph, TingwuTranscription } from '@/types/tingwu.js';

interface Fragment {
  start: number;
  end: number;
  text: string;
}

/**
 * Converts a Tingwu transcription into ASS (Advanced SubStation Alpha) subtitle format.
 *
 * The conversion pipeline: paragraphs → punctuation-split fragments → merged lines → ASS dialogue events.
 */
export class TingwuTranscriptToAssConverter {
  private static readonly HEADER = `[Script Info]
Title: AI Subtitle
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,10,10,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  private readonly paragraphs: TingwuParagraph[];
  private readonly maxDurationMsPerLine: number;

  constructor(
    transcription: TingwuTranscription,
    maxDurationMsPerLine: number,
  ) {
    this.paragraphs = transcription.Transcription.Paragraphs;
    this.maxDurationMsPerLine = maxDurationMsPerLine;
  }

  /**
   * Yields ASS file content as strings: the header followed by one Dialogue event per subtitle line.
   */
  *generate(): Generator<string> {
    yield TingwuTranscriptToAssConverter.HEADER;

    const fragments = this.splitOnPunctuation();
    const lines = this.mergeShortFragments(fragments);

    for (const line of lines) {
      const start = TingwuTranscriptToAssConverter.formatAssTime(line.start);
      const end = TingwuTranscriptToAssConverter.formatAssTime(line.end);
      const text = TingwuTranscriptToAssConverter.escapeAssText(line.text);
      yield `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
    }
  }

  /**
   * Splits paragraphs into fragments at punctuation boundaries.
   * Each word ending with a punctuation mark terminates the current fragment.
   * Paragraph boundaries also terminate fragments.
   */
  private splitOnPunctuation(): Fragment[] {
    const punctuationPattern = /[。？！、，.?!,]$/;
    const fragments: Fragment[] = [];
    let current: Fragment | null = null;

    for (const para of this.paragraphs) {
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

  /**
   * Merges consecutive fragments into longer lines as long as the
   * combined duration does not exceed {@link maxDurationMsPerLine}.
   */
  private mergeShortFragments(fragments: Fragment[]): Fragment[] {
    const merged: Fragment[] = [];
    let current: Fragment | null = null;

    for (const frag of fragments) {
      if (!current) {
        current = { ...frag };
        continue;
      }

      const mergedDuration = frag.end - current.start;
      if (mergedDuration <= this.maxDurationMsPerLine) {
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

  /** Converts milliseconds to ASS time format `H:MM:SS.CC`. */
  private static formatAssTime(ms: number): string {
    const MS_PER_HOUR = 3600000;
    const MS_PER_MINUTE = 60000;
    const MS_PER_SECOND = 1000;
    const MS_PER_CENTISECOND = 10;

    const h = Math.floor(ms / MS_PER_HOUR);
    const m = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE);
    const s = Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND);
    const cs = Math.floor((ms % MS_PER_SECOND) / MS_PER_CENTISECOND);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  /** Escapes backslashes, curly braces for ASS text fields. */
  private static escapeAssText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}');
  }
}
