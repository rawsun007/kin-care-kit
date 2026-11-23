/**
 * The week card: one image for the family's group chat on a Monday. Who's with the parent each day, the next
 * appointment and who's taking them, and the medicine to order first. 1080 by 1350, the shape a phone shows whole.
 * The day names are in the parent's language too, where the image renderer can set its script: right-to-left scripts
 * get English only (the renderer doesn't reorder their words yet), and the check says so.
 */
import { Canvas, Column, Heading, Row, Text, token } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import type { Brand } from "../../_brand";
import { brand as kin } from "../../_brands/kin";
import { careFields } from "../../_care/fields";
import { addDays, assertCare, day, daysBetween, lang, mondayOf, supplyOf, weekdayOf, type Care } from "../../_care/compute";
import { LANGUAGE, WEEKDAYS, fontFacesFor, stackFor } from "../../_care/languages";
import { Mark, Pill } from "../../_care/parts";
import sharma from "../../../families/sharma.care.json";

export function weekCard(brand: Brand) {
  const body = (brand.theme.fonts as Record<string, string>).body!;
  const heading = (brand.theme.fonts as Record<string, string>).heading!;
  const colors = brand.theme.colors as Record<string, string>;
  const first = (stack: string) => stack.split(",")[0]!.trim().replace(/^'|'$/g, "");

  return template({
    id: "kin.WeekCard",
    version: "1.0.0",
    label: "Week card",
    description: "One image for the family group chat: who's with the parent each day this week, the next appointment, and the medicine to order first",
    root: "Canvas",
    fields: careFields,
    rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] }, root: { lang: true } },
    example: sharma as never,
    render: (v) => {
      const c = v as unknown as Care;
      assertCare(c);
      const parent = lang(c);
      const l = parent.canvas ? parent : LANGUAGE.en;
      const ownFont = first(stackFor(l, body));
      const today = weekdayOf(c.asOf);
      const monday = mondayOf(c.asOf);
      const next = c.appointments.filter((a) => daysBetween(c.asOf, a.date) >= 0).sort((a, b) => (a.date < b.date ? -1 : 1))[0];
      const order = c.medicines
        .map((m) => ({ m, s: supplyOf(m, c.asOf) }))
        .filter((x) => x.s)
        .sort((a, b) => a.s!.days - b.s!.days)[0];
      return (
        <Canvas
          width={1080}
          height={1350}
          lang={l.code}
          fonts={[...brand.fonts, ...fontFacesFor(l)]}
          theme={brand.theme}
          style={{ backgroundColor: token("colors.primary"), color: "#ffffff", padding: 72, gap: 36, fontFamily: first(body) }}
        >
          <Row stackOnMobile={false} style={{ gap: 16, alignItems: "center" }}>
            <Mark size={56} color={colors.background!} accent={colors.accent!} />
            <Text style={{ fontFamily: first(body), fontSize: 30, fontWeight: 700, color: colors.background }}>
              {`${day(monday, "en-GB", { day: "numeric", month: "short" })} – ${day(addDays(monday, 6), "en-GB", { day: "numeric", month: "short" })}`}
            </Text>
          </Row>
          <Column style={{ gap: 8 }}>
            <Heading level={1} fit={{ sizes: [96, 84, 72], maxLines: 1 }} style={{ fontFamily: first(heading), lineHeight: 1.05, color: "#ffffff" }}>
              {`This week with ${c.person.callName}`}
            </Heading>
          </Column>
          <Column style={{ backgroundColor: colors.background, color: colors.foreground, borderRadius: 32, padding: [16, 36], gap: 0 }}>
            {WEEKDAYS.map((d, k) => (
              <Row
                key={d}
                stackOnMobile={false}
                style={{ gap: 20, alignItems: "center", padding: [19, 0], ...(k < 6 ? { border: { bottom: { width: 2, style: "solid", color: colors.border } } } : {}) }}
              >
                <Column style={{ width: 230, gap: 0 }}>
                  <Text style={{ fontFamily: first(body), fontSize: 30, fontWeight: 700, lineHeight: 1.15, color: d === today ? colors.accent : colors.foreground }}>
                    {`${LANGUAGE.en.t.day[d]} ${day(addDays(monday, k), "en-GB", { day: "numeric" })}`}
                  </Text>
                  {l.code !== "en" ? <Text style={{ fontFamily: ownFont, fontSize: 24, lineHeight: 1.2, color: colors.muted }}>{l.t.day[d]}</Text> : null}
                </Column>
                <Text style={{ fontFamily: first(body), fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>{c.rota[d]}</Text>
              </Row>
            ))}
          </Column>
          <Row stackOnMobile={false} style={{ gap: 24 }}>
            {next ? (
              <Column style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 28, padding: [24, 28], gap: 4 }}>
                <Text style={{ fontFamily: first(body), fontSize: 22, fontWeight: 700, color: colors.background }}>NEXT APPOINTMENT</Text>
                <Text style={{ fontFamily: first(body), fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>{`${day(next.date, "en-GB", { weekday: "short", day: "numeric", month: "short" })}, ${next.time}`}</Text>
                <Text style={{ fontFamily: first(body), fontSize: 24, lineHeight: 1.3 }}>{`${next.what.en}${next.who ? ` · ${next.who}` : ""}`}</Text>
              </Column>
            ) : null}
            {order ? (
              <Row stackOnMobile={false} style={{ backgroundColor: colors.accent, borderRadius: 28, padding: [24, 28], gap: 20, alignItems: "center" }}>
                <Pill form={order.m.form} color={order.m.color} size={64} />
                <Column style={{ gap: 4 }}>
                  <Text style={{ fontFamily: first(body), fontSize: 22, fontWeight: 700 }}>ORDER FIRST</Text>
                  <Text style={{ fontFamily: first(body), fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>{order.m.name}</Text>
                  <Text style={{ fontFamily: first(body), fontSize: 24, lineHeight: 1.3 }}>{`by ${day(order.s!.orderBy, "en-GB", { weekday: "short", day: "numeric", month: "short" })}`}</Text>
                </Column>
              </Row>
            ) : null}
          </Row>
        </Canvas>
      );
    },
  });
}

export default weekCard(kin);
