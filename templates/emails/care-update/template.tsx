/**
 * The daily care email: what the family on the rota sends the others at the end of their day. It leads with what
 * needs someone (a medicine to order, a change the doctor made, an appointment and who's taking them), then today's
 * readings and how they were, a word from whoever was there, and the week's rota. Everything it can work out from the
 * care file it works out: the refill dates, who's on, what's new.
 *
 * Open: today's log, as blocks of three approved kinds (a reading, how they were, a note), and a short word from the
 * writer, as a slot that takes only text, lists and links in the brand's look. Locked: everything else.
 */
import { Column, Email, Grid, Heading, Image, Link, List, ListItem, Row, Section, Span, Text, prop, token } from "@hyper-elements/react";
import { field, template } from "@hyper-elements/react/template";
import { lint } from "@hyper-elements/lint";
import type { Brand } from "../../_brand";
import { brand as kin, CDN } from "../../_brands/kin";
import { careFields, PILL_COLORS, type PillColor } from "../../_care/fields";
import {
  addDays,
  assertCare,
  daysBetween,
  day,
  flagOf,
  lang,
  longDay,
  mondayOf,
  own,
  perDay,
  slotsOf,
  supplyOf,
  weekdayOf,
  type Care,
  type Medicine,
} from "../../_care/compute";
import { LANGUAGE, SLOTS, WEEKDAYS, fontFacesFor, stackFor } from "../../_care/languages";
import { SLOT_COLORS, SAFETY, alertOn, slotInkOn } from "../../_care/parts";
import sharma from "../../../families/sharma.care.json";

const READINGS = {
  bp: { label: "Blood pressure", unit: "mmHg" },
  sugar: { label: "Blood sugar", unit: "mmol/L" },
  weight: { label: "Weight", unit: "kg" },
  temperature: { label: "Temperature", unit: "°C" },
  oxygen: { label: "Oxygen", unit: "%" },
} as const;
const MOODS = { good: "A good day", okay: "An ordinary day", low: "A low day", unwell: "Unwell" } as const;

export const logBlocks = prop.blocks(
  {
    reading: prop.object(
      {
        what: prop.choice(Object.keys(READINGS) as (keyof typeof READINGS)[], { label: "What was measured", required: true }),
        value: prop.text({ label: "Reading", required: true, pattern: "^\\d{1,3}(\\.\\d)?(/\\d{2,3})?$", guidance: "The number the machine showed: 138/84, 7.2, 61.5" }),
        when: prop.text({ label: "When", maxLength: 24, guidance: "Before breakfast, after lunch" }),
        watch: prop.boolean({ label: "Worth watching", default: false, guidance: "Tick if it's outside what the doctor said is usual for them" }),
      },
      { label: "A reading" },
    ),
    mood: prop.object(
      {
        how: prop.choice(Object.keys(MOODS) as (keyof typeof MOODS)[], { label: "How they were", required: true }),
        text: prop.text({ label: "In a line", maxLength: 120 }),
      },
      { label: "How they were" },
    ),
    note: prop.object({ text: prop.text({ label: "Note", required: true, maxLength: 200 }) }, { label: "A note" }),
  },
  { label: "Today's log", min: 0, max: 6 },
);

/** A medicine's colour as a small round swatch: email can't draw shapes, but a box with round corners is a dot. */
function Dot({ color, size = 14 }: { color: string; size?: number }) {
  const c = PILL_COLORS[(color as PillColor) in PILL_COLORS ? (color as PillColor) : "white"];
  return <Column style={{ width: size, height: size, backgroundColor: c.fill, border: { width: 1, style: "solid", color: c.stroke }, borderRadius: size / 2 }} />;
}

export function careUpdate(brand: Brand) {
  const background = (brand.theme.colors as Record<string, string>).background!;
  const alert = alertOn(background);
  const body = (brand.theme.fonts as Record<string, string>).body!;
  const small = { fontSize: 15, lineHeight: 1.45, color: token("colors.muted") } as const;
  const eyebrow = { fontSize: 14, fontWeight: 700, letterSpacing: 0.4, lineHeight: 1.3, color: token("colors.muted") } as const;
  const card = { backgroundColor: token("colors.background"), borderRadius: token("radii.md"), padding: [20, 24], gap: 12, mobile: { padding: [16, 16] } } as const;

  return template({
    id: "kin.CareUpdate",
    version: "1.0.0",
    label: "Daily care update",
    description:
      "The email the family member on the rota sends the others at the end of their day: what needs someone, today's readings, a word from them, and the week",
    guidance: "Lead with what someone has to do. Calm, plain and short: the family reads it on a phone, between other things.",
    root: "Email",
    fields: {
      ...careFields,
      from: prop.text({ label: "Who's writing", required: true, maxLength: 20, guidance: "Whoever was with them today: the rota's name" }),
      log: logBlocks,
      word: field.slot({
        label: "A word from today",
        allow: [Column, Text, List, ListItem, Link],
        styles: "none",
        count: { Text: { max: 4 }, Link: { max: 2 } },
        guidance: "Two or three short lines: how the day went, anything to pass on. No styling: the email's look is the template's.",
      }),
      careUrl: prop.link({ label: "The care page", required: true, guidance: "The family's shared care page, where all of this lives" }),
    },
    rules: {
      plugins: { lint: lint({ kind: "transactional" }) },
      require: {
        lint: ["contrast", "text-size", "lang", "dir", "link-text", "link-empty", "image-alt", "alt-text", "heading-order", "heading-one", "preview-text"],
        core: ["layout/overflow"],
      },
      links: { domains: [...brand.links.domains, "cdn.jsdelivr.net"], schemes: ["tel", "mailto"] },
      root: { lang: true, previewText: true },
    },
    example: {
      ...(sharma as never as object),
      from: "Priya",
      log: [{ type: "reading", what: "bp", value: "138/84", when: "Before breakfast" }],
      careUrl: "https://kin.family/sharma",
    } as never,
    render: (v) => {
      const c = v as unknown as Care & {
        from: string;
        log: ({ type: "reading"; what: keyof typeof READINGS; value: string; when?: string; watch?: boolean } | { type: "mood"; how: keyof typeof MOODS; text?: string } | { type: "note"; text: string })[];
        word?: unknown;
        careUrl: string;
      };
      assertCare(c);
      const l = lang(c);
      const name = c.person.callName;
      const today = weekdayOf(c.asOf);
      const onToday = c.rota[today];
      const tomorrow = WEEKDAYS[(WEEKDAYS.indexOf(today) + 1) % 7]!;
      const monday = mondayOf(c.asOf);

      const orders = c.medicines
        .map((m) => ({ m, s: supplyOf(m, c.asOf) }))
        .filter((x): x is { m: Medicine; s: NonNullable<ReturnType<typeof supplyOf>> } => !!x.s && daysBetween(c.asOf, x.s.orderBy) <= 7)
        .sort((a, b) => a.s.days - b.s.days);
      const flagged = c.medicines.map((m) => ({ m, f: flagOf(m, c.asOf) })).filter((x) => x.f);
      const upcoming = c.appointments.filter((a) => daysBetween(c.asOf, a.date) >= 0 && daysBetween(c.asOf, a.date) <= 7);
      const needs = orders.length + flagged.length + upcoming.length;

      const preview = [
        orders[0] ? `Order ${orders[0].m.name} by ${day(orders[0].s.orderBy, "en-GB", { weekday: "short", day: "numeric", month: "short" })}` : "",
        upcoming[0] ? `${upcoming[0].what.en} ${day(upcoming[0].date, "en-GB", { weekday: "short" })} ${upcoming[0].time}${upcoming[0].who ? ` with ${upcoming[0].who}` : ""}` : "",
        `${c.rota[tomorrow]} is on tomorrow`,
      ]
        .filter(Boolean)
        .join(" · ");

      const tel = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
      const ownFont = { fontFamily: stackFor(l, body) };

      return (
        <Email
          width={600}
          lang="en"
          title={`${name} today: ${longDay(c.asOf)}`}
          previewText={preview}
          theme={brand.theme}
          fonts={[...brand.fonts, ...fontFacesFor(l)]}
          style={{ backgroundColor: token("colors.surface"), color: token("colors.foreground"), gap: 0 }}
        >
          <Section style={{ padding: [28, 24, 8], gap: 4, mobile: { padding: [20, 16, 4] } }}>
            <Row stackOnMobile={false} style={{ gap: 12, alignItems: "center" }}>
              <Image src={{ src: brand.logo.src, width: brand.logo.width, height: brand.logo.height }} alt={brand.logo.alt} style={{ width: 96 }} />
              <Text style={{ ...small, textAlign: "right" }}>{longDay(c.asOf)}</Text>
            </Row>
          </Section>

          <Section style={{ padding: [16, 24, 20], gap: 8, mobile: { padding: [12, 16, 16] } }}>
            <Heading level={1}>{`${name} today`}</Heading>
            <Text>
              {`${c.from === onToday ? `${c.from} was with ${name} today.` : `${c.from} writing; ${onToday} was with ${name} today.`} `}
              {needs ? (
                <Span style={{ fontWeight: 700 }}>{`${needs === 1 ? "One thing needs" : `${needs} things need`} someone this week.`}</Span>
              ) : (
                "Nothing needs anyone this week."
              )}
              {` ${c.rota[tomorrow]} is on tomorrow.`}
            </Text>
          </Section>

          {needs ? (
            <Section style={{ padding: [0, 24, 16], gap: 10, mobile: { padding: [0, 16, 12] } }}>
              <Heading level={2} style={{ fontSize: 20 }}>Needs someone</Heading>
              {orders.map(({ m, s }) => (
                <Row key={`o-${m.name}`} stackOnMobile={false} style={{ ...card, gap: 14, alignItems: "center", border: { left: { width: 5, style: "solid", color: s.urgent ? SAFETY.solid : token("colors.primary") } } }}>
                  <Dot color={m.color} size={20} />
                  <Column style={{ gap: 2 }}>
                    <Text style={{ fontWeight: 700 }}>{`Order ${m.name} ${m.strength} by ${day(s.orderBy, "en-GB", { weekday: "long", day: "numeric", month: "long" })}`}</Text>
                    <Text style={small}>{`${m.supply} left, ${perDay(m)} a day: they run out on ${day(s.runsOut, "en-GB", { weekday: "long", day: "numeric", month: "short" })}.`}</Text>
                  </Column>
                </Row>
              ))}
              {flagged.map(({ m, f }) => (
                <Row key={`f-${m.name}`} stackOnMobile={false} style={{ ...card, gap: 14, alignItems: "center", border: { left: { width: 5, style: "solid", color: alert } } }}>
                  <Dot color={m.color} size={20} />
                  <Column style={{ gap: 2 }}>
                    <Text style={{ fontWeight: 700 }}>
                      {f === "changed" ? `${m.name} changed on ${day(m.change!.on)}: ${m.change!.what.en.charAt(0).toLowerCase()}${m.change!.what.en.slice(1)}.` : `${m.name} ${m.strength} is new, since ${day(m.since!)}.`}
                    </Text>
                    <Text style={small}>{`${m.purpose.en}. The fridge chart and both cards show it: reprint them if yours are older than ${day(f === "changed" ? m.change!.on : m.since!)}.`}</Text>
                  </Column>
                </Row>
              ))}
              {upcoming.map((a) => (
                <Row key={`a-${a.date}`} stackOnMobile={false} style={{ ...card, gap: 14, alignItems: "center", border: { left: { width: 5, style: "solid", color: token("colors.primary") } } }}>
                  <Column style={{ width: 52, gap: 0, alignItems: "center", backgroundColor: token("colors.surface"), borderRadius: token("radii.sm"), padding: [6, 0] }}>
                    <Text style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, textAlign: "center", color: alert }}>{day(a.date, "en-GB", { month: "short" }).toUpperCase()}</Text>
                    <Text style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, textAlign: "center" }}>{day(a.date, "en-GB", { day: "numeric" })}</Text>
                  </Column>
                  <Column style={{ gap: 2 }}>
                    <Text style={{ fontWeight: 700 }}>{`${a.what.en}, ${day(a.date, "en-GB", { weekday: "long" })} at ${a.time}`}</Text>
                    <Text style={small}>{`${a.where}. ${a.who ? `${a.who} is taking ${name}.` : `Nobody's down to take ${name} yet.`}`}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          ) : null}

          {c.log.length ? (
            <Section style={{ padding: [8, 24, 16], gap: 10, mobile: { padding: [8, 16, 12] } }}>
              <Heading level={2} style={{ fontSize: 20 }}>Today</Heading>
              <Column style={{ ...card, gap: 0, padding: [6, 24] }}>
                {c.log.map((b, i) => (
                  <Row key={i} stackOnMobile={false} style={{ gap: 12, padding: [12, 0], alignItems: "center", ...(i < c.log.length - 1 ? { border: { bottom: { width: 1, style: "solid", color: token("colors.border") } } } : {}) }}>
                    {b.type === "reading" ? (
                      <>
                        <Column style={{ gap: 0 }}>
                          <Text field={`log[${i}].what`} style={{ fontWeight: 700 }}>{READINGS[b.what].label}</Text>
                          {b.when ? <Text style={small}>{b.when}</Text> : null}
                        </Column>
                        <Text field={`log[${i}].value`} style={{ width: 180, textAlign: "right", fontSize: 22, fontWeight: 700, color: b.watch ? alert : token("colors.foreground") }}>
                          {b.value}
                          <Span style={{ fontSize: 15, fontWeight: 400, color: token("colors.muted") }}>{` ${READINGS[b.what].unit}${b.watch ? " · watch" : ""}`}</Span>
                        </Text>
                      </>
                    ) : b.type === "mood" ? (
                      <Column style={{ gap: 0 }}>
                        <Text style={{ fontWeight: 700 }}>{MOODS[b.how]}</Text>
                        {b.text ? <Text field={`log[${i}].text`} style={small}>{b.text}</Text> : null}
                      </Column>
                    ) : (
                      <Text field={`log[${i}].text`}>{b.text}</Text>
                    )}
                  </Row>
                ))}
              </Column>
            </Section>
          ) : null}

          {c.word ? (
            <Section style={{ padding: [8, 24, 16], gap: 10, mobile: { padding: [8, 16, 12] } }}>
              <Heading level={2} style={{ fontSize: 20 }}>{`From ${c.from}`}</Heading>
              <Column field="word" style={{ backgroundColor: token("colors.surface"), borderRadius: token("radii.md"), padding: [18, 24], gap: 10, mobile: { padding: [14, 16] } }}>
                {c.word as never}
              </Column>
            </Section>
          ) : null}

          <Section style={{ padding: [8, 24, 16], gap: 10, mobile: { padding: [8, 16, 12] } }}>
            <Heading level={2} style={{ fontSize: 20 }}>{`${name}'s medicines`}</Heading>
            <Column style={{ ...card, gap: 0, padding: [4, 24] }}>
              {SLOTS.filter((s) => c.medicines.some((m) => slotsOf(m).includes(s))).map((s, i, all) => (
                <Row key={s} stackOnMobile={false} style={{ gap: 14, padding: [12, 0], alignItems: "start", ...(i < all.length - 1 ? { border: { bottom: { width: 1, style: "solid", color: token("colors.border") } } } : {}) }}>
                  <Row stackOnMobile={false} style={{ width: 132, gap: 8, alignItems: "center", mobile: { width: 104 } }}>
                    <Image src={{ src: `${CDN}/assets/icons/${s}.png`, width: 64, height: 64 }} alt="" style={{ width: 24 }} />
                    <Text style={{ fontWeight: 700, color: slotInkOn(s, background) }}>{LANGUAGE.en.t.slot[s]}</Text>
                  </Row>
                  <Column style={{ gap: 4 }}>
                    {c.medicines
                      .filter((m) => slotsOf(m).includes(s))
                      .map((m) => (
                        <Row key={m.name} stackOnMobile={false} style={{ gap: 8, alignItems: "center" }}>
                          <Dot color={m.color} />
                          <Text>
                            <Span style={{ fontWeight: 700 }}>{m.name}</Span>
                            {` ${m.strength} · ${LANGUAGE.en.t.dose(m.doses[s], m.form)}${m.food === "with" ? ", with food" : m.food === "before" ? ", before food" : ""}`}
                          </Text>
                        </Row>
                      ))}
                  </Column>
                </Row>
              ))}
            </Column>
            <Text style={small}>
              {`Allergic to ${c.allergies.map((a) => a.en).join(", ").toLowerCase().replace(/^none known$/, "nothing known")}. `}
              <Link href={c.careUrl}>{`${name}'s care page`}</Link>
              {" has the doses, the doctor's notes and the printable chart."}
            </Text>
          </Section>

          <Section style={{ padding: [8, 24, 16], gap: 10, mobile: { padding: [8, 16, 12] } }}>
            <Heading level={2} style={{ fontSize: 20 }}>This week</Heading>
            <Grid columns={7} stackOnMobile={false} style={{ gap: 4 }}>
              {WEEKDAYS.map((d, k) => {
                const isToday = d === today;
                return (
                  <Column
                    key={d}
                    style={{
                      gap: 0,
                      padding: [8, 2],
                      borderRadius: token("radii.sm"),
                      alignItems: "center",
                      backgroundColor: isToday ? token("colors.primary") : token("colors.background"),
                      color: isToday ? token("colors.primaryForeground") : token("colors.foreground"),
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{LANGUAGE.en.t.day[d]}</Text>
                    <Text style={{ fontSize: 14, lineHeight: 1.3, textAlign: "center" }}>{day(addDays(monday, k), "en-GB", { day: "numeric" })}</Text>
                    <Text field={`rota.${d}`} style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, textAlign: "center", mobile: { fontSize: 14 } }}>
                      {c.rota[d].length <= 7 ? c.rota[d] : c.rota[d].replace(/ centre| center/i, "").slice(0, 8)}
                    </Text>
                  </Column>
                );
              })}
            </Grid>
          </Section>

          {c.language !== "en" ? (
            <Section style={{ padding: [8, 24, 16], gap: 6, mobile: { padding: [8, 16, 12] } }}>
              <Column style={{ ...card, gap: 4, border: { width: 1, style: "dashed", color: token("colors.border") } }}>
                <Text style={{ ...eyebrow }}>{`To read to ${name}, in ${l.english}`}</Text>
                <Text dir={l.dir} style={{ ...ownFont, fontSize: 20, lineHeight: 1.5 }}>
                  {`${l.t.withYou}: ${c.rota[today]}. ${l.code === "hi" ? "कल" : l.code === "ar" ? "غدًا" : "Mañana"}: ${c.rota[tomorrow]}.`}
                  {flagged[0] ? ` ${own(flagged[0].m.change?.what) || `${flagged[0].m.name}: ${l.t.newMed}`}.` : ""}
                </Text>
              </Column>
            </Section>
          ) : null}

          <Section style={{ padding: [16, 24, 32], gap: 8, mobile: { padding: [12, 16, 24] } }}>
            <Text style={small}>
              {`In an emergency, call ${c.emergencyNumber}. ${name}'s GP: `}
              {(() => {
                const gp = c.contacts.find((x) => x.role === "doctor");
                return gp ? <Link href={tel(gp.phone)}>{`${gp.name}, ${gp.phone}`}</Link> : "not on file";
              })()}
              {"."}
            </Text>
            <Text style={{ ...small, fontSize: 14 }}>
              {`Sent by ${c.from} from ${name}'s care file, checked ${day(c.asOf)}. ${brand.address ?? ""} `}
              <Link href={brand.links.preferences}>Choose which days you get these</Link>
            </Text>
          </Section>
        </Email>
      );
    },
  });
}

export default careUpdate(kin);
