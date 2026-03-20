import { Readable } from 'node:stream';

import type { SubtitleLine } from '../type/subtitle.js';

export function generateAss(segments: SubtitleLine[]): Readable {
  const header = `[Script Info]
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

  let index = 0;

  return new Readable({
    read() {
      if (index === 0) {
        this.push(header);
      }

      if (index < segments.length) {
        const seg = segments[index];
        const start = msToAssTime(seg.start);
        const end = msToAssTime(seg.end);
        this.push(
          `Dialogue: 0,${start},${end},Default,,0,0,0,,${escapeAssText(seg.text)}\n`,
        );
        index++;
      } else {
        this.push(null);
      }
    },
  });
}

function escapeAssText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function msToAssTime(ms: number): string {
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
