import "../pdf-setup";
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { Column, Document, Row, Text } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
const f = (p: string) => readFile(`assets/fonts/${p}`);
const fonts = [
  { family: "Noto Sans Devanagari", src: await f("NotoSansDevanagari-Regular.ttf"), weight: 400 },
  { family: "Noto Sans Devanagari", src: await f("NotoSansDevanagari-Bold.ttf"), weight: 700 },
];
const st = "'Noto Sans Devanagari'";
const t = "डॉक्टर से पूछे बिना कोई दवा बंद न करें, न बदलें।";
const v = [
  <Text key="a" style={{ fontFamily: st, fontWeight: 700, fontSize: 16 }}>{t}</Text>,
  <Text key="b" style={{ fontFamily: st, fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{t}</Text>,
  <Row key="c" stackOnMobile={false} style={{ gap: 14 }}><Column><Text style={{ fontFamily: st, fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{t}</Text></Column><Column style={{ width: 300 }}><Text>x</Text></Column></Row>,
  <Text key="d" style={{ fontFamily: st, fontSize: 16 }}>{t}</Text>,
];
const { pdf } = await renderPdf(<Document size="A5" orientation="landscape"><Column style={{ gap: 10 }}>{v}</Column></Document>, { fonts } as never);
await writeFile("out/deva3.pdf", pdf as Uint8Array); execSync("pdftoppm -png -r 90 -singlefile out/deva3.pdf out/deva3");
