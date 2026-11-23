/**
 * The site's icons and its social preview, drawn with the same Kin mark and fonts as the kit, by Hyper Elements'
 * image renderer: a favicon, an Apple touch icon, the web manifest's icons, and a 1200 × 630 card for links shared in
 * chats and on social sites.
 */
import { readFile } from "node:fs/promises";
import { Canvas, Column, Heading, Image, Row, Text } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { brand } from "../templates/_brands/kin";
import { Mark } from "../templates/_care/parts";

const colors = brand.theme.colors as Record<string, string>;

/** The mark as an SVG file, for browsers that take an SVG favicon. */
export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 4 L36 17 L36 36 L4 36 L4 17 Z" fill="${colors.primary}"/><path d="M20 31 C13 26 11 22.5 11 20 A4.5 4.5 0 0 1 20 18 A4.5 4.5 0 0 1 29 20 C29 22.5 27 26 20 31 Z" fill="${colors.accent}"/></svg>\n`;

/** A square icon: the mark on Kin's paper colour, with room around it for the rounded corners phones cut. */
function Icon({ size, padding }: { size: number; padding: number }) {
  return (
    <Canvas width={size} height={size} lang="en" theme={brand.theme} style={{ backgroundColor: colors.background, padding, alignItems: "center", justifyContent: "center" }}>
      <Mark size={size - padding * 2} color={colors.primary!} accent={colors.accent!} />
    </Canvas>
  );
}

/** The card a shared link shows. */
function Social({ chart }: { chart: string }) {
  const first = (stack: string) => stack.split(",")[0]!.trim().replace(/^'|'$/g, "");
  const fonts = brand.theme.fonts as Record<string, string>;
  return (
    <Canvas width={1200} height={630} lang="en" fonts={brand.fonts} theme={brand.theme} style={{ backgroundColor: colors.background, color: colors.foreground, padding: 64, gap: 0, justifyContent: "center", fontFamily: first(fonts.body!) }}>
      <Row stackOnMobile={false} style={{ gap: 48, alignItems: "center" }}>
        <Column style={{ width: 540, gap: 22 }}>
          <Row stackOnMobile={false} style={{ gap: 14, alignItems: "center" }}>
            <Mark size={52} color={colors.primary!} accent={colors.accent!} />
            <Text style={{ fontFamily: first(fonts.body!), fontSize: 30, fontWeight: 700, color: colors.primary }}>Kin care kit</Text>
          </Row>
          <Heading level={1} fit={{ sizes: [58, 52, 46], maxLines: 4 }} style={{ fontFamily: first(fonts.heading!), lineHeight: 1.08, color: colors.foreground }}>
            One care file. Every paper a family needs to look after a parent.
          </Heading>
          <Text style={{ fontFamily: first(fonts.body!), fontSize: 24, lineHeight: 1.4, color: colors.muted }}>Fridge chart · wallet cards · care email · care page · week card. Built with Hyper Elements.</Text>
        </Column>
        <Image src={chart} alt="Dad's fridge chart" style={{ width: 468, borderRadius: 14, border: { width: 2, style: "solid", color: colors.border } }} />
      </Row>
    </Canvas>
  );
}

export async function drawAssets(fonts: unknown) {
  const icon = async (size: number, padding: number) => (await renderImage(<Icon size={size} padding={padding} />)).image;
  const chart = `data:image/png;base64,${(await readFile("examples/thompson/fridge-chart-1.png")).toString("base64")}`;
  const social = await renderImage(<Social chart={chart} />, { fonts: fonts as never });
  const problems = social.diagnostics.filter((d) => d.severity !== "info");
  if (problems.length) throw new Error(`social card: ${problems.map((d) => d.message).join("; ")}`);
  return {
    "favicon.svg": FAVICON_SVG,
    "favicon-32.png": await icon(32, 1),
    "apple-touch-icon.png": await icon(180, 22),
    "icon-192.png": await icon(192, 24),
    "icon-512.png": await icon(512, 64),
    "og.png": social.image,
  };
}
