import "../pdf-setup";
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { Column, Document, Heading, Text } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
const f = (p: string) => readFile(`assets/fonts/${p}`);
const fonts = [
  { family: "Noto Sans Devanagari", src: await f("NotoSansDevanagari-Regular.ttf"), weight: 400 },
  { family: "Noto Sans Devanagari", src: await f("NotoSansDevanagari-Bold.ttf"), weight: 700 },
];
const ff = "'Noto Sans Devanagari'";
const run = async (name: string, first: JSX.Element) => {
  const { pdf } = await renderPdf(<Document size="A5"><Column>{first}<Text style={{ fontFamily: ff, fontWeight: 700, fontSize: 16 }}>न बदलें। हुई</Text></Column></Document>, { fonts } as never);
  await writeFile("out/m.pdf", pdf as Uint8Array);
  console.log(name.padEnd(14), execSync("pdftotext out/m.pdf - | grep -o \"न बदल.*\"").toString().trim());
};
await run("text16", <Text style={{ fontFamily: ff, fontWeight: 700, fontSize: 16 }}>कमला शर्मा</Text>);
await run("text36", <Text style={{ fontFamily: ff, fontWeight: 700, fontSize: 36 }}>कमला शर्मा</Text>);
await run("heading36", <Heading style={{ fontFamily: ff, fontSize: 36 }}>कमला शर्मा</Heading>);
await run("text36-kamla", <Text style={{ fontFamily: ff, fontWeight: 700, fontSize: 36 }}>कमला</Text>);
await run("text36-sharma", <Text style={{ fontFamily: ff, fontWeight: 700, fontSize: 36 }}>शर्मा</Text>);
await run("text36-reg", <Text style={{ fontFamily: ff, fontWeight: 400, fontSize: 36 }}>कमला शर्मा</Text>);
