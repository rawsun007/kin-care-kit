/**
 * The project's own site, for GitHub Pages: a Hyper Elements Page, in the Kin brand, that shows what the kit makes
 * and links to every output for every family. `scripts/site.tsx` renders it into `_site/` with the examples beside it.
 */
import { Button, Column, Grid, Heading, Image, Link, List, ListItem, Page, Row, Section, Text, token } from "@hyper-elements/react";
import { brand } from "../templates/_brands/kin";
import { Mark } from "../templates/_care/parts";

export const REPO = "https://github.com/rawsun007/kin-care-kit";

export type Family = { id: string; parent: string; name: string; language: string; script: string; place: string; note: string };

export const FAMILIES: Family[] = [
  { id: "thompson", parent: "Dad", name: "Peter Thompson", language: "English", script: "English", place: "Bristol", note: "Home after a heart attack: a new blood thinner he mustn't miss, a dose that just went up." },
  { id: "miller", parent: "Grandma", name: "Dorothy Miller", language: "English", script: "English", place: "Columbus, Ohio", note: "Early Alzheimer's, insulin in units, eye drops at bedtime, 911 not 999." },
];

/** The same kit for a parent who reads best in another language: their script first, English beside it. */
export const IN_THEIR_LANGUAGE: Family[] = [
  { id: "sharma", parent: "Amma", name: "Kamala Sharma", language: "Hindi", script: "हिन्दी", place: "Leicester", note: "Six medicines in Devanagari, with English under every line." },
  { id: "haddad", parent: "Baba", name: "Youssef Haddad", language: "Arabic", script: "العربية", place: "Manchester", note: "Right to left: the whole chart mirrors, English stays left to right inside it." },
];

const TEMPLATES = [
  { name: "Fridge chart", root: "Document · PDF", text: "The day's medicines by time of day, a drawing of each pill, in the parent's script. Page 2: a week of tick boxes with who's on each day." },
  { name: "Wallet cards", root: "Document · PDF", text: "Two fold-in-half emergency cards: one in English for a stranger, one in the parent's language. Allergies first." },
  { name: "Care email", root: "Email", text: "What whoever visited sends the family: refills, dose changes and appointments that need someone, today's readings, a word from them." },
  { name: "Care page", root: "Page", text: "The one shared page for the brother abroad, the new carer, the locum GP: everything, with refill dates and what's changed." },
  { name: "Week card", root: "Canvas · PNG", text: "A 1080 × 1350 image for the family chat on a Monday: who's with the parent each day, the next appointment, what to order." },
];

const muted = { color: token("colors.muted") } as const;
const card = { backgroundColor: "#ffffff", borderRadius: token("radii.md"), padding: 24, gap: 10, border: { width: 1, style: "solid", color: token("colors.border") }, mobile: { padding: 18 } } as const;
const band = { padding: [56, 32], gap: 24, mobile: { padding: [36, 16] } } as const;
const colors = brand.theme.colors as Record<string, string>;

export default function Site() {
  return (
    <Page
      width={1120}
      lang="en"
      title="Kin care kit"
      description="One care file, and every paper a family needs to look after a parent: a fridge chart, emergency cards, a care page, a weekly email and a group-chat card, in the parent's own language and English. Built with Hyper Elements."
      theme={brand.theme}
      fonts={brand.fonts}
      style={{ backgroundColor: token("colors.background"), color: token("colors.foreground"), gap: 0 }}
    >
      <Section style={{ padding: [24, 32], mobile: { padding: [16, 16] } }}>
        <Row stackOnMobile={false} style={{ gap: 12, alignItems: "center" }}>
          <Mark size={32} color={colors.primary!} accent={colors.accent!} />
          <Text style={{ fontSize: 20, fontWeight: 700, color: token("colors.primary") }}>Kin care kit</Text>
          <Text style={{ textAlign: "right", fontSize: 16 }}>
            <Link href={REPO}>Source on GitHub</Link>
          </Text>
        </Row>
      </Section>

      <Section style={{ ...band, padding: [32, 32, 48], mobile: { padding: [16, 16, 32] } }}>
        <Heading level={1} style={{ fontSize: 60, lineHeight: 1.05, mobile: { fontSize: 38 } }}>
          One care file. Every paper a family needs to look after a parent.
        </Heading>
        <Text style={{ fontSize: 21, lineHeight: 1.5, mobile: { fontSize: 18 } }}>
          {"A fridge chart, emergency cards, a care page, a weekly email and a card for the family chat, from one file the family keeps up to date. Five "}
          <Link href="https://hyperelements.dev">Hyper Elements</Link>
          {" templates, checked before anything is printed."}
        </Text>
        <Row style={{ gap: 12 }}>
          <Button href="thompson/care-page.html" style={{ flex: "none", fontSize: 18, padding: [14, 22], borderRadius: token("radii.sm") }}>
            {"See Dad's care page"}
          </Button>
          <Button href={REPO} style={{ flex: "none", fontSize: 18, padding: [14, 22], borderRadius: token("radii.sm"), backgroundColor: token("colors.background"), color: token("colors.primary"), border: { width: 2, style: "solid", color: token("colors.primary") } }}>
            Read the code
          </Button>
        </Row>
        <Image src="docs/hero.png" alt="Dad's fridge chart, Grandma's wallet cards, the Hindi chart, the care email on a phone and the week card" style={{ width: "100%", borderRadius: token("radii.md") }} />
      </Section>

      <Section style={{ ...band, backgroundColor: token("colors.surface") }}>
        <Heading level={2}>Two families, every output</Heading>
        <Text style={muted}>Each family is one JSON file. Everything below was built from it by npm run build, and every check passed.</Text>
        <Grid columns={2} style={{ gap: 16 }}>
          {FAMILIES.map((f) => (
            <Column key={f.id} style={{ ...card }}>
              <Image src={`${f.id}/fridge-chart-1.png`} alt={`${f.parent}'s fridge chart, in ${f.language} and English`} style={{ width: "100%", borderRadius: token("radii.sm"), border: { width: 1, style: "solid", color: token("colors.border") } }} />
              <Heading level={3}>{`${f.parent}: ${f.name}`}</Heading>
              <Text style={{ fontSize: 16, ...muted }}>{`${f.place}. ${f.note}`}</Text>
              <List style={{ fontSize: 17 }}>
                <ListItem>
                  <Link href={`${f.id}/care-page.html`}>Care page</Link>
                </ListItem>
                <ListItem>
                  <Link href={`${f.id}/care-email.html`}>Care email</Link>
                </ListItem>
                <ListItem>
                  <Link href={`${f.id}/fridge-chart.pdf`}>Fridge chart (PDF)</Link>
                </ListItem>
                <ListItem>
                  <Link href={`${f.id}/wallet-card.pdf`}>Wallet cards (PDF)</Link>
                </ListItem>
                <ListItem>
                  <Link href={`${f.id}/week-card.png`}>Week card (PNG)</Link>
                </ListItem>
              </List>
            </Column>
          ))}
        </Grid>
      </Section>

      <Section style={band}>
        <Heading level={2}>Also in the language they read best</Heading>
        <Text>
          Many parents who moved countries read their first language far better than English, more so when they're tired or unwell. Set one field in the care file and the fridge chart and the wallet card print in their script, with English beside every line for the carer and the paramedic. The email, the page and the week card stay in English for the family.
        </Text>
        <Grid columns={2} style={{ gap: 16 }}>
          {IN_THEIR_LANGUAGE.map((f) => (
            <Column key={f.id} style={card}>
              <Image src={`${f.id}/fridge-chart-1.png`} alt={`${f.parent}'s fridge chart, in ${f.language} and English`} style={{ width: "100%", borderRadius: token("radii.sm"), border: { width: 1, style: "solid", color: token("colors.border") } }} />
              <Heading level={3}>{`${f.language}: ${f.parent}`}</Heading>
              <Text style={{ fontSize: 16, ...muted }}>{f.note}</Text>
              <Text style={{ fontSize: 17 }}>
                <Link href={`${f.id}/fridge-chart.pdf`}>Fridge chart</Link>
                {" · "}
                <Link href={`${f.id}/wallet-card.pdf`}>Wallet cards</Link>
                {" · "}
                <Link href={`${f.id}/care-page.html`}>Care page</Link>
              </Text>
            </Column>
          ))}
        </Grid>
      </Section>

      <Section style={{ ...band, backgroundColor: token("colors.surface") }}>
        <Heading level={2}>Five templates, one data file</Heading>
        <Grid columns={3} style={{ gap: 16 }}>
          {TEMPLATES.map((t) => (
            <Column key={t.name} style={card}>
              <Text style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", ...muted }}>{t.root}</Text>
              <Heading level={3}>{t.name}</Heading>
              <Text style={{ fontSize: 16 }}>{t.text}</Text>
            </Column>
          ))}
        </Grid>
      </Section>

      <Section style={band}>
        <Heading level={2}>Drops into the Hyper Elements gallery</Heading>
        <Text>
          Every template is a template() factory over the gallery's own Brand contract. Built from each of the nine sample brands the official gallery tests in, every one checks clean and renders. Safety colours (the emergency number, allergies, dose changes) stay fixed, dark brands get light inks that still pass contrast, and paper is always white.
        </Text>
        <Image src="docs/brands-charts.png" alt="The fridge chart in all nine gallery brands" style={{ width: "100%", borderRadius: token("radii.sm") }} />
        <Image src="docs/brands-weeks.png" alt="The week card in all nine gallery brands" style={{ width: "100%", borderRadius: token("radii.sm") }} />
      </Section>

      <Section style={{ ...band, backgroundColor: token("colors.surface") }}>
        <Heading level={2}>Checked before it's printed</Heading>
        <List style={{ fontSize: 17 }}>
          <ListItem>Accessibility rules are required, not suggested: contrast, text size, language and direction, headings, link text, image text, preview text and the page title. A design that breaks one doesn't build.</ListItem>
          <ListItem>{"The fridge chart refuses to overflow: \"a medicine cut off a chart is worse than none\"."}</ListItem>
          <ListItem>A mistake in a care file (a medicine with no dose, a number a phone can't dial, no family contact) stops the build and says what's wrong.</ListItem>
          <ListItem>The care email, in classic Outlook, the Gmail app and Apple Mail, light and dark: 0 errors.</ListItem>
        </List>
        <Image src="docs/clients.png" alt="The care email in classic Outlook, the Gmail app and Apple Mail, light and dark" style={{ width: "100%", borderRadius: token("radii.sm") }} />
      </Section>

      <Section style={{ padding: [32, 32, 48], gap: 8, border: { top: { width: 1, style: "solid", color: token("colors.border") } }, mobile: { padding: [24, 16, 32] } }}>
        <Text style={{ fontSize: 15, ...muted }}>
          {"Kin is not medical advice: the GP and the pharmacist have the last word on every dose. The families are made up. The Hindi and Arabic are a first draft for a native speaker to check. MIT licensed. "}
          <Link href={REPO}>Source on GitHub</Link>
          {"."}
        </Text>
      </Section>
    </Page>
  );
}
