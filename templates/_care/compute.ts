/**
 * What the papers work out from the care file, so nobody has to: how many days of each medicine are left, the day to
 * order more, what's new or changed, and who's on which day. Dates are calendar days in UTC: no clock is read, so the
 * same care file prints the same papers on any machine.
 */
import { formatDate } from "@hyper-elements/react/template";
import { LANGUAGE, SLOTS, WEEKDAYS, type Language, type LanguageCode, type Slot, type Weekday } from "./languages";

export type Bi = { en: string; own?: string };
export type Doses = Record<Slot, number>;
export type Medicine = {
  name: string;
  strength: string;
  form: "tablet" | "capsule" | "liquid" | "drops" | "inhaler" | "injection" | "patch";
  color: string;
  purpose: Bi;
  doses: Doses;
  food: "with" | "before" | "any";
  note?: Bi;
  supply?: number;
  since?: string;
  change?: { on: string; what: Bi };
};
export type Contact = { name: string; relation: string; phone: string; role: "family" | "doctor" | "pharmacy" };
export type Appointment = { date: string; time: string; what: Bi; where: string; who?: string };
export type Care = {
  asOf: string;
  language: LanguageCode;
  person: { name: string; callName: string; ownName?: string; born: string; bloodType: string; nhs?: string };
  medicines: Medicine[];
  allergies: Bi[];
  conditions: Bi[];
  contacts: Contact[];
  emergencyNumber: string;
  rota: Record<Weekday, string>;
  appointments: Appointment[];
};

const DAY = 86_400_000;
export const toDay = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
export const addDays = (iso: string, n: number) => new Date(toDay(iso) + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (from: string, to: string) => Math.round((toDay(to) - toDay(from)) / DAY);
/** Monday is 0. */
export const weekdayOf = (iso: string): Weekday => WEEKDAYS[(new Date(toDay(iso)).getUTCDay() + 6) % 7]!;
export const mondayOf = (iso: string) => addDays(iso, -WEEKDAYS.indexOf(weekdayOf(iso)));

/** How long a change or a new medicine is flagged on the papers. */
export const FLAG_DAYS = 14;
/** How many days before a medicine runs out the family should order it: a pharmacy's usual lead time, and a weekend. */
export const ORDER_AHEAD = 5;

export const perDay = (m: Medicine) => SLOTS.reduce((sum, s) => sum + (m.doses[s] ?? 0), 0);
export const slotsOf = (m: Medicine) => SLOTS.filter((s) => (m.doses[s] ?? 0) > 0);

export function supplyOf(m: Medicine, asOf: string) {
  const daily = perDay(m);
  if (m.supply === undefined || daily === 0) return undefined;
  const days = Math.floor(m.supply / daily);
  const runsOut = addDays(asOf, days);
  const orderBy = addDays(runsOut, -ORDER_AHEAD);
  return { days, runsOut, orderBy, urgent: daysBetween(asOf, orderBy) <= 2 };
}

export const isNew = (m: Medicine, asOf: string) => !!m.since && daysBetween(m.since, asOf) >= 0 && daysBetween(m.since, asOf) <= FLAG_DAYS;
export const isChanged = (m: Medicine, asOf: string) =>
  !!m.change && daysBetween(m.change.on, asOf) >= 0 && daysBetween(m.change.on, asOf) <= FLAG_DAYS;
export const flagOf = (m: Medicine, asOf: string): "new" | "changed" | undefined =>
  isNew(m, asOf) ? "new" : isChanged(m, asOf) ? "changed" : undefined;

export const ageOn = (born: string, on: string) => {
  const [by, bm, bd] = born.split("-").map(Number);
  const [y, mo, d] = on.split("-").map(Number);
  return y! - by! - (mo! < bm! || (mo === bm && d! < bd!) ? 1 : 0);
};

/** The parent's own words where the file has them, else the English. */
export const own = (b: Bi | undefined) => (b ? b.own?.trim() || b.en : "");
export const lang = (c: Pick<Care, "language">): Language => LANGUAGE[c.language];

export const day = (iso: string, locale = "en-GB", opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }) =>
  formatDate(iso, locale, opts);
export const longDay = (iso: string, locale = "en-GB") => formatDate(iso, locale, { weekday: "long", day: "numeric", month: "long" });

/** A care file's own checks: the ones a field can't make on its own. Each says what to change. */
export function careProblems(c: Care): string[] {
  const out: string[] = [];
  if (!c.contacts.some((x) => x.role === "family")) out.push("contacts: add at least one family member: the card tells a stranger who to call.");
  c.medicines.forEach((m, i) => {
    if (perDay(m) === 0) out.push(`medicines[${i}].doses: ${m.name} is taken at no time of day: give a dose for at least one.`);
    if (m.since && daysBetween(m.since, c.asOf) < 0) out.push(`medicines[${i}].since: ${m.name} starts after the care file's date.`);
  });
  const names = c.medicines.map((m) => m.name.toLowerCase());
  names.forEach((n, i) => names.indexOf(n) !== i && out.push(`medicines[${i}].name: ${c.medicines[i]!.name} is listed twice: one row per medicine.`));
  return out;
}

/** Throws the care file's problems, so a template's render stops with them (template/render) and nothing prints. */
export function assertCare(c: Care) {
  const problems = careProblems(c);
  if (problems.length) throw new Error(problems.join(" "));
}
