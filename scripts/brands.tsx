/**
 * The gallery test: every Kin template, made from each of the nine sample brands the official Hyper Elements gallery
 * tests its own templates in, must check clean and render. Writes `docs/brands/` and a contact sheet of them.
 * npx tsx scripts/brands.tsx
 */
import "./pdf-setup";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { formatDiagnostics, render } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import type { Brand } from "../templates/_brand";
import { fridgeChart } from "../templates/documents/fridge-chart/template";
import { walletCard } from "../templates/documents/wallet-card/template";
import { careUpdate } from "../templates/emails/care-update/template";
import { carePage } from "../templates/pages/care-page/template";
import { weekCard } from "../templates/images/week-card/template";
import { LANGUAGE } from "../templates/_care/languages";
import { fontsFor } from "./fonts";
import { closeBrowser, shoot } from "./shot";

const NAMES = ["casa-albero", "ember", "keel", "orbit", "oyen", "pell-ashby", "pith", "quarry", "slow-signals"];
const care = JSON.parse(await readFile("families/sharma.care.json", "utf8"));
await mkdir("docs/brands", { recursive: true });
let failures = 0;
const ok = (name: string, what: string, checked: { valid: boolean; diagnostics: Parameters<typeof formatDiagnostics>[0] }) => {
  if (!checked.valid) {
    failures++;
    console.error(`✗ ${name} ${what}\n${formatDiagnostics(checked.diagnostics)}`);
  }
  return checked.valid;
};

for (const name of NAMES) {
  const { brand } = (await import(`../templates/_brands/gallery/${name}.ts`)) as { brand: Brand };
  const fonts = await fontsFor(brand, LANGUAGE.hi);
  const site = brand.links.site;

  const email = careUpdate(brand).check({ ...care, from: "Priya", careUrl: `${site}/care/sharma`, log: [{ type: "reading", what: "bp", value: "138/84", when: "Before breakfast" }] });
  if (ok(name, "email", email)) await shoot((await render(email.snapshots.default!)).html, `docs/brands/${name}-email.png`, { width: 640, height: 1100, fullPage: false, scale: 1 });

  const page = carePage(brand).check({ ...care, papersUrl: `${site}/care/sharma/papers` });
  if (ok(name, "page", page)) await render(page.snapshots.default!);

  for (const [what, make] of [["fridge", fridgeChart], ["card", walletCard]] as const) {
    const doc = make(brand).check(care);
    if (!ok(name, what, doc)) continue;
    const { pdf } = await renderPdf(doc.snapshots.default!, { fonts } as never);
    await writeFile(`docs/brands/${name}-${what}.pdf`, pdf as Uint8Array);
  }
  execSync(`pdftoppm -png -r 50 -f 1 -l 1 -singlefile docs/brands/${name}-fridge.pdf docs/brands/${name}-fridge && rm docs/brands/${name}-*.pdf`);

  const week = weekCard(brand).check(care);
  if (ok(name, "week card", week)) await writeFile(`docs/brands/${name}-week.png`, (await renderImage(week.snapshots.default!, { fonts: fonts as never, scale: 0.4 })).image);
  console.log(`✓ ${brand.name}`);
}
await closeBrowser();

// Contact sheets, without montage (it needs a system font for its labels).
const sheet = (kind: string, size: string, out: string, perRow: number) => {
  const rows: string[] = [];
  for (let i = 0; i < NAMES.length; i += perRow)
    rows.push(`\\( ${NAMES.slice(i, i + perRow).map((n) => `\\( docs/brands/${n}-${kind}.png -resize ${size} -bordercolor "#f4efe6" -border 10 \\)`).join(" ")} -background "#f4efe6" -gravity north +append \\)`);
  execSync(`magick ${rows.join(" ")} -background "#f4efe6" -append ${out}`);
};
sheet("fridge", "520x", "docs/brands-charts.png", 3);
sheet("email", "300x", "docs/brands-emails.png", 9);
sheet("week", "216x", "docs/brands-weeks.png", 9);
console.log(failures ? `${failures} failed` : "All nine gallery brands check clean and render.");
if (failures) process.exit(1);
