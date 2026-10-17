import type { CoverSequences } from '../types/post.ts';

export type CoverSequence = keyof CoverSequences;

export function changeCoverSequence(current: CoverSequences, lang: CoverSequence, values: string[]): CoverSequences {
  return { ...current, [lang]: values };
}

export function removeCoverFrame(current: CoverSequences, lang: CoverSequence, index: number): CoverSequences {
  return changeCoverSequence(current, lang, current[lang].filter((_, at) => at !== index));
}

export function moveCoverFrame(current: CoverSequences, lang: CoverSequence, index: number, offset: number): CoverSequences {
  const target = index + offset;
  if (index < 0 || index >= current[lang].length || target < 0 || target >= current[lang].length) return current;
  const values = [...current[lang]];
  [values[index], values[target]] = [values[target], values[index]];
  return changeCoverSequence(current, lang, values);
}
