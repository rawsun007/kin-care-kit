import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { Column, Document, Text } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
const sets = { hinted: "assets/fonts/NotoSansDevanagari-", unhinted: ".cache/try/unhinted_ttf-", full: ".cache/try/full_ttf-" };
const line = "खुराक 5 mg से बढ़कर 10 mg हुई। न बदलें। दवाइयाँ";
const fonts = []; const rows = [];
for (const [k, p] of Object.entries(sets)) {
  for (const [w, f] of [[400, "Regular"], [700, "Bold"]] as const) fonts.push({ family: `D-${k}`, src: await readFile(`${p}${f}.ttf`), weight: w });
  rows.push(<Text style={{ fontFamily: `D-${k}`, fontSize: 22 }}>{`${k} 400: ${line}`}</Text>, <Text style={{ fontFamily: `D-${k}`, fontSize: 22, fontWeight: 700 }}>{`${k} 700: ${line}`}</Text>);
}
const { pdf } = await renderPdf(<Document size="A4" orientation="landscape"><Column style={{ gap: 10 }}>{rows}</Column></Document>, { fonts } as never);
await writeFile("out/deva.pdf", pdf as Uint8Array); execSync("pdftoppm -png -r 80 -singlefile out/deva.pdf out/deva");
