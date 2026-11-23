import "../pdf-setup";
import { writeFile } from "node:fs/promises";
import { Column, Document, Row, Span, Text, token } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { brand } from "../../templates/_brands/kin";
import { fontsFor } from "../fonts";
import { LANGUAGE, fontFacesFor, stackFor } from "../../templates/_care/languages";
const l = LANGUAGE.hi;
const ownStyle = { fontFamily: stackFor(l, (brand.theme.fonts as any).body) };
const fonts = await fontsFor(brand, l);
const variants: Record<string, JSX.Element> = {
  full: (
    <Row stackOnMobile={false} style={{ gap: 14, alignItems: "center" }}>
      <Column style={{ gap: 0 }}>
        <Text style={{ ...ownStyle, fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{l.t.dontStop}</Text>
        <Text style={{ fontSize: 13, lineHeight: 1.3, color: "#56605c" }}>{"Don't stop or change any medicine without asking the doctor."}</Text>
      </Column>
      <Column style={{ flex: "none", width: 380, gap: 0 }}>
        <Text style={{ ...ownStyle, fontSize: 13, lineHeight: 1.35, textAlign: "right" }}><Span style={{ fontWeight: 700 }}>{l.t.doctor}</Span>{" Dr X · +44"}</Text>
      </Column>
    </Row>
  ),
  nostyle: <Text style={{ ...ownStyle, fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{l.t.dontStop}</Text>,
};
for (const [k, v] of Object.entries(variants)) {
  for (const doc of ["plain", "styled"]) {
    const el = doc === "plain"
      ? <Document size="A4" orientation="landscape" margin={36}>{v}</Document>
      : <Document size="A4" orientation="landscape" margin={36} lang="hi" theme={brand.theme} fonts={[...brand.fonts, ...fontFacesFor(l)]} style={{ fontSize: 16, lineHeight: 1.4, color: token("colors.foreground"), backgroundColor: token("colors.background") }}><Document.Page style={{ gap: 14 }}>{v}</Document.Page></Document>;
    const { pdf } = await renderPdf(el, { fonts } as never);
    await writeFile(`out/d5.pdf`, pdf as Uint8Array);
    const { execSync } = await import("node:child_process");
    console.log(k, doc, execSync("pdftotext out/d5.pdf - | head -1").toString().trim());
  }
}
