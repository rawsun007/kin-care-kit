/**
 * The care page: the family's one shared place, for the brother who lives abroad, the new carer and the locum GP.
 * Who the parent is and how to talk to them, the three things to know in an emergency, every medicine with its dose,
 * what it's for (in their words too) and when it runs out, what's changed, what's coming, who's on, and the papers to
 * print. Responsive, with no script: it's one HTML file the family can host anywhere.
 *
 * Locked: all of it. A design gives the care file and where the printable papers live.
 */
import { Button, Column, Grid, Heading, Link, Page, Row, Section, Span, Text, prop, token } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { lint } from "@hyper-elements/lint";
import type { Brand } from "../../_brand";
import { brand as kin } from "../../_brands/kin";
import { careFields } from "../../_care/fields";
import { addDays, ageOn, assertCare, day, daysBetween, flagOf, lang, mondayOf, own, perDay, slotsOf, supplyOf, weekdayOf, type Care } from "../../_care/compute";
import { LANGUAGE, SLOTS, WEEKDAYS, fontFacesFor, stackFor } from "../../_care/languages";
import { Mark, Phone, Pill, SLOT_COLORS, SlotIcon } from "../../_care/parts";
import sharma from "../../../families/sharma.care.json";

export function carePage(brand: Brand) {
  const body = (brand.theme.fonts as Record<string, string>).body!;
  const colors = brand.theme.colors as Record<string, string>;
  const small = { fontSize: 15, lineHeight: 1.5, color: token("colors.muted") } as const;
  const eyebrow = { fontSize: 14, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", lineHeight: 1.3, color: token("colors.muted") } as const;
  const card = { backgroundColor: "#ffffff", borderRadius: token("radii.md"), padding: 24, gap: 12, border: { width: 1, style: "solid", color: token("colors.border") }, mobile: { padding: 18 } } as const;
  const band = { padding: [40, 32], gap: 20, mobile: { padding: [28, 16] } } as const;
  const rule = { width: 1, style: "solid", color: token("colors.border") } as const;
  const tel = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

  return template({
    id: "kin.CarePage",
    version: "1.0.0",
    label: "Care page",
    description:
      "The family's shared care page: the emergency essentials, every medicine with its dose and refill date, what's changed, appointments, the rota, contacts and the papers to print",
    guidance: "For whoever's new to the care: they should be able to help by the end of the page.",
    root: "Page",
    fields: {
      ...careFields,
      papersUrl: prop.link({ label: "Where the printable papers are", required: true, guidance: "The folder the fridge chart and wallet card PDFs are published to" }),
    },
    rules: {
      plugins: { lint: lint({ kind: "transactional" }) },
      require: { lint: ["contrast", "text-size", "lang", "title", "link-text", "link-empty", "image-alt", "heading-order", "heading-one"], core: ["layout/overflow"] },
      links: { domains: [...brand.links.domains], schemes: ["tel"] },
      root: { lang: true, title: true },
    },
    example: { ...(sharma as never as object), papersUrl: "https://kin.family/sharma/papers" } as never,
    render: (v) => {
      const c = v as unknown as Care & { papersUrl: string };
      assertCare(c);
      const l = lang(c);
      const ownFont = { fontFamily: stackFor(l, body) };
      const name = c.person.callName;
      const age = ageOn(c.person.born, c.asOf);
      const today = weekdayOf(c.asOf);
      const monday = mondayOf(c.asOf);
      const family = c.contacts.filter((x) => x.role === "family");
      const papers = c.papersUrl.replace(/\/$/, "");
      const changes = c.medicines
        .flatMap((m) => [
          ...(m.since ? [{ on: m.since, text: `${m.name} ${m.strength} started`, why: m.purpose.en }] : []),
          ...(m.change ? [{ on: m.change.on, text: `${m.name}: ${m.change.what.en}`, why: own(m.change.what) }] : []),
        ])
        .sort((a, b) => (a.on < b.on ? 1 : -1));

      return (
        <Page
          width={1080}
          lang="en"
          title={`${c.person.name}: care page`}
          description={`${name}'s medicines, appointments and rota, for the family and whoever helps.`}
          theme={brand.theme}
          fonts={[...brand.fonts, ...fontFacesFor(l)]}
          style={{ backgroundColor: token("colors.background"), color: token("colors.foreground"), gap: 0 }}
        >
          {/* Who they are. */}
          <Section style={{ ...band, padding: [28, 32, 40], mobile: { padding: [20, 16, 28] } }}>
            <Row stackOnMobile={false} style={{ gap: 10, alignItems: "center" }}>
              <Mark size={30} color={colors.primary!} accent={colors.accent!} />
              <Text style={{ fontSize: 15, fontWeight: 700, color: token("colors.primary") }}>{`${name}'s care page`}</Text>
              <Text style={{ ...small, textAlign: "right" }}>{`Checked ${day(c.asOf, "en-GB", { day: "numeric", month: "long", year: "numeric" })}`}</Text>
            </Row>
            <Row style={{ gap: 32, alignItems: "end" }}>
              <Column style={{ gap: 6 }}>
                {c.person.ownName ? <Text style={{ ...ownFont, fontSize: 22, color: token("colors.primary") }}>{c.person.ownName}</Text> : null}
                <Heading level={1} style={{ fontSize: 56, lineHeight: 1.05, mobile: { fontSize: 40 } }}>
                  {c.person.name}
                </Heading>
                <Text style={{ fontSize: 20 }}>
                  {`${name} to the family, ${age}. `}
                  {c.language !== "en" ? (
                    <>
                      {"Speaks "}
                      <Span style={{ fontWeight: 700 }}>{l.english}</Span>
                      {` (${""}`}
                      <Span style={ownFont}>{l.own}</Span>
                      {"): say things in it, or have one of us on the phone."}
                    </>
                  ) : null}
                </Text>
              </Column>
            </Row>
            <Grid columns={3} style={{ gap: 16 }}>
              <Column style={{ ...card, backgroundColor: token("colors.accent"), color: "#ffffff", border: { width: 1, style: "solid", color: token("colors.accent") }, gap: 4 }}>
                <Row stackOnMobile={false} style={{ gap: 8, alignItems: "center" }}>
                  <Phone size={20} />
                  <Text style={{ fontSize: 15, fontWeight: 700 }}>In an emergency</Text>
                </Row>
                <Text style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>{c.emergencyNumber}</Text>
                <Text style={{ fontSize: 16 }}>
                  {"Then "}
                  <Link href={tel(family[0]!.phone)} style={{ color: "#ffffff" }}>{`${family[0]!.name.split(" ")[0]}, ${family[0]!.phone}`}</Link>
                </Text>
              </Column>
              <Column style={{ ...card, border: { width: 2, style: "solid", color: token("colors.accent") }, gap: 4 }}>
                <Text style={{ ...eyebrow, color: token("colors.accent") }}>Allergies</Text>
                <Text style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{c.allergies.map((a) => a.en).join(", ")}</Text>
                <Text style={small}>{`Blood type ${c.person.bloodType}${c.person.nhs ? ` · NHS ${c.person.nhs}` : ""}`}</Text>
              </Column>
              <Column style={{ ...card, gap: 4 }}>
                <Text style={eyebrow}>Conditions</Text>
                {c.conditions.map((x) => (
                  <Text key={x.en} style={{ fontSize: 17, lineHeight: 1.35 }}>
                    {x.en}
                    {x.own && c.language !== "en" ? <Span style={{ ...ownFont, color: token("colors.muted") }}>{`  ${x.own}`}</Span> : null}
                  </Text>
                ))}
              </Column>
            </Grid>
          </Section>

          {/* A day of medicines. */}
          <Section style={{ ...band, backgroundColor: "#ffffff", border: { top: rule, bottom: rule } }}>
            <Column style={{ gap: 4 }}>
              <Heading level={2}>A day of medicines</Heading>
              <Text style={small}>{`${c.medicines.length} medicines, ${c.medicines.reduce((n, m) => n + perDay(m), 0)} doses a day. ${l.t.dontStop === LANGUAGE.en.t.dontStop ? "" : ""}Don't stop or change any without asking the GP.`}</Text>
            </Column>
            <Grid columns={4} style={{ gap: 12 }}>
              {SLOTS.map((s) => {
                const ms = c.medicines.filter((m) => slotsOf(m).includes(s));
                return (
                  <Column key={s} style={{ backgroundColor: SLOT_COLORS[s].tint, borderRadius: token("radii.md"), padding: 18, gap: 10 }}>
                    <Row stackOnMobile={false} style={{ gap: 10, alignItems: "center" }}>
                      <SlotIcon slot={s} size={30} />
                      <Column style={{ gap: 0 }}>
                        <Text style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.2, color: SLOT_COLORS[s].ink }}>{LANGUAGE.en.t.slot[s]}</Text>
                        {c.language !== "en" ? <Text style={{ ...ownFont, fontSize: 15, lineHeight: 1.3, color: SLOT_COLORS[s].ink }}>{l.t.slot[s]}</Text> : null}
                      </Column>
                    </Row>
                    {ms.length ? (
                      ms.map((m) => (
                        <Row key={m.name} stackOnMobile={false} style={{ gap: 10, alignItems: "center" }}>
                          <Pill form={m.form} color={m.color} size={26} />
                          <Column style={{ gap: 0 }}>
                            <Text style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{m.name}</Text>
                            <Text style={{ fontSize: 14, lineHeight: 1.3, color: SLOT_COLORS[s].ink }}>
                              {`${LANGUAGE.en.t.dose(m.doses[s], m.form)}${m.food === "with" ? ", with food" : m.food === "before" ? ", before food" : ""}`}
                            </Text>
                          </Column>
                        </Row>
                      ))
                    ) : (
                      <Text style={{ fontSize: 15, color: SLOT_COLORS[s].ink }}>Nothing</Text>
                    )}
                  </Column>
                );
              })}
            </Grid>
          </Section>

          {/* Every medicine. */}
          <Section style={band}>
            <Heading level={2}>Every medicine</Heading>
            <Column style={{ ...card, padding: [4, 24], gap: 0 }}>
              {c.medicines.map((m, i) => {
                const s = supplyOf(m, c.asOf);
                const flag = flagOf(m, c.asOf);
                return (
                  <Row key={m.name} style={{ gap: 20, padding: [18, 0], alignItems: "center", ...(i < c.medicines.length - 1 ? { border: { bottom: rule } } : {}) }}>
                    <Row stackOnMobile={false} style={{ width: 360, gap: 14, alignItems: "center", mobile: { width: "100%" } }}>
                      <Pill form={m.form} color={m.color} size={40} />
                      <Column style={{ gap: 2 }}>
                        <Text style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.25 }}>
                          {`${m.name} `}
                          <Span style={{ fontWeight: 400, color: token("colors.muted") }}>{m.strength}</Span>
                          {flag ? <Span style={{ fontSize: 14, color: "#ffffff", backgroundColor: token(flag === "new" ? "colors.primary" : "colors.accent") }}>{flag === "new" ? " New " : " Changed "}</Span> : null}
                        </Text>
                        <Text style={{ fontSize: 15, lineHeight: 1.35 }}>
                          {m.purpose.en}
                          {c.language !== "en" && m.purpose.own ? <Span style={{ ...ownFont, color: token("colors.muted") }}>{`  ${m.purpose.own}`}</Span> : null}
                        </Text>
                      </Column>
                    </Row>
                    <Column style={{ gap: 2 }}>
                      <Text style={{ fontSize: 16, lineHeight: 1.35 }}>
                        {slotsOf(m)
                          .map((x) => `${LANGUAGE.en.t.dose(m.doses[x], m.form)} ${LANGUAGE.en.t.slot[x].toLowerCase()}`)
                          .join(", ")}
                        {m.food === "with" ? ", with food" : m.food === "before" ? ", before food" : ""}
                      </Text>
                      {m.note ? <Text style={{ ...small, fontWeight: 700, color: token("colors.foreground") }}>{m.note.en}</Text> : null}
                    </Column>
                    <Column style={{ width: 210, gap: 0, mobile: { width: "100%" } }}>
                      {s ? (
                        <>
                          <Text style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, color: s.urgent ? token("colors.accent") : token("colors.foreground") }}>
                            {daysBetween(c.asOf, s.orderBy) <= 0 ? "Order today" : `Order by ${day(s.orderBy, "en-GB", { weekday: "short", day: "numeric", month: "short" })}`}
                          </Text>
                          <Text style={{ ...small, fontSize: 14 }}>{`${m.supply} left · runs out ${day(s.runsOut, "en-GB", { day: "numeric", month: "short" })}`}</Text>
                        </>
                      ) : (
                        <Text style={small}>Supply not counted</Text>
                      )}
                    </Column>
                  </Row>
                );
              })}
            </Column>
          </Section>

          {/* What's changed, and what's coming. */}
          <Section style={{ ...band, padding: [0, 32, 40], mobile: { padding: [0, 16, 28] } }}>
            <Row style={{ gap: 20, alignItems: "stretch" }}>
              <Column style={{ ...card }}>
                <Heading level={2} style={{ fontSize: 24 }}>What's changed</Heading>
                {changes.length ? (
                  changes.map((x) => (
                    <Row key={x.on + x.text} stackOnMobile={false} style={{ gap: 14, alignItems: "start" }}>
                      <Text style={{ width: 70, fontSize: 15, fontWeight: 700, color: token("colors.accent") }}>{day(x.on, "en-GB", { day: "numeric", month: "short" })}</Text>
                      <Column style={{ gap: 0 }}>
                        <Text style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{x.text}</Text>
                        <Text style={{ ...small, ...(x.why !== x.text ? ownFont : {}) }}>{x.why}</Text>
                      </Column>
                    </Row>
                  ))
                ) : (
                  <Text style={small}>Nothing has changed recently.</Text>
                )}
              </Column>
              <Column style={{ ...card }}>
                <Heading level={2} style={{ fontSize: 24 }}>Coming up</Heading>
                {c.appointments.length ? (
                  c.appointments.map((a) => (
                    <Row key={a.date + a.time} stackOnMobile={false} style={{ gap: 14, alignItems: "start" }}>
                      <Column style={{ width: 56, gap: 0, alignItems: "center", backgroundColor: token("colors.surface"), borderRadius: token("radii.sm"), padding: [6, 0] }}>
                        <Text style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, textAlign: "center", color: token("colors.accent") }}>{day(a.date, "en-GB", { month: "short" }).toUpperCase()}</Text>
                        <Text style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, textAlign: "center" }}>{day(a.date, "en-GB", { day: "numeric" })}</Text>
                      </Column>
                      <Column style={{ gap: 0 }}>
                        <Text style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{`${a.what.en} · ${day(a.date, "en-GB", { weekday: "long" })} ${a.time}`}</Text>
                        <Text style={small}>{`${a.where}${a.who ? `. ${a.who} is taking ${name}.` : ". Nobody's down to take them yet."}`}</Text>
                      </Column>
                    </Row>
                  ))
                ) : (
                  <Text style={small}>No appointments booked.</Text>
                )}
              </Column>
            </Row>
          </Section>

          {/* The week, and who to call. */}
          <Section style={{ ...band, backgroundColor: token("colors.surface") }}>
            <Heading level={2}>{`Who's with ${name}`}</Heading>
            <Grid columns={7} style={{ gap: 8 }}>
              {WEEKDAYS.map((d, k) => (
                <Column
                  key={d}
                  style={{
                    gap: 0,
                    padding: [12, 6],
                    borderRadius: token("radii.sm"),
                    alignItems: "center",
                    backgroundColor: d === today ? token("colors.primary") : "#ffffff",
                    color: d === today ? token("colors.primaryForeground") : token("colors.foreground"),
                  }}
                >
                  <Text style={{ fontSize: 15, lineHeight: 1.3, textAlign: "center" }}>{`${LANGUAGE.en.t.day[d]} ${day(addDays(monday, k), "en-GB", { day: "numeric" })}`}</Text>
                  <Text style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>{c.rota[d]}</Text>
                </Column>
              ))}
            </Grid>
            <Grid columns={3} style={{ gap: 12 }}>
              {c.contacts.map((x) => (
                <Column key={x.phone} style={{ ...card, padding: 18, gap: 2 }}>
                  <Text style={eyebrow}>{x.relation}</Text>
                  <Text style={{ fontSize: 18, fontWeight: 700 }}>{x.name}</Text>
                  <Link href={tel(x.phone)} aria-label={`Call ${x.name}, ${x.phone}`}>{x.phone}</Link>
                </Column>
              ))}
            </Grid>
          </Section>

          {/* The papers. */}
          <Section style={band}>
            <Heading level={2}>Print</Heading>
            <Text style={small}>{`Printed from this page's care file. Reprint whenever a medicine changes: the date's on every paper.`}</Text>
            <Row style={{ gap: 12 }}>
              <Button href={`${papers}/fridge-chart.pdf`} style={{ flex: "none", fontSize: 17, padding: [14, 22], borderRadius: token("radii.sm") }}>
                {`The fridge chart, in ${l.english}`}
              </Button>
              <Button href={`${papers}/wallet-card.pdf`} style={{ flex: "none", fontSize: 17, padding: [14, 22], borderRadius: token("radii.sm"), backgroundColor: "#ffffff", color: token("colors.primary"), border: { width: 2, style: "solid", color: token("colors.primary") } }}>
                The wallet cards
              </Button>
            </Row>
            <Text style={{ ...small, fontSize: 14 }}>
              {`${brand.address ?? ""} Kin is not medical advice: the GP and the pharmacist have the last word on every dose.`}
            </Text>
          </Section>
        </Page>
      );
    },
  });
}

export default carePage(kin);
