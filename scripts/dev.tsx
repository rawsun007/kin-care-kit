// Quick loop while designing: check one template for one family, render it, and draw page images to look at.
// npx tsx scripts/dev.tsx <fridge|card> [family]
import "./pdf-setup";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { formatDiagnostics } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { fridgeChart } from "../templates/documents/fridge-chart/template";
import { walletCard } from "../templates/documents/wallet-card/template";
import { brand as kin } from "../templates/_brands/kin";
import { LANGUAGE } from "../templates/_care/languages";
import { fontsFor } from "./fonts";

const which = process.argv[2] ?? "fridge";
const family = process.argv[3] ?? "sharma";
const care = JSON.parse(await readFile(`families/${family}.care.json`, "utf8"));
const t = ({ fridge: fridgeChart, card: walletCard } as const)[which as "fridge"](kin);
const checked = t.check(care);
console.log(formatDiagnostics(checked.diagnostics) || "no diagnostics");
if (!checked.valid) process.exit(1);
const { pdf, diagnostics } = await renderPdf(checked.snapshots.default!, { fonts: await fontsFor(kin, LANGUAGE[care.language as "hi"]) } as never);
console.log(formatDiagnostics(diagnostics) || "pdf: no diagnostics");
await mkdir("out", { recursive: true });
await writeFile(`out/${family}-${which}.pdf`, pdf as Uint8Array);
execSync(`pdftoppm -png -r 110 out/${family}-${which}.pdf out/${family}-${which}`);
