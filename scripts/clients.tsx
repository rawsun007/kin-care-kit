/**
 * The care email as the family actually opens it: classic Outlook (the GP surgery's), Gmail on an Android phone (the
 * brother abroad), Apple Mail on an iPhone, light and dark. Writes docs/clients/ and a sheet of them, and fails on any
 * error the client models report. npx tsx scripts/clients.tsx
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { renderInEmailClients } from "@hyper-elements/email-clients";
import { closeBrowser, shoot } from "./shot";

const html = await readFile("examples/sharma/care-email.html", "utf8");
await mkdir("docs/clients", { recursive: true });
const { previews, diagnostics } = await renderInEmailClients(html, { emailClients: ["outlook", "gmail-app", "apple-mail"], dark: true });
const errors = diagnostics.filter((d) => (d.severity as string) === "error");
for (const d of diagnostics.filter((d) => d.severity !== "info")) console.log(`${d.severity} ${d.code} [${d.clients?.join(", ")}] ${d.message}`);
const shots: string[] = [];
for (const p of previews) {
  const out = `docs/clients/${p.filename.replace(/\.html$/, "")}.png`;
  await shoot(p.html, out, { width: Math.max(p.width ?? 420, 420), height: 1400, fullPage: false, scale: 1 });
  shots.push(out);
  console.log(`${p.filename}${p.dark ? " (dark)" : ""}${p.approximate ? " approximate" : ""}`);
}
await closeBrowser();
execSync(`magick ${shots.map((s) => `\\( ${s} -resize x900 -bordercolor "#f4efe6" -border 10 \\)`).join(" ")} -background "#f4efe6" -gravity north +append docs/clients.png`);
console.log(`${previews.length} previews, ${errors.length} errors`);
if (errors.length) process.exit(1);
