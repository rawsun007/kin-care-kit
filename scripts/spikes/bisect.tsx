import "../pdf-setup";
import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { renderPdf } from "@hyper-elements/react/pdf";
import { fridgeChart } from "../../templates/documents/fridge-chart/template";
import { brand } from "../../templates/_brands/kin";
import { LANGUAGE } from "../../templates/_care/languages";
import { fontsFor } from "../fonts";
const base = JSON.parse(await readFile("families/sharma.care.json", "utf8"));
const fonts = await fontsFor(brand, LANGUAGE.hi);
const t = fridgeChart(brand);
const cases: Record<string, any> = {
  all: base,
  oneMed: { ...base, medicines: [base.medicines[0]] },
  noChange: { ...base, medicines: base.medicines.map((m: any) => ({ ...m, change: undefined, since: undefined, note: undefined })) },
  onlyChanged: { ...base, medicines: [base.medicines[1]] },
};
for (const [k, care] of Object.entries(cases)) {
  const c = t.check(care); if (!c.valid) { console.log(k, "invalid"); continue; }
  const snap: any = structuredClone(c.snapshots.default!);
  const root = snap.root ?? snap;
  if (process.env.DROP) { const kids = JSON.stringify(Object.keys(snap)); if (!globalThis.__k) { console.log(kids); (globalThis as any).__k = 1; } }
  const { pdf } = await renderPdf(snap, { fonts } as never);
  await writeFile("out/b.pdf", pdf as Uint8Array);
  console.log(k, execSync("pdftotext -f 1 -l 1 out/b.pdf - | grep -o 'न बदल.*'").toString().trim());
}
