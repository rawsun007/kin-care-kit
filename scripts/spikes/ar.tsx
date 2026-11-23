if (process.env.PATCH) await import("../pdf-setup");
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { Column, Document, Text } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
const f = (p: string) => readFile(`assets/fonts/${p}`);
const fonts = [
  { family: "A", src: await f("NotoSansArabic-Regular.ttf"), weight: 400 },
  { family: "A", src: await f("NotoSansArabic-Bold.ttf"), weight: 700 },
];
const { pdf } = await renderPdf(<Document size="A5" orientation="landscape" dir="rtl"><Column style={{ gap: 6 }}><Text style={{ fontFamily: "A", fontSize: 22 }}>قبل النوم · قطرة واحدة</Text><Text style={{ fontFamily: "A", fontSize: 22, fontWeight: 700 }}>قبل النوم · قطرة واحدة</Text></Column></Document>, { fonts } as never);
await writeFile("out/ar.pdf", pdf as Uint8Array); execSync(`pdftoppm -png -r 90 -singlefile out/ar.pdf out/ar-${process.env.PATCH ? "p" : "n"}`);
