if (process.env.PATCH) await import("../pdf-setup");
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { Column, Document, Text } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
const f = (p: string) => readFile(`assets/fonts/${p}`);
const fonts = [{ family: "A", src: await f("NotoSansArabic-Regular.ttf"), weight: 400 }];
const t = (process.env.PRE ?? "") + "قبل النوم · قطرة واحدة";
const st = { fontFamily: "A", fontSize: 22, backgroundColor: "#eee" };
const rows = [
  ["rtl-root", <Document size="A5" dir="rtl"><Column style={{ gap: 6 }}><Text style={st}>{t}</Text></Column></Document>],
  ["ltr-root", <Document size="A5"><Column style={{ gap: 6 }}><Text style={st}>{t}</Text></Column></Document>],
  ["ltr-root-dirrtl", <Document size="A5"><Column style={{ gap: 6 }}><Text dir="rtl" style={st}>{t}</Text></Column></Document>],
  ["ltr-root-right", <Document size="A5"><Column style={{ gap: 6 }}><Text style={{ ...st, textAlign: "right" }}>{t}</Text></Column></Document>],
  ["ltr-center", <Document size="A5"><Column style={{ gap: 6 }}><Text style={{ ...st, textAlign: "center" }}>{t}</Text></Column></Document>],
] as const;
let i = 0;
for (const [k, d] of rows) {
  const { pdf } = await renderPdf(d, { fonts } as never);
  await writeFile("out/ar2.pdf", pdf as Uint8Array); execSync(`pdftoppm -png -r 60 -singlefile -H 90 out/ar2.pdf out/ar2-${i++}`);
}
execSync("magick " + rows.map((_, j) => `out/ar2-${j}.png`).join(" ") + " -append out/ar2.png");
