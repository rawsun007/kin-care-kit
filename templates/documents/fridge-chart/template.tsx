/**
 * The fridge chart: a parent's medicines on one landscape page, in their own language first and English beneath, with
 * each medicine drawn as it looks and each time of day with its own icon and colour. The second page is the week's
 * tick sheet, with who's on each day. What's new or changed in the last two weeks is flagged, and the allergies and the
 * emergency number are on the page whatever else is.
 *
 * Locked: the layout, the times of day, every heading in every language, the safety line. A design gives the care file.
 */
import { Column, Document, Heading, Row, Span, Text, token } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import type { Brand } from "../../_brand";
import { brand as kin } from "../../_brands/kin";
import { careFields } from "../../_care/fields";
import { addDays, assertCare, day, flagOf, lang, mondayOf, own, slotsOf, type Care, type Medicine } from "../../_care/compute";
import { SLOTS, WEEKDAYS, fontFacesFor, stackFor, type Language, type Slot } from "../../_care/languages";
import { Phone, Pill, SLOT_COLORS, SlotIcon, TickBox } from "../../_care/parts";
import sharma from "../../../families/sharma.care.json";

/** A4 landscape, inside 36px margins. */
const WIDTH = 1123 - 72;
const NAME = 336;
const SLOT_W = Math.floor((WIDTH - NAME) / 4);

/** The page's height inside its margins, less the header, the chart's own header row and the footer. */
const ROOM = 794 - 72 - 84 - 88 - 40 - 3 * 14;

/** How tall the chart's rows come out, estimated from the lines each takes: the larger of its name cell and its doses. */
function chartHeight(c: Care, dense: boolean) {
  const asOf = c.asOf;
  return c.medicines.reduce((sum, m) => {
    const lines =
      (dense ? 21 : 23) +
      (dense ? 21 : 22) +
      (m.note ? 17 : 0) +
      (flagOf(m, asOf) ? (own(m.change?.what).length > 30 ? 34 : 17) : 0);
    const left = Math.max(dense ? 38 : 46, lines) + (dense ? 14 : 22);
    const dose = (dense ? 20 + 1 + 22 + 1 + 16 + 10 : 26 + 3 + 22 + 3 + 16 + 16);
    return sum + Math.max(left, dose) + 1;
  }, 0);
}

export function fridgeChart(brand: Brand) {
  const body = (brand.theme.fonts as Record<string, string>).body!;
  const heading = (brand.theme.fonts as Record<string, string>).heading!;

  /** English inside a right-to-left page: written left to right, still set against the right edge. */
  const ltr = (l: Language) => (l.dir === "rtl" ? { dir: "ltr" as const } : {});
  const ltrAlign = (l: Language) => (l.dir === "rtl" ? { textAlign: "right" as const } : {});
  /** Text in the parent's language: their script's font, their direction. */
  const ownStyle = (l: Language) => ({ fontFamily: stackFor(l, body) });
  const flagColors = { new: token("colors.primary"), changed: token("colors.accent") } as const;

  function MedicineCell({ m, l, asOf, i, dense }: { m: Medicine; l: Language; asOf: string; i: number; dense: boolean }) {
    const flag = flagOf(m, asOf);
    const what = flag === "changed" ? own(m.change!.what) : flag === "new" ? l.t.since(day(m.since!, l.locale, { day: "numeric", month: "short" })) : "";
    return (
      <Row stackOnMobile={false} style={{ width: NAME, gap: 12, padding: dense ? [7, 14] : [11, 14], alignItems: "center" }}>
        <Pill form={m.form} color={m.color} size={dense ? 38 : 46} />
        <Column style={{ gap: 1 }}>
          <Text field={`medicines[${i}].name`} {...ltr(l)} style={{ ...ltrAlign(l), fontFamily: body, fontSize: dense ? 17 : 19, fontWeight: 700, lineHeight: 1.2 }}>
            {m.name} <Span style={{ fontWeight: 400, color: token("colors.muted") }}>{m.strength}</Span>
          </Text>
          <Text field={`medicines[${i}].purpose`} style={{ ...ownStyle(l), fontSize: dense ? 16 : 17, lineHeight: 1.3 }}>
            {l.code === "en" ? m.purpose.en : own(m.purpose)}
            <Span style={{ fontSize: 13, color: token("colors.muted") }}>
              {`${l.code === "en" ? "" : `  ${m.purpose.en}`}${m.food === "with" ? " · with food" : m.food === "before" ? " · before food" : ""}`}
            </Span>
          </Text>
          {m.note ? (
            <Text style={{ ...ownStyle(l), fontSize: 13, lineHeight: 1.3, fontWeight: 700, color: token("colors.foreground") }}>
              {l.code === "en" ? m.note.en : `${own(m.note)} · ${m.note.en}`}
            </Text>
          ) : null}
          {flag ? (
            <Text style={{ ...ownStyle(l), fontSize: 13, lineHeight: 1.3, fontWeight: 700, color: flagColors[flag] }}>
              <Span style={{ color: "#ffffff", backgroundColor: flagColors[flag] }}>{` ${l.code === "en" ? (flag === "new" ? "New" : "Changed") : `${flag === "new" ? l.t.newMed : l.t.changed} · ${flag === "new" ? "New" : "Changed"}`} `}</Span>
              {` ${what}`}
            </Text>
          ) : null}
        </Column>
      </Row>
    );
  }

  function DoseCell({ m, slot, l, dense }: { m: Medicine; slot: Slot; l: Language; dense: boolean }) {
    const n = m.doses[slot] ?? 0;
    const c = SLOT_COLORS[slot];
    return (
      <Column
        style={{ width: SLOT_W, backgroundColor: n ? c.tint : "#ffffff", padding: dense ? [5, 8] : [8, 10], gap: dense ? 1 : 3, alignItems: "center", justifyContent: "center" }}
      >
        {n ? (
          <>
            <Row stackOnMobile={false} style={{ gap: 4, justifyContent: "center", alignItems: "center" }}>
              {Array.from({ length: dense ? 1 : Math.min(n, 3) }, (_, k) => (
                <Pill key={k} form={m.form} color={m.color} size={dense ? 20 : 26} />
              ))}
            </Row>
            <Text style={{ ...ownStyle(l), fontSize: 18, fontWeight: 700, lineHeight: 1.2, color: c.ink, textAlign: "center" }}>{l.t.dose(n, m.form)}</Text>
            {m.food !== "any" ? (
              <Text style={{ ...ownStyle(l), fontSize: 13, lineHeight: 1.2, color: c.ink, textAlign: "center" }}>{l.t.food[m.food]}</Text>
            ) : null}
          </>
        ) : (
          <Text style={{ fontSize: 18, color: "#c9c2b5", textAlign: "center" }}>–</Text>
        )}
      </Column>
    );
  }

  const rule = { width: 1, style: "solid", color: token("colors.border") } as const;

  return template({
    id: "kin.FridgeChart",
    version: "1.0.0",
    label: "Fridge medicine chart",
    description:
      "A parent's medicines on one landscape page for the fridge, in their own language with English beneath: each medicine drawn as it looks, by time of day, with what's changed flagged, and a tick sheet for the week",
    guidance: "One page a parent reads from across the kitchen. Their words first; nothing on it they'd have to ask about.",
    root: "Document",
    fields: careFields,
    rules: {
      require: { core: ["layout/overflow", "document/overflow"] },
      root: { lang: true },
    },
    example: sharma as never,
    render: (v) => {
      const c = v as unknown as Care;
      assertCare(c);
      const l = lang(c);
      const fam = c.contacts.find((x) => x.role === "family")!;
      const doctor = c.contacts.find((x) => x.role === "doctor");
      const pharmacy = c.contacts.find((x) => x.role === "pharmacy");
      const monday = mondayOf(c.asOf);
      const dense = chartHeight(c, false) > ROOM;
      if (dense && chartHeight(c, true) > ROOM)
        throw new Error(
          `medicines: ${c.medicines.length} medicines with these notes don't fit on one fridge page, and a medicine cut off a chart is worse than none. Shorten the notes, or split the list across two charts.`,
        );
      const doses = SLOTS.flatMap((s) => c.medicines.filter((m) => slotsOf(m).includes(s)).map((m) => ({ s, m })));
      return (
        <Document
          size="A4"
          orientation="landscape"
          margin={36}
          title={`${c.person.name}: medicines, ${day(c.asOf)}`}
          lang={l.code}
          dir={l.dir}
          theme={brand.theme}
          fonts={[...brand.fonts, ...fontFacesFor(l)]}
          style={{ fontSize: 16, lineHeight: 1.4, color: token("colors.foreground"), backgroundColor: token("colors.background") }}
        >
          <Document.Page style={{ gap: 14 }}>
            {/* Who it's for, what they can't take, and who to call. */}
            <Row stackOnMobile={false} style={{ gap: 14, alignItems: "stretch" }}>
              <Column style={{ gap: 0, justifyContent: "end" }}>
                <Text style={{ ...ownStyle(l), fontSize: 15, fontWeight: 700, color: token("colors.primary") }}>
                  {l.code === "en" ? "My medicines" : `${l.t.mine} · My medicines`}
                </Text>
                <Heading level={1} field="person.ownName" style={{ ...(c.person.ownName ? ownStyle(l) : { fontFamily: heading }), fontSize: 36, lineHeight: 1.15 }}>
                  {c.person.ownName || c.person.name}
                </Heading>
                <Text style={{ ...ownStyle(l), fontSize: 14, color: token("colors.muted") }}>
                  {c.person.ownName ? `${c.person.name} · ` : ""}
                  {`${l.code === "en" ? "" : `${l.t.updated} / `}Updated ${day(c.asOf, "en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
                </Text>
              </Column>
              <Column style={{ flex: "none", width: 270, border: { width: 2, style: "solid", color: token("colors.accent") }, borderRadius: 14, padding: [8, 14], gap: 0, justifyContent: "center", backgroundColor: "#ffffff" }}>
                <Text style={{ ...ownStyle(l), fontSize: 14, fontWeight: 700, color: token("colors.accent") }}>
                  {l.code === "en" ? "Allergies" : `${l.t.allergies} · Allergies`}
                </Text>
                <Text field="allergies" style={{ ...ownStyle(l), fontSize: 19, fontWeight: 700, lineHeight: 1.25 }}>
                  {c.allergies.map((a) => (l.code === "en" || !a.own ? a.en : a.own)).join(", ")}
                </Text>
                {l.code === "en" ? null : <Text style={{ fontSize: 13, lineHeight: 1.3 }}>{c.allergies.map((a) => a.en).join(", ")}</Text>}
              </Column>
              <Row
                stackOnMobile={false}
                style={{ flex: "none", width: 330, backgroundColor: token("colors.accent"), color: "#ffffff", borderRadius: 14, padding: [8, 16], gap: 14, alignItems: "center" }}
              >
                <Phone size={30} />
                <Column style={{ gap: 0 }}>
                  <Text style={{ ...ownStyle(l), fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                    {l.code === "en" ? "Emergency" : `${l.t.emergency} · Emergency`}
                  </Text>
                  <Text style={{ fontFamily: body, fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{c.emergencyNumber}</Text>
                  <Text style={{ fontFamily: body, fontSize: 14, lineHeight: 1.3 }}>
                    {`${fam.name.split(" ")[0]} (${fam.relation}) ${fam.phone}`}
                  </Text>
                </Column>
              </Row>
            </Row>

            {/* The chart: a medicine a row, a time of day a column. */}
            <Column style={{ border: rule, borderRadius: 14, overflow: "hidden", backgroundColor: "#ffffff" }}>
              <Row stackOnMobile={false} style={{ border: { bottom: rule } }}>
                <Column style={{ width: NAME, padding: [12, 14], justifyContent: "end" }}>
                  <Text style={{ ...ownStyle(l), fontSize: 20, fontWeight: 700 }}>{l.t.medicines}</Text>
                  {l.code === "en" ? null : <Text style={{ fontSize: 13, color: token("colors.muted") }}>Medicines</Text>}
                </Column>
                {SLOTS.map((s) => (
                  <Column key={s} style={{ width: SLOT_W, backgroundColor: SLOT_COLORS[s].tint, padding: [8, 8], gap: 1, alignItems: "center" }}>
                    <SlotIcon slot={s} size={30} />
                    <Text style={{ ...ownStyle(l), fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: SLOT_COLORS[s].ink, textAlign: "center" }}>{l.t.slot[s]}</Text>
                    {l.code === "en" ? null : (
                      <Text style={{ fontSize: 13, lineHeight: 1.2, color: SLOT_COLORS[s].ink, textAlign: "center" }}>
                        {{ morning: "Morning", midday: "Midday", evening: "Evening", bedtime: "Bedtime" }[s]}
                      </Text>
                    )}
                  </Column>
                ))}
              </Row>
              {c.medicines.map((m, i) => (
                <Row key={m.name} stackOnMobile={false} style={{ alignItems: "stretch", ...(i < c.medicines.length - 1 ? { border: { bottom: rule } } : {}) }}>
                  <MedicineCell m={m} l={l} asOf={c.asOf} i={i} dense={dense} />
                  {SLOTS.map((s) => (
                    <DoseCell key={s} m={m} slot={s} l={l} dense={dense} />
                  ))}
                </Row>
              ))}
            </Column>

            {/* The safety line, the doctor and the pharmacy. */}
            <Row stackOnMobile={false} style={{ gap: 14, alignItems: "center" }}>
              <Column style={{ gap: 0 }}>
                <Text style={{ ...ownStyle(l), fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{l.t.dontStop}</Text>
                {l.code === "en" ? null : <Text {...ltr(l)} style={{ ...ltrAlign(l), fontSize: 13, lineHeight: 1.3, color: token("colors.muted") }}>{"Don't stop or change any medicine without asking the doctor."}</Text>}
              </Column>
              <Column style={{ flex: "none", width: 380, gap: 0 }}>
                {[doctor, pharmacy].filter(Boolean).map((x) => (
                  <Text key={x!.name} style={{ ...ownStyle(l), fontSize: 13, lineHeight: 1.35, textAlign: l.dir === "rtl" ? "left" : "right" }}>
                    <Span style={{ fontWeight: 700 }}>{x!.role === "doctor" ? l.t.doctor : l.t.pharmacy}</Span>
                    {` ${x!.name} · ${x!.phone}`}
                  </Text>
                ))}
              </Column>
            </Row>
          </Document.Page>

          <Document.Page style={{ gap: 14 }}>
            <Row stackOnMobile={false} style={{ gap: 24, alignItems: "end" }}>
              <Column style={{ gap: 2 }}>
                <Heading level={2} style={{ ...ownStyle(l), fontSize: 30 }}>
                  {l.t.tick}
                </Heading>
                <Text style={{ fontSize: 15, color: token("colors.muted") }}>
                  {`${l.code === "en" ? "" : "Tick each one when it's taken · "}${day(monday)} – ${day(addDays(monday, 6), "en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
                </Text>
              </Column>
            </Row>
            <Column style={{ border: rule, borderRadius: 14, overflow: "hidden", backgroundColor: "#ffffff" }}>
              <Row stackOnMobile={false} style={{ border: { bottom: rule }, backgroundColor: token("colors.surface") }}>
                <Column style={{ width: 300, padding: [10, 14] }}>
                  <Text style={{ ...ownStyle(l), fontSize: 13, fontWeight: 700, color: token("colors.muted") }}>
                    {l.code === "en" ? "Who's with you" : `${l.t.withYou} · With you`}
                  </Text>
                </Column>
                {WEEKDAYS.map((d, k) => (
                  <Column key={d} style={{ padding: [8, 4], gap: 0, alignItems: "center" }}>
                    <Text style={{ ...ownStyle(l), fontSize: 17, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{l.t.day[d]}</Text>
                    <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center", lineHeight: 1.2 }}>{day(addDays(monday, k), "en-GB", { day: "numeric", month: "short" })}</Text>
                    <Text field={`rota.${d}`} style={{ fontSize: 13, fontWeight: 700, color: token("colors.primary"), textAlign: "center", lineHeight: 1.3 }}>
                      {c.rota[d]}
                    </Text>
                  </Column>
                ))}
              </Row>
              {doses.map(({ s, m }, i) => (
                <Row
                  key={`${s}-${m.name}`}
                  stackOnMobile={false}
                  style={{ alignItems: "center", ...(i < doses.length - 1 ? { border: { bottom: rule } } : {}) }}
                >
                  <Row stackOnMobile={false} style={{ width: 300, padding: [6, 12], gap: 10, alignItems: "center", backgroundColor: SLOT_COLORS[s].tint }}>
                    <SlotIcon slot={s} size={24} />
                    <Pill form={m.form} color={m.color} size={24} />
                    <Column style={{ gap: 0 }}>
                      <Text style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{`${m.name} ${m.strength}`}</Text>
                      <Text style={{ ...ownStyle(l), fontSize: 13, lineHeight: 1.25, color: SLOT_COLORS[s].ink }}>
                        {`${l.t.slot[s]} · ${l.t.dose(m.doses[s], m.form)}`}
                      </Text>
                    </Column>
                  </Row>
                  {WEEKDAYS.map((d) => (
                    <Column key={d} style={{ padding: [6, 4], alignItems: "center" }}>
                      <TickBox size={24} />
                    </Column>
                  ))}
                </Row>
              ))}
            </Column>
            <Text style={{ ...ownStyle(l), fontSize: 14, color: token("colors.muted") }}>
              {`${c.person.name}${doctor ? ` · ${l.t.doctor}${l.code === "en" ? "" : " / Doctor"}: ${doctor.name} ${doctor.phone}` : ""}`}
            </Text>
          </Document.Page>
        </Document>
      );
    },
  });
}

export default fridgeChart(kin);
