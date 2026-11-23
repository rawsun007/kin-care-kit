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
  { id: "thompson", parent: "Dad", name: "Peter Thompson", language: "English", script: "English", place: "Bristol", note: "Just home after a heart attack. There's a new blood thinner he really can't miss, and his blood pressure tablet just went up." },
  { id: "miller", parent: "Grandma", name: "Dorothy Miller", language: "English", script: "English", place: "Columbus, Ohio", note: "Early Alzheimer's, insulin at 7 every evening and eye drops at bedtime." },
];

/** The same kit for a parent who reads best in another language: their script first, English beside it. */
export const IN_THEIR_LANGUAGE: Family[] = [
  { id: "sharma", parent: "Amma", name: "Kamala Sharma", language: "Hindi", script: "हिन्दी", place: "Leicester", note: "Amma's chart in Hindi, with English under each line." },
  { id: "haddad", parent: "Baba", name: "Youssef Haddad", language: "Arabic", script: "العربية", place: "Manchester", note: "Baba's in Arabic, so the whole chart flips right to left." },
];

const TEMPLATES = [
  { name: "Fridge chart", root: "Document · PDF", href: "thompson/fridge-chart.pdf", text: "Every medicine by time of day, with a little drawing of each pill so nobody mixes up two white tablets. Page two is a tick sheet for the week." },
  { name: "Wallet cards", root: "Document · PDF", href: "thompson/wallet-card.pdf", text: "Fold-in-half emergency cards, one for the wallet and a spare. Allergies come first, then medicines and who to call." },
  { name: "Care email", root: "Email", href: "thompson/care-email.html", text: "Whoever popped in sends it to everyone else. It says what needs doing this week, today's readings, and a few words of their own." },
  { name: "Care page", root: "Page", href: "thompson/care-page.html", text: "One page to share with the brother who lives abroad, a new carer or a locum GP. Every dose, when to reorder, and what's changed." },
  { name: "Week card", root: "Canvas · PNG", href: "thompson/week-card.png", text: "A picture for the family chat on Monday morning. Who's with Dad each day, the next appointment, and what to order first." },
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
      description="One care file, and every paper a family needs to look after a parent: a fridge chart, emergency wallet cards, a care page, a weekly email and a card for the family chat. Built with Hyper Elements."
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
          Keep a parent's care in one file, not five group chats.
        </Heading>
        <Text style={{ fontSize: 21, lineHeight: 1.5, mobile: { fontSize: 18 } }}>
          {"The medicine list usually lives in a photo of the pharmacy bag, a note on the fridge and whatever your sister remembers. Kin turns one small file into a fridge chart, wallet cards, a page to share, a Monday email and a picture for the family chat. It's built with "}
          <Link href="https://hyperelements.dev">Hyper Elements</Link>
          {"."}
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
        <Heading level={2}>Meet Dad and Grandma</Heading>
        <Text style={muted}>{"Two made-up families. Everything below is the real output, built from each family's care file, so click around."}</Text>
        <Row style={{ gap: 16, alignItems: "stretch" }}>
          {FAMILIES.map((f) => (
            <Column key={f.id} style={{ ...card, justifyContent: "space-between" }}>
              <Column style={{ gap: 10 }}>
                <Image src={`${f.id}/fridge-chart-1.png`} alt={`${f.parent}'s fridge chart`} style={{ width: "100%", borderRadius: token("radii.sm"), border: { width: 1, style: "solid", color: token("colors.border") } }} />
                <Heading level={3}>{`${f.parent}: ${f.name}`}</Heading>
                <Text style={{ fontSize: 16, ...muted }}>{`${f.place}. ${f.note}`}</Text>
              </Column>
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
        </Row>
      </Section>

      <Section style={band}>
        <Heading level={2}>{"If English isn't their first language"}</Heading>
        <Text>
          Plenty of parents read their first language far better than English, especially when they're tired or poorly. Change one line in the care file and the fridge chart and wallet cards print in their script, with English next to every line for the carer or the paramedic.
        </Text>
        <Row style={{ gap: 16, alignItems: "stretch" }}>
          {IN_THEIR_LANGUAGE.map((f) => (
            <Column key={f.id} style={{ ...card, justifyContent: "space-between" }}>
              <Column style={{ gap: 10 }}>
                <Image src={`${f.id}/fridge-chart-1.png`} alt={`${f.parent}'s fridge chart, in ${f.language} and English`} style={{ width: "100%", borderRadius: token("radii.sm"), border: { width: 1, style: "solid", color: token("colors.border") } }} />
                <Heading level={3}>{`${f.language}: ${f.parent}`}</Heading>
                <Text style={{ fontSize: 16, ...muted }}>{f.note}</Text>
              </Column>
              <Text style={{ fontSize: 17 }}>
                <Link href={`${f.id}/fridge-chart.pdf`}>Fridge chart</Link>
                {" · "}
                <Link href={`${f.id}/wallet-card.pdf`}>Wallet cards</Link>
                {" · "}
                <Link href={`${f.id}/care-page.html`}>Care page</Link>
              </Text>
            </Column>
          ))}
        </Row>
      </Section>

      <Section style={{ ...band, backgroundColor: token("colors.surface") }}>
        <Heading level={2}>{"What's in the kit"}</Heading>
        <Column style={{ gap: 16 }}>
        {[0, 3].map((start) => (
          <Row key={start} style={{ gap: 16, alignItems: "stretch" }}>
            {start === 0 ? (
              <Column style={{ ...card, justifyContent: "space-between", backgroundColor: token("colors.primary"), color: token("colors.primaryForeground"), border: { width: 1, style: "solid", color: token("colors.primary") } }}>
                <Column style={{ gap: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>The one file you edit</Text>
                  <Heading level={3} style={{ color: token("colors.primaryForeground") }}>The care file</Heading>
                  <Text style={{ fontSize: 16 }}>{"Medicines, allergies, contacts, appointments and who's on each day. If something's off, like a dose with no time or a phone number that can't be dialled, it tells you before anything gets printed."}</Text>
                </Column>
                <Text style={{ fontSize: 16, fontWeight: 700 }}>
                  <Link href="https://github.com/rawsun007/kin-care-kit/blob/main/families/thompson.care.json" style={{ color: token("colors.primaryForeground") }}>{"Dad's care file"}</Link>
                </Text>
              </Column>
            ) : null}
            {TEMPLATES.slice(start === 0 ? 0 : 2, start === 0 ? 2 : 5).map((t) => (
              <Column key={t.name} style={{ ...card, justifyContent: "space-between" }}>
                <Column style={{ gap: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", ...muted }}>{t.root}</Text>
                  <Heading level={3}>{t.name}</Heading>
                  <Text style={{ fontSize: 16 }}>{t.text}</Text>
                </Column>
                <Text style={{ fontSize: 16, fontWeight: 700 }}>
                  <Link href={t.href}>{`Dad's ${t.name.toLowerCase()}`}</Link>
                </Text>
              </Column>
            ))}
          </Row>
        ))}
        </Column>
      </Section>

      <Section style={band}>
        <Heading level={2}>Works with any brand</Heading>
        <Text>
          Each template takes a brand, the same way the official Hyper Elements gallery templates do. Here's the fridge chart and the week card in all nine of the gallery's sample brands. A few things never change, though. The emergency box and allergies stay red, and paper stays white, because nobody wants to print a black page for the fridge.
        </Text>
        <Image src="docs/brands-charts.png" alt="The fridge chart in all nine gallery brands" style={{ width: "100%", borderRadius: token("radii.sm") }} />
        <Image src="docs/brands-weeks.png" alt="The week card in all nine gallery brands" style={{ width: "100%", borderRadius: token("radii.sm") }} />
      </Section>

      <Section style={{ ...band, backgroundColor: token("colors.surface") }}>
        <Heading level={2}>Checked before it's printed</Heading>
        <List style={{ fontSize: 17 }}>
          <ListItem>{"If the care file has a mistake, like a medicine with no dose or no family number, the build stops and tells you what's wrong."}</ListItem>
          <ListItem>{"If the medicines won't fit on one fridge page, the chart squeezes them in. If that still doesn't work, it refuses. Half a medicine list is worse than none."}</ListItem>
          <ListItem>Contrast, text size, headings, link text and image descriptions are hard rules, not suggestions.</ListItem>
          <ListItem>The email holds up in Outlook, Gmail and Apple Mail, in light and dark mode.</ListItem>
        </List>
        <Image src="docs/clients.png" alt="The care email in classic Outlook, the Gmail app and Apple Mail, light and dark" style={{ width: "100%", borderRadius: token("radii.sm") }} />
      </Section>

      <Section style={{ padding: [32, 32, 48], gap: 8, border: { top: { width: 1, style: "solid", color: token("colors.border") } }, mobile: { padding: [24, 16, 32] } }}>
        <Text style={{ fontSize: 15, ...muted }}>
          {"Not medical advice. The GP and the pharmacist always have the final say. The families are made up, and the Hindi and Arabic could use a native speaker's eye. MIT licensed. "}
          <Link href={REPO}>Source on GitHub</Link>
          {"."}
        </Text>
      </Section>
    </Page>
  );
}
