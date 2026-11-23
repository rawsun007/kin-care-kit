/** The README's hero image, laid out in HTML from the built examples and screenshotted. npx tsx scripts/hero.ts */
import { pathToFileURL } from "node:url";
import { rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const u = (p: string) => pathToFileURL(resolve(p)).href;
const html = `<!doctype html><html><body style="margin:0;background:#efe7da;font-family:Georgia,serif">
<div style="display:flex;gap:28px;padding:40px;align-items:flex-start;width:1540px">
  <div style="display:flex;flex-direction:column;gap:24px;width:1080px">
    <img src="${u("examples/thompson/fridge-chart-1.png")}" style="width:100%;border:1px solid #d8cdb9;border-radius:6px">
    <div style="display:flex;gap:24px">
      <div style="flex:1;height:420px;overflow:hidden;border:1px solid #d8cdb9;border-radius:6px"><img src="${u("examples/sharma/fridge-chart-1.png")}" style="width:100%"></div>
      <div style="flex:1;height:420px;overflow:hidden;border:1px solid #d8cdb9;border-radius:6px"><img src="${u("examples/miller/wallet-card-1.png")}" style="width:100%;margin-top:-90px"></div>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:24px;width:390px">
    <div style="height:760px;overflow:hidden;border:1px solid #d8cdb9;border-radius:18px"><img src="${u("examples/thompson/care-email-phone.png")}" style="width:100%"></div>
    <img src="${u("examples/thompson/week-card.png")}" style="width:100%;border-radius:6px">
  </div>
</div></body></html>`;
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1620, height: 800 }, deviceScaleFactor: 1 });
// Written beside the images and opened as a file: a page from setContent() may not load file: images.
await writeFile("docs/.hero.html", html);
await page.goto(u("docs/.hero.html"), { waitUntil: "load" });
await rm("docs/.hero.html");
await page.screenshot({ path: "docs/hero.png", fullPage: true });
await browser.close();
