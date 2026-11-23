import { readFile } from "node:fs/promises";
import { render } from "@hyper-elements/react";
import { fridgeChart } from "../../templates/documents/fridge-chart/template";
import { brand } from "../../templates/_brands/kin";
const base = JSON.parse(await readFile("families/sharma.care.json", "utf8"));
const c = fridgeChart(brand).check(base);
const { html } = await render(c.snapshots.default!);
for (const w of ["बदलें", "हुई", "हु"]) { const i = html.indexOf(w); console.log(w, i, JSON.stringify(html.slice(i - 20, i + 30))); }
