import "../pdf-setup";
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { Column, Document, Text } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
const f = (p: string) => readFile(`assets/fonts/${p}`);
const fonts = [
  { family: "Noto Sans Devanagari", src: await f("NotoSansDevanagari-Regular.ttf"), weight: 400 },
  { family: "Noto Sans Devanagari", src: await f("NotoSansDevanagari-Bold.ttf"), weight: 700 },
  { family: "Atkinson Hyperlegible", src: await f("AtkinsonHyperlegible-Regular.ttf"), weight: 400 },
  { family: "Atkinson Hyperlegible", src: await f("AtkinsonHyperlegible-Bold.ttf"), weight: 700 },
];
const line = "न करें, न बदलें। हुई";
const stacks = ["'Noto Sans Devanagari'", "'Noto Sans Devanagari', 'Atkinson Hyperlegible', Verdana, Arial, sans-serif"];
const rows = stacks.flatMap((st, i) => [400, 700].map((w) => <Text key={`${i}${w}`} style={{ fontFamily: st, fontWeight: w, fontSize: 24 }}>{`${i} ${w}: ${line}`}</Text>));
const { pdf, diagnostics } = await renderPdf(<Document size="A5" orientation="landscape"><Column style={{ gap: 10 }}>{rows}</Column></Document>, { fonts } as never);
console.log(diagnostics);
await writeFile("out/deva2.pdf", pdf as Uint8Array); execSync("pdftoppm -png -r 80 -singlefile out/deva2.pdf out/deva2");
