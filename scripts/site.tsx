/**
 * Builds the GitHub Pages site into `_site/`: the landing page (site/index.tsx, a Hyper Elements Page, checked with the
 * accessibility rules), every family's outputs from `examples/`, and the images in `docs/`. Each family's care page
 * is rendered again so its "Print" buttons point at the PDFs beside it on the site.
 *
 * SITE_URL sets where the site lives; on GitHub Actions it's worked out from the repository.
 * npx tsx scripts/site.tsx
 */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { formatDiagnostics, render, validate } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { carePage } from "../templates/pages/care-page/template";
import { brand as kin } from "../templates/_brands/kin";
import Site, { FAMILIES } from "../site/index";

const repo = process.env.GITHUB_REPOSITORY ?? "rawsun007/kin-care-kit";
const [owner, name] = repo.split("/") as [string, string];
const host = `${owner.toLowerCase()}.github.io`;
const SITE_URL = (process.env.SITE_URL ?? `https://${host}/${name}`).replace(/\/$/, "");
const OUT = "_site";

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// The landing page, held to the same rules as the care page.
const site = <Site />;
const checked = await validate(site, { plugins: [lint({ kind: "transactional" })] } as never);
const problems = checked.diagnostics.filter((d) => d.severity === "error" || d.severity === "warning");
if (problems.length) {
  console.error(formatDiagnostics(problems));
  process.exit(1);
}
const { html } = await render(site);
await writeFile(`${OUT}/index.html`, html);

// The families, with their care pages pointing at the papers on this site.
const brand = { ...kin, links: { ...kin.links, domains: [...kin.links.domains, new URL(SITE_URL).hostname] } };
for (const f of FAMILIES) {
  await cp(`examples/${f.id}`, `${OUT}/${f.id}`, { recursive: true });
  const care = JSON.parse(await readFile(`families/${f.id}.care.json`, "utf8"));
  const page = carePage(brand).check({ ...care, papersUrl: `${SITE_URL}/${f.id}` });
  if (!page.valid) {
    console.error(formatDiagnostics(page.diagnostics));
    process.exit(1);
  }
  await writeFile(`${OUT}/${f.id}/care-page.html`, (await render(page.snapshots.default!)).html);
}

await cp("docs", `${OUT}/docs`, { recursive: true });
await cp("examples/checks.json", `${OUT}/checks.json`);
await writeFile(`${OUT}/.nojekyll`, "");
console.log(`Built ${OUT}/ for ${SITE_URL}`);
