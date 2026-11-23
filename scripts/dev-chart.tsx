// Quick loop while designing: check and render one template for one family, then draw page images to look at.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { formatDiagnostics } from "@hyper-elements/react";
import "./pdf-setup";
import { renderPdf } from "@hyper-elements/react/pdf";
import { fridgeChart } from "../templates/documents/fridge-chart/template";
import { brand as kin } from "../templates/_brands/kin";
import { LANGUAGE } from "../templates/_care/languages";
import { fontsFor } from "./fonts";

const family = process.argv[2] ?? "sharma";
const care = JSON.parse(await readFile(`families/${family}.care.json`, "utf8"));
const t = fridgeChart(kin);
const checked = t.check(care);
console.log(formatDiagnostics(checked.diagnostics) || "no diagnostics");
if (!checked.valid) process.exit(1);
const { pdf, diagnostics } = await renderPdf(checked.snapshots.default!, { fonts: await fontsFor(kin, LANGUAGE[care.language as "hi"]) } as never);
console.log(formatDiagnostics(diagnostics) || "pdf: no diagnostics");
await mkdir("out", { recursive: true });
await writeFile(`out/${family}-fridge.pdf`, pdf as Uint8Array);
execSync(`pdftoppm -png -r 110 out/${family}-fridge.pdf out/${family}-fridge`);
