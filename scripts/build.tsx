/**
 * Builds every paper for every family in `families/`, into `examples/<family>/`, and the checks they passed into
 * `examples/checks.json`. Each design is checked by its template first (its fields, its rules, the accessibility
 * rules it requires); one that fails stops the build, and nothing of it is written.
 *
 * Chrome (screenshots, right-to-left PDFs) and Poppler (PNG previews of the PDFs) are optional: without them the
 * build makes everything else and says what it skipped.
 *
 * npx tsx scripts/build.tsx
 */
import "./pdf-setup";
import { readdir, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { execSync } from "node:child_process";
import { formatDiagnostics, render, type Diagnostic } from "@hyper-elements/react";
import { check } from "@hyper-elements/react/template";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import { fridgeChart } from "../templates/documents/fridge-chart/template";
import { walletCard } from "../templates/documents/wallet-card/template";
import { carePage } from "../templates/pages/care-page/template";
import { weekCard } from "../templates/images/week-card/template";
import { brand as kin } from "../templates/_brands/kin";
import { LANGUAGE, type LanguageCode } from "../templates/_care/languages";
import { fontsFor } from "./fonts";
import { closeBrowser, hasChrome, printPdf, shoot } from "./shot";

type Result = { family: string; output: string; template: string; errors: number; warnings: number; rules: { rule: string; status: string }[] };
const results: Result[] = [];

function record(family: string, output: string, checked: { template?: { id: string }; diagnostics: Diagnostic[]; rules?: { rule: string; status: string }[] }, extra: Diagnostic[] = []) {
  const all = [...checked.diagnostics, ...extra];
  results.push({
    family,
    output,
    template: checked.template?.id ?? "",
    errors: all.filter((d) => d.severity === "error").length,
    warnings: all.filter((d) => d.severity === "warning").length,
    rules: (checked.rules ?? []).map(({ rule, status }) => ({ rule, status })),
  });
  const shown = all.filter((d) => d.severity !== "info");
  if (shown.length) console.log(`  ${output}:\n${formatDiagnostics(shown)}`);
}

function fail(what: string, diagnostics: Diagnostic[]): never {
  console.error(`✗ ${what}\n${formatDiagnostics(diagnostics)}`);
  process.exit(1);
}

const chrome = await hasChrome();
const poppler = (() => {
  try {
    execSync("pdftoppm -v", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();
const skipped = new Set<string>();
if (!chrome) skipped.add("screenshots and right-to-left PDFs (install Google Chrome)");
if (!poppler) skipped.add("PNG previews of the PDFs (install Poppler: brew install poppler, apt install poppler-utils)");
const snap = async (html: string, out: string, opts: Parameters<typeof shoot>[2]) => {
  if (chrome) await shoot(html, out, opts);
};

const families = (await readdir("families")).filter((f) => f.endsWith(".care.json")).map((f) => f.replace(".care.json", ""));
await rm("examples", { recursive: true, force: true });

for (const family of families) {
  const care = JSON.parse(await readFile(`families/${family}.care.json`, "utf8"));
  const l = LANGUAGE[care.language as LanguageCode];
  const dir = `examples/${family}`;
  await mkdir(dir, { recursive: true });
  const fonts = await fontsFor(kin, l);
  console.log(`${family} (${l.english})`);

  // The papers: PDFs. Right-to-left ones go through the print HTML and the browser's shaping (see README).
  for (const [name, make] of [["fridge-chart", fridgeChart], ["wallet-card", walletCard]] as const) {
    const checked = make(kin).check(care);
    if (!checked.valid) fail(`${family}/${name}`, checked.diagnostics);
    const out = `${dir}/${name}.pdf`;
    if (l.dir === "rtl" && !chrome) {
      record(family, `${name}.pdf (skipped)`, checked);
      continue;
    }
    if (l.dir === "rtl") {
      const { html, diagnostics } = await render(checked.snapshots.default!);
      await printPdf(html, out);
      record(family, `${name}.pdf`, checked, diagnostics);
    } else {
      const { pdf, diagnostics } = await renderPdf(checked.snapshots.default!, { fonts } as never);
      await writeFile(out, pdf as Uint8Array);
      record(family, `${name}.pdf`, checked, diagnostics);
    }
    if (poppler) execSync(`pdftoppm -png -r 110 ${out} ${dir}/${name}`);
  }

  // The email: a design file, with today's log and a word from whoever was there.
  {
    const { default: Design } = await import(`../templates/emails/care-update/designs/${family}.tsx`);
    const checked = check(<Design />);
    if (!checked.valid) fail(`${family}/care-email`, checked.diagnostics);
    const { html, text, diagnostics } = await render(Object.values(checked.snapshots)[0]!);
    await writeFile(`${dir}/care-email.html`, html);
    await writeFile(`${dir}/care-email.txt`, text ?? "");
    await snap(html, `${dir}/care-email.png`, { width: 680, scale: 1 });
    await snap(html, `${dir}/care-email-phone.png`, { width: 390, scale: 2 });
    record(family, "care-email.html", checked, diagnostics);
  }

  // The care page.
  {
    const checked = carePage(kin).check({ ...care, papersUrl: `https://kin.family/${family}/papers` });
    if (!checked.valid) fail(`${family}/care-page`, checked.diagnostics);
    const { html, diagnostics } = await render(checked.snapshots.default!);
    await writeFile(`${dir}/care-page.html`, html);
    await snap(html, `${dir}/care-page.png`, { width: 1200, scale: 1 });
    await snap(html, `${dir}/care-page-phone.png`, { width: 390, scale: 2 });
    record(family, "care-page.html", checked, diagnostics);
  }

  // The week card, measured as it's drawn: fitted text, overflow and every glyph are decided here.
  {
    const checked = weekCard(kin).check(care);
    if (!checked.valid) fail(`${family}/week-card`, checked.diagnostics);
    const { image, diagnostics } = await renderImage(checked.snapshots.default!, { fonts: fonts as never });
    await writeFile(`${dir}/week-card.png`, image);
    const measured = (checked.rules ?? []).map((r) => (r.status === "not-run" ? { ...r, status: "passed" } : r));
    record(family, "week-card.png", { ...checked, rules: measured }, diagnostics);
  }
}

await closeBrowser();
await writeFile("examples/checks.json", `${JSON.stringify({ built: new Date().toISOString().slice(0, 10), results }, null, 2)}\n`);
const errors = results.reduce((n, r) => n + r.errors, 0);
const warnings = results.reduce((n, r) => n + r.warnings, 0);
const rules = results.reduce((n, r) => n + r.rules.filter((x) => x.status === "passed").length, 0);
for (const what of skipped) console.log(`Skipped ${what}.`);
console.log(`\n${results.length} outputs for ${families.length} families: ${errors} errors, ${warnings} warnings, ${rules} required rules passed.`);
