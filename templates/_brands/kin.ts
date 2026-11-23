/**
 * Kin. A family's own brand, for the papers that go on the fridge and in a wallet: warm paper, evergreen ink, a
 * terracotta accent for what's changed. Body text is Atkinson Hyperlegible, a typeface drawn by the Braille Institute
 * for readers with low vision, at 18px, because the reader is often 80.
 */
import { defineTheme } from "@hyper-elements/react";
import type { Brand } from "../_brand";

/** Where the kit's fonts and images are served from once the repository is public: jsDelivr, from GitHub. */
export const CDN = "https://cdn.jsdelivr.net/gh/rawsun007/kin-care-kit@main";

export const brand: Brand = {
  name: "Kin",
  theme: defineTheme({
    colors: {
      background: "#fbf7f0",
      foreground: "#1e2a27",
      primary: "#1f5c4a",
      primaryForeground: "#ffffff",
      border: "#e2d8c6",
      muted: "#56605c",
      surface: "#f3ecdf",
      accent: "#a9441f",
    },
    fonts: {
      body: "'Atkinson Hyperlegible', Verdana, Arial, sans-serif",
      heading: "Fraunces, Georgia, 'Times New Roman', serif",
    },
    fontSizes: { body: 18, small: 15 },
    lineHeights: { body: 1.55, heading: 1.15 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radii: { sm: 8, md: 16 },
    elements: {
      Heading: {
        fontWeight: 700,
        by: {
          level: {
            1: { fontSize: 36, lineHeight: 1.1, mobile: { fontSize: 30 } },
            2: { fontSize: 26, lineHeight: 1.2 },
            3: { fontSize: 20, lineHeight: 1.25 },
          },
        },
      },
    },
  }),
  logo: { src: `${CDN}/assets/brand/kin-logo.png`, width: 480, height: 120, alt: "Kin" },
  address: "Kin is a family's own kit: nobody sells it, and no one else sees it.",
  links: {
    site: "https://kin.family",
    domains: ["kin.family", "*.kin.family"],
    unsubscribe: "https://kin.family/sharma/settings",
    preferences: "https://kin.family/sharma/settings",
    help: "https://kin.family/help",
  },
  currency: "GBP",
  lang: "en",
  fonts: [
    { family: "Atkinson Hyperlegible", src: `${CDN}/assets/fonts/AtkinsonHyperlegible-Regular.ttf`, weight: 400, style: "normal" },
    { family: "Atkinson Hyperlegible", src: `${CDN}/assets/fonts/AtkinsonHyperlegible-Bold.ttf`, weight: 700, style: "normal" },
    { family: "Fraunces", src: `${CDN}/assets/fonts/Fraunces-600.ttf`, weight: 600, style: "normal" },
    { family: "Fraunces", src: `${CDN}/assets/fonts/Fraunces-700.ttf`, weight: 700, style: "normal" },
  ],
};
