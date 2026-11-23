/**
 * Builds the GitHub Pages site into `_site/`: the landing page (site/index.tsx, a Hyper Elements Page, checked with the
 * accessibility rules), every family's outputs from `examples/`, and the images in `docs/`. Each family's care page
 * is rendered again so its "Print" buttons point at the PDFs beside it on the site.
 *
 * Also: the icons and the social preview card (site/assets.tsx, drawn by renderImage), the tags a page's head needs
 * for them, a web manifest, a 404 page, robots.txt and a sitemap.
 *
 * SITE_URL sets where the site lives; on GitHub Actions it's worked out from the repository.
 * npx tsx scripts/site.tsx
 */
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { formatDiagnostics, render, validate } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { carePage } from "../templates/pages/care-page/template";
import { brand as kin } from "../templates/_brands/kin";
import { LANGUAGE } from "../templates/_care/languages";
import Site, { FAMILIES, IN_THEIR_LANGUAGE } from "../site/index";
import NotFound from "../site/not-found";
import { drawAssets } from "../site/assets";
import { fontsFor } from "./fonts";

const repo = process.env.GITHUB_REPOSITORY ?? "rawsun007/kin-care-kit";
const [owner, name] = repo.split("/") as [string, string];
const host = `${owner.toLowerCase()}.github.io`;
const SITE_URL = (process.env.SITE_URL ?? `https://${host}/${name}`).replace(/\/$/, "");
const BASE = new URL(SITE_URL).pathname.replace(/\/$/, "");
const OUT = "_site";
const colors = kin.theme.colors as Record<string, string>;
const TITLE = "Kin care kit";
const DESCRIPTION =
  "One care file, and every paper a family needs to look after a parent: a fridge chart, emergency wallet cards, a care page, a weekly email and a card for the family chat. Built with Hyper Elements.";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** What every page on the site gets in its head: the icons and the theme colour. */
const ICONS = [
  `<link rel="icon" href="${BASE}/favicon.svg" type="image/svg+xml">`,
  `<link rel="icon" href="${BASE}/favicon-32.png" type="image/png" sizes="32x32">`,
  `<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">`,
  `<link rel="manifest" href="${BASE}/site.webmanifest">`,
  `<meta name="theme-color" content="${colors.primary}">`,
].join("");

/** A shareable page's head: its canonical address and the card a shared link shows. */
function share(path: string, title: string, description: string) {
  const url = `${SITE_URL}${path}`;
  return [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${TITLE}">`,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${SITE_URL}/og.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="Kin care kit: one care file, every paper a family needs to look after a parent">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(title)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${SITE_URL}/og.png">`,
  ].join("");
}

const withHead = (html: string, extra: string) => {
  if (!html.includes("</title>")) throw new Error("a page without a <title>: nowhere to put its head tags");
  return html.replace("</title>", `</title>${extra}`);
};

async function checkedPage(element: React.ReactElement, what: string) {
  const checked = await validate(element, { plugins: [lint({ kind: "transactional" })] } as never);
  const problems = checked.diagnostics.filter((d) => d.severity === "error" || d.severity === "warning");
  if (problems.length) {
    console.error(`✗ ${what}\n${formatDiagnostics(problems)}`);
    process.exit(1);
  }
  return (await render(element)).html;
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// The landing page and the 404 page, held to the same rules as the care page.
await writeFile(`${OUT}/index.html`, withHead(await checkedPage(<Site />, "index"), ICONS + share("/", TITLE, DESCRIPTION)));
await writeFile(`${OUT}/404.html`, withHead(await checkedPage(<NotFound home={`${BASE}/`} />, "404"), ICONS + `<meta name="robots" content="noindex">`));

// The families, with their care pages pointing at the papers on this site.
const brand = { ...kin, links: { ...kin.links, domains: [...kin.links.domains, new URL(SITE_URL).hostname] } };
const pages: string[] = ["/"];
for (const f of [...FAMILIES, ...IN_THEIR_LANGUAGE]) {
  await cp(`examples/${f.id}`, `${OUT}/${f.id}`, { recursive: true });
  const care = JSON.parse(await readFile(`families/${f.id}.care.json`, "utf8"));
  const page = carePage(brand).check({ ...care, papersUrl: `${SITE_URL}/${f.id}` });
  if (!page.valid) {
    console.error(formatDiagnostics(page.diagnostics));
    process.exit(1);
  }
  const title = `${f.parent}'s care page · ${TITLE}`;
  const about = `An example from the Kin care kit: ${f.name}'s medicines, appointments and rota, made from one care file.`;
  await writeFile(`${OUT}/${f.id}/care-page.html`, withHead((await render(page.snapshots.default!)).html, ICONS + share(`/${f.id}/care-page.html`, title, about)));
  pages.push(`/${f.id}/care-page.html`);
  // The email is an email: it keeps its own head, plus the icons for a browser tab. Search engines skip it.
  const email = await readFile(`${OUT}/${f.id}/care-email.html`, "utf8");
  await writeFile(`${OUT}/${f.id}/care-email.html`, withHead(email, ICONS + `<meta name="robots" content="noindex">`));
}

// The icons, the manifest and the social card.
const assets = await drawAssets(await fontsFor(kin, LANGUAGE.en));
for (const [file, bytes] of Object.entries(assets)) await writeFile(`${OUT}/${file}`, bytes);
await writeFile(
  `${OUT}/site.webmanifest`,
  `${JSON.stringify(
    {
      name: TITLE,
      short_name: "Kin",
      description: DESCRIPTION,
      start_url: `${BASE}/`,
      scope: `${BASE}/`,
      display: "browser",
      background_color: colors.background,
      theme_color: colors.primary,
      icons: [
        { src: `${BASE}/icon-192.png`, sizes: "192x192", type: "image/png" },
        { src: `${BASE}/icon-512.png`, sizes: "512x512", type: "image/png" },
        { src: `${BASE}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    null,
    2,
  )}\n`,
);

await cp("docs", `${OUT}/docs`, { recursive: true });
await cp("examples/checks.json", `${OUT}/checks.json`);
await writeFile(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
await writeFile(
  `${OUT}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
await writeFile(`${OUT}/.nojekyll`, "");
console.log(`Built ${OUT}/ for ${SITE_URL}: ${(await readdir(OUT)).length} entries`);
