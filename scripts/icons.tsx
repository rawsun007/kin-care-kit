/**
 * The kit's own images, drawn by Hyper Elements: the logo, and each time of day's icon as a PNG for the email (which
 * can't draw shapes). The same SlotIcon the PDFs and the page draw as vectors, so every output shows the same sun.
 * npx tsx scripts/icons.tsx
 */
import { mkdir, writeFile } from "node:fs/promises";
import { Canvas, Row, Text } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { brand as kin } from "../templates/_brands/kin";
import { LANGUAGE, SLOTS } from "../templates/_care/languages";
import { Mark, SlotIcon } from "../templates/_care/parts";
import { fontsFor } from "./fonts";

const fonts = await fontsFor(kin, LANGUAGE.en);
const colors = kin.theme.colors as Record<string, string>;
await mkdir("assets/icons", { recursive: true });
await mkdir("assets/brand", { recursive: true });

for (const s of SLOTS) {
  const { image } = await renderImage(
    <Canvas width={32} height={32} style={{ padding: 0 }}>
      <SlotIcon slot={s} size={32} />
    </Canvas>,
    { fonts, scale: 2 },
  );
  await writeFile(`assets/icons/${s}.png`, image);
}

const logo = await renderImage(
  <Canvas width={240} height={60} style={{ padding: [6, 0], backgroundColor: "transparent" }}>
    <Row stackOnMobile={false} style={{ gap: 10, alignItems: "center" }}>
      <Mark size={46} color={colors.primary!} accent={colors.accent!} />
      <Text style={{ fontFamily: "Fraunces", fontSize: 38, fontWeight: 700, lineHeight: 1, color: colors.primary }}>Kin</Text>
    </Row>
  </Canvas>,
  { fonts, scale: 2 },
);
await writeFile("assets/brand/kin-logo.png", logo.image);
console.log("icons and logo written");
