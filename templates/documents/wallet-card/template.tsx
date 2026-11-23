/**
 * The wallet card: what a paramedic needs in the first minute, on a card that folds to the size of a bank card.
 * One page prints two: the first in English, for a stranger who finds them; the second in the parent's own language,
 * with English beside it, for them to show a doctor. Each folds in half along its centre line: the front says who
 * they are, what they can't take and who to call; the inside lists every medicine and when it's taken.
 *
 * Locked: the card's size and folds, what's on each side and in what order. A design gives the care file.
 */
import { Column, Document, Heading, Row, Span, Text, token } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import type { Brand } from "../../_brand";
import { brand as kin } from "../../_brands/kin";
import { careFields } from "../../_care/fields";
import { ageOn, assertCare, day, lang, own, slotsOf, type Care } from "../../_care/compute";
import { LANGUAGE, SLOTS, fontFacesFor, stackFor, type Language } from "../../_care/languages";
import { Phone, Pill, SLOT_COLORS, SlotIcon, SAFETY, paperTheme } from "../../_care/parts";
import sharma from "../../../families/sharma.care.json";

/** A bank card, 85.6 by 54 mm, at 96px to the inch, a little larger so 8pt text stays 8pt after trimming. */
const CARD = { width: 328, height: 208 };

export function walletCard(brand: Brand) {
  const body = (brand.theme.fonts as Record<string, string>).body!;
  const heading = (brand.theme.fonts as Record<string, string>).heading!;
  const dashed = { width: 1, style: "dashed", color: "#8a8f8c" } as const;
  const tiny = { fontSize: 9, lineHeight: 1.25 } as const;
  const label = { fontSize: 7.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: token("colors.muted"), lineHeight: 1.2 } as const;

  /** One card, folded: `l` is the language it's written in; English always rides along on the bilingual card. */
  function Card({ c, l }: { c: Care; l: Language }) {
    const en = l.code === "en";
    const parent = LANGUAGE[c.language];
    const font = { fontFamily: stackFor(l, body) };
    const both = (ownText: string, enText: string) => (en ? enText : `${ownText} · ${enText}`);
    const family = c.contacts.filter((x) => x.role === "family").slice(0, 2);
    const doctor = c.contacts.find((x) => x.role === "doctor");
    const age = ageOn(c.person.born, c.asOf);
    return (
      <Row stackOnMobile={false} dir={l.dir} style={{ gap: 0, border: dashed, width: CARD.width * 2 + 4 }}>
        {/* The front: who, what they can't take, who to call. */}
        <Column style={{ width: CARD.width, height: CARD.height, backgroundColor: "#ffffff", ...font }}>
          <Row stackOnMobile={false} style={{ backgroundColor: SAFETY.solid, color: SAFETY.onSolid, padding: [5, 10], gap: 6, alignItems: "center" }}>
            <Phone size={12} />
            <Text style={{ ...font, fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>{en ? "Emergency card" : l.t.card}</Text>
            <Text style={{ ...font, fontSize: 9, fontWeight: 700, lineHeight: 1.2, textAlign: l.dir === "rtl" ? "left" : "right" }}>
              {`${en ? "Emergency" : l.t.emergency} ${c.emergencyNumber}`}
            </Text>
          </Row>
          <Column style={{ padding: [6, 10, 8], gap: 4 }}>
            <Column style={{ gap: 0 }}>
              <Heading level={2} style={{ fontFamily: !en && c.person.ownName ? stackFor(l, body) : heading, fontSize: 15, lineHeight: 1.15 }}>
                {!en && c.person.ownName ? `${c.person.ownName} · ${c.person.name}` : c.person.name}
              </Heading>
              <Text style={{ ...font, ...tiny, color: token("colors.muted") }}>
                {`${en ? "Born" : l.t.born} ${day(c.person.born, en ? "en-GB" : l.locale, { day: "numeric", month: "short", year: "numeric" })} (${en ? `${age}` : l.t.age(age)}) · ${en ? "Blood" : l.t.bloodType} ${c.person.bloodType}${c.person.nhs ? ` · NHS ${c.person.nhs}` : ""}`}
              </Text>
            </Column>
            {c.language !== "en" ? (
              <Text style={{ fontFamily: stackFor(parent, body), fontSize: 9.5, fontWeight: 700, lineHeight: 1.25, backgroundColor: token("colors.surface"), borderRadius: 4, padding: [2, 6] }}>
                {en
                  ? `Speaks ${parent.english} (${parent.own}). Little English: please call family.`
                  : `${l.t.speaks}: ${parent.own} · Speaks ${parent.english}`}
              </Text>
            ) : null}
            <Column style={{ gap: 0, border: { left: { width: 3, style: "solid", color: SAFETY.ink } }, padding: [0, 0, 0, 6] }}>
              <Text style={{ ...font, ...label, color: SAFETY.ink }}>{both(l.t.allergies, "Allergies")}</Text>
              <Text style={{ ...font, fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>
                {c.allergies.map((a) => (en ? a.en : `${own(a)} (${a.en})`)).join(", ")}
              </Text>
            </Column>
            {c.conditions.length ? (
              <Column style={{ gap: 0 }}>
                <Text style={{ ...font, ...label }}>{both(l.t.conditions, "Conditions")}</Text>
                <Text style={{ ...font, ...tiny }}>{c.conditions.map((x) => (en ? x.en : own(x))).join(", ")}</Text>
              </Column>
            ) : null}
            <Column style={{ gap: 0 }}>
              <Text style={{ ...font, ...label }}>{en ? "Please call" : `${l.t.emergency} · Please call`}</Text>
              {family.map((x) => (
                <Text key={x.phone} dir="ltr" style={{ ...font, fontSize: 10, lineHeight: 1.25, textAlign: l.dir === "rtl" ? "right" : "left" }}>
                  <Span style={{ fontWeight: 700 }}>{x.phone}</Span>
                  {` ${x.name} (${x.relation})`}
                </Text>
              ))}
            </Column>
          </Column>
        </Column>
        {/* The fold. */}
        <Column style={{ width: 2, height: CARD.height, backgroundColor: "#ffffff", border: { left: dashed } }} />
        {/* The inside: every medicine, and when. */}
        <Column style={{ width: CARD.width, height: CARD.height, backgroundColor: "#ffffff", padding: [7, 10], gap: 3, ...font }}>
          <Row stackOnMobile={false} style={{ gap: 6, alignItems: "center" }}>
            <Text style={{ ...font, fontSize: 10, fontWeight: 700, lineHeight: 1.2, color: token("colors.primary") }}>{both(l.t.mine, "Medicines")}</Text>
            <Text style={{ ...font, fontSize: 7.5, lineHeight: 1.2, color: token("colors.muted"), textAlign: l.dir === "rtl" ? "left" : "right" }}>
              {`${en ? "Updated" : l.t.updated} ${day(c.asOf, en ? "en-GB" : l.locale, { day: "numeric", month: "short", year: "numeric" })}`}
            </Text>
          </Row>
          {c.medicines.map((m) => (
            <Row key={m.name} stackOnMobile={false} style={{ gap: 5, alignItems: "center", border: { bottom: { width: 0.5, style: "solid", color: token("colors.border") } }, padding: [0, 0, 2, 0] }}>
              <Pill form={m.form} color={m.color} size={12} />
              <Text style={{ ...font, fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>
                {`${m.name} ${m.strength}`}
                <Span style={{ fontWeight: 400, color: token("colors.muted") }}>{` ${en ? m.purpose.en.replace(/^For (the )?/, "") : own(m.purpose)}`}</Span>
              </Text>
              <Row stackOnMobile={false} style={{ width: 92, gap: 2, alignItems: "center", justifyContent: "end" }}>
                {slotsOf(m).map((s) => (
                  <Row key={s} stackOnMobile={false} style={{ width: 22, gap: 1, alignItems: "center", backgroundColor: SLOT_COLORS[s].tint, borderRadius: 3, padding: [1, 2] }}>
                    <SlotIcon slot={s} size={9} />
                    <Text style={{ fontFamily: body, fontSize: 7.5, fontWeight: 700, lineHeight: 1.2, color: SLOT_COLORS[s].ink }}>{`${m.doses[s]}`}</Text>
                  </Row>
                ))}
              </Row>
            </Row>
          ))}
          <Row stackOnMobile={false} style={{ gap: 6, alignItems: "center" }}>
            {SLOTS.map((s) => (
              <Row key={s} stackOnMobile={false} style={{ width: 70, gap: 3, alignItems: "center" }}>
                <SlotIcon slot={s} size={9} />
                <Text style={{ ...font, fontSize: 7.5, lineHeight: 1.2, color: SLOT_COLORS[s].ink }}>{l.t.slot[s]}</Text>
              </Row>
            ))}
          </Row>
          {doctor ? (
            <Text style={{ ...font, fontSize: 8.5, lineHeight: 1.25 }}>
              <Span style={{ fontWeight: 700 }}>{both(l.t.doctor, "GP")}</Span>
              {" "}
              <Span>{l.dir === "rtl" ? `${doctor.name} · \u2066${doctor.phone}\u2069` : `${doctor.name} · ${doctor.phone}`}</Span>
            </Text>
          ) : null}
        </Column>
      </Row>
    );
  }

  return template({
    id: "kin.WalletCard",
    version: "1.0.0",
    label: "Wallet emergency card",
    description:
      "A fold-in-half emergency card the size of a bank card, printed twice: in English for a stranger, and in the parent's own language for them to show a doctor. Who they are, their allergies, who to call, and every medicine",
    guidance: "What a paramedic needs in the first minute. Nothing on it that isn't needed then.",
    root: "Document",
    fields: careFields,
    rules: { require: { core: ["layout/overflow", "document/overflow"] }, root: { lang: true } },
    example: sharma as never,
    render: (v) => {
      const c = v as unknown as Care;
      assertCare(c);
      if (c.medicines.length > 7) throw new Error(`medicines: a wallet card holds 7 medicines; this file has ${c.medicines.length}. Print the fridge chart for the rest.`);
      const l = lang(c);
      return (
        <Document
          size="A4"
          margin={48}
          title={`${c.person.name}: emergency card`}
          lang={l.code}
          dir={l.dir}
          theme={paperTheme(brand.theme)}
          fonts={[...brand.fonts, ...fontFacesFor(l)]}
          style={{ fontSize: 12, lineHeight: 1.4, color: token("colors.foreground"), alignItems: "center", gap: 28 }}
        >
          <Column style={{ gap: 4, alignItems: "center" }}>
            <Heading level={1} style={{ fontFamily: heading, fontSize: 26, textAlign: "center" }}>
              {`${c.person.callName}'s emergency cards`}
            </Heading>
            <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>{LANGUAGE.en.t.cut}</Text>
            {l.code === "en" ? null : <Text style={{ fontFamily: stackFor(l, body), fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>{l.t.cut}</Text>}
          </Column>
          <Column style={{ gap: 6, alignItems: "center" }}>
            <Text style={{ ...label }}>For the wallet · in English, for whoever finds it</Text>
            <Card c={c} l={LANGUAGE.en} />
          </Column>
          {c.language === "en" ? (
            <Column style={{ gap: 6, alignItems: "center" }}>
              <Text style={{ ...label }}>{`A spare · for ${c.person.callName}'s coat pocket, the car, or the carer`}</Text>
              <Card c={c} l={LANGUAGE.en} />
            </Column>
          ) : (
            <Column style={{ gap: 6, alignItems: "center" }}>
              <Text style={{ ...label }}>{`For ${c.person.callName} · in ${l.english} and English`}</Text>
              <Card c={c} l={l} />
            </Column>
          )}
          <Text style={{ fontSize: 10, color: token("colors.muted"), textAlign: "center" }}>
            {`Printed from ${c.person.callName}'s care file, checked ${day(c.asOf, "en-GB", { day: "numeric", month: "long", year: "numeric" })}. Print a new one whenever a medicine changes.`}
          </Text>
        </Document>
      );
    },
  });
}

export default walletCard(kin);
