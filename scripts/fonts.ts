/**
 * The font files a design needs, as bytes, for the PDF and image renderers (they fetch nothing). A font the kit
 * hosts is read from `assets/fonts`; any other (a gallery brand's) is downloaded once into `.cache/fonts`.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { Brand } from "../templates/_brand";
import { CDN } from "../templates/_brands/kin";
import { fontFacesFor, type Language } from "../templates/_care/languages";

const ROOT = new URL("..", import.meta.url).pathname;
const CACHE = join(ROOT, ".cache/fonts");

async function bytes(src: string): Promise<Buffer> {
  if (src.startsWith(CDN)) return readFile(join(ROOT, src.slice(CDN.length)));
  await mkdir(CACHE, { recursive: true });
  const file = join(CACHE, basename(new URL(src).pathname));
  if (!existsSync(file)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Couldn't download ${src}: ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFile(file);
}

export type FontBytes = { family: string; src: Buffer; weight: number; style: "normal" | "italic" };

export async function fontsFor(brand: Brand, lang: Language): Promise<FontBytes[]> {
  const faces = [...brand.fonts, ...fontFacesFor(lang)];
  return Promise.all(faces.map(async (f) => ({ family: f.family, src: await bytes(f.src), weight: f.weight, style: f.style })));
}

/** An image the design names, as bytes, for the image renderer. */
export const imageBytes = bytes;
