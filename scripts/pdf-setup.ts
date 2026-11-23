/**
 * Two fixes for the PDF renderer under Hyper Elements (react-pdf and fontkit), so Indic text prints whole. Import this
 * before rendering a PDF.
 *
 * 1. fontkit caches each glyph by its id, with the characters it stood for the first time it was drawn. In Devanagari
 *    one glyph stands for different characters in different words: the mark on top of "ई" is the same glyph as a
 *    reph, and stands for no character of its own there. A later word got the first word's characters, react-pdf
 *    counted more characters than the line had, and the end of the line went missing: "न बदलें।" printed as
 *    "न बदल◌े", "हुई" as "हुइ". Here a glyph drawn for other characters (or for none) gets a view of its own.
 * 2. react-pdf splits long words into syllables by English patterns to wrap them; it keeps words whole instead.
 */
import { readFileSync } from "node:fs";
import { Font } from "@react-pdf/renderer";
import { create } from "fontkit";

type Glyph = { codePoints?: number[] };
const sample = create(readFileSync(new URL("../assets/fonts/AtkinsonHyperlegible-Regular.ttf", import.meta.url))) as object;
const proto = Object.getPrototypeOf(sample) as { getGlyph: (id: number, characters?: number[]) => Glyph | null; __kinMended?: boolean };

if (!proto.__kinMended) {
  const getGlyph = proto.getGlyph;
  proto.getGlyph = function (id: number, characters: number[] = []) {
    const glyph = getGlyph.call(this, id, characters);
    if (!glyph) return glyph;
    const same = glyph.codePoints?.length === characters.length && glyph.codePoints.every((c, i) => c === characters[i]);
    if (same) return glyph;
    const view = Object.create(glyph) as Glyph;
    view.codePoints = characters;
    return view;
  };
  proto.__kinMended = true;
}

Font.registerHyphenationCallback((word) => [word]);
