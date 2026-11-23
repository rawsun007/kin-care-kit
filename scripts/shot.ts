/**
 * Screenshots of HTML (an email, a page, an email client's preview) in Chrome. Files the kit hosts on jsDelivr are
 * served from this folder, so a screenshot shows them before the repository is pushed.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Browser } from "playwright-core";
import { CDN } from "../templates/_brands/kin";

const ROOT = new URL("..", import.meta.url).pathname;
let browser: Browser | undefined;

export async function shoot(html: string, out: string, { width = 680, height = 900, fullPage = true, scale = 2 } = {}) {
  browser ??= await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.route(`${CDN}/**`, async (route) => {
    const path = join(ROOT, route.request().url().slice(CDN.length).split("?")[0]!);
    try {
      await route.fulfill({ body: await readFile(path) });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, fullPage });
  await page.close();
}

export const closeBrowser = async () => {
  await browser?.close();
  browser = undefined;
};
