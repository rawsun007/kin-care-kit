import "../pdf-setup";
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { Column, Document, Text } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { brand } from "../../templates/_brands/kin";
import { fontsFor } from "../fonts";
import { LANGUAGE, fontFacesFor } from "../../templates/_care/languages";
const st = "'Noto Sans Devanagari', 'Atkinson Hyperlegible', Verdana, Arial, sans-serif";
const t = "डॉक्टर से पूछे बिना कोई दवा बंद न करें, न बदलें।";
const fonts = await fontsFor(brand, LANGUAGE.hi);
const mk = (props: object) => <Document size="A5" orientation="landscape" {...props}><Column style={{ gap: 10 }}><Text style={{ fontFamily: st, fontWeight: 700, fontSize: 13 }}>{"बदली · Changed खुराक 5 mg से बढ़कर 10 mg हुई"}</Text><Text style={{ fontFamily: st, fontWeight: 700, fontSize: 16 }}>{t}</Text></Column></Document>;
let i = 0;
for (const props of [{}]) {
  const { pdf } = await renderPdf(mk(props), { fonts } as never);
  await writeFile(`out/d4-${i}.pdf`, pdf as Uint8Array); execSync(`pdftoppm -png -r 70 -singlefile -H 120 out/d4-${i}.pdf out/d4-${i}`); i++;
}
