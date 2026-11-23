/**
 * One care file: the fields every Kin template shares. A family keeps one `*.care.json` and every paper is made from
 * it, so the fridge chart, the wallet card and the email can never disagree about a dose.
 *
 * The rules here are the advice a pharmacist gives, written as checks that stop a print:
 * - a strength is a number and a unit (`500 mg`), never "one of the white ones";
 * - allergies are never left blank: a paramedic reads blank as "not asked". Write "None known" if there are none;
 * - a phone number is digits a phone can dial;
 * - a dose is a count, per time of day, so the chart can draw it and the email can count what's left.
 */
import { prop } from "@hyper-elements/react";
import { LANGUAGES, WEEKDAYS } from "./languages";

/** Text in English, and in the parent's own language where the family has it. */
export const bilingual = (label: string, maxLength: number, guidance?: string) =>
  prop.object(
    {
      en: prop.text({ label: `${label}, in English`, required: true, maxLength }),
      own: prop.text({ label: `${label}, in their language`, maxLength: maxLength + 16 }),
    },
    { label, required: true, ...(guidance ? { guidance } : {}) },
  );

export const PILL_COLORS = {
  white: { fill: "#ffffff", stroke: "#8a8f8c" },
  cream: { fill: "#f4e9c8", stroke: "#a58f52" },
  yellow: { fill: "#f6d34a", stroke: "#a8861a" },
  orange: { fill: "#f29a4a", stroke: "#a85a17" },
  pink: { fill: "#f4a7c0", stroke: "#a85676" },
  red: { fill: "#d9534f", stroke: "#8f2522" },
  blue: { fill: "#6aa7e0", stroke: "#2c5f8f" },
  green: { fill: "#79c28a", stroke: "#2f7a43" },
  purple: { fill: "#a58bd6", stroke: "#5b4391" },
  brown: { fill: "#a8774f", stroke: "#6b4425" },
} as const;
export type PillColor = keyof typeof PILL_COLORS;

const dose = (slot: string) =>
  prop.number({ label: `How many, ${slot}`, min: 0, max: 20, default: 0, guidance: "Tablets, capsules, puffs or drops; ml for a liquid; units for insulin" });

export const medicine = prop.object(
  {
    name: prop.text({ label: "Name", required: true, maxLength: 24, guidance: "As the box says it: Metformin, not 'the sugar tablet'" }),
    strength: prop.text({
      label: "Strength",
      required: true,
      pattern: "^\\d+(\\.\\d+)?\\s?(mg|mcg|g|ml|units|IU|%|mg/ml|mcg/dose)$",
      guidance: "A number and its unit, as on the box: 500 mg, 2.5 mg, 100 mcg/dose",
    }),
    form: prop.choice(["tablet", "capsule", "liquid", "drops", "inhaler", "injection", "patch"], { label: "What it is", required: true }),
    color: prop.choice(Object.keys(PILL_COLORS) as PillColor[], { label: "Its colour", default: "white", guidance: "What it looks like in the hand: the chart draws it" }),
    purpose: bilingual("What it's for", 34, "In the words the parent uses: 'for sugar', not 'type 2 diabetes mellitus'"),
    doses: prop.object(
      { morning: dose("in the morning"), midday: dose("at midday"), evening: dose("in the evening"), bedtime: dose("at bedtime") },
      { label: "When", required: true },
    ),
    food: prop.choice(["with", "before", "any"], { label: "With food", default: "any" }),
    note: prop.object(
      { en: prop.text({ label: "Note, in English", required: true, maxLength: 48 }), own: prop.text({ label: "Note, in their language", maxLength: 64 }) },
      { label: "A note", guidance: "One short thing that matters: 'Swallow whole', 'Rinse mouth after'" },
    ),
    supply: prop.number({ label: "How many are left", min: 0, max: 2000, integer: true, guidance: "Counted on the day of the care file, for the refill date" }),
    since: prop.date({ label: "Started on" }),
    change: prop.object(
      { on: prop.date({ label: "Changed on", required: true }), what: bilingual("What changed", 60) },
      { label: "A recent change", guidance: "The doctor's last change to it: the chart and the email lead with it for two weeks" },
    ),
  },
  { label: "Medicine" },
);

export const contact = prop.object(
  {
    name: prop.text({ label: "Name", required: true, maxLength: 28 }),
    relation: prop.text({ label: "Who they are", required: true, maxLength: 24, guidance: "Daughter, Son, GP, Pharmacy" }),
    phone: prop.text({ label: "Phone", required: true, pattern: "^\\+?[0-9][0-9 ()-]{5,18}[0-9]$", guidance: "Digits a phone can dial: +44 7700 900123" }),
    role: prop.choice(["family", "doctor", "pharmacy"], { label: "Kind", required: true }),
  },
  { label: "Contact" },
);

export const appointment = prop.object(
  {
    date: prop.date({ label: "Date", required: true }),
    time: prop.text({ label: "Time", required: true, pattern: "^([01]?\\d|2[0-3]):[0-5]\\d$", guidance: "24-hour: 09:30" }),
    what: bilingual("What it is", 40),
    where: prop.text({ label: "Where", required: true, maxLength: 48 }),
    who: prop.text({ label: "Who's taking them", maxLength: 16 }),
  },
  { label: "Appointment" },
);

const day = (name: string) => prop.text({ label: name, required: true, maxLength: 14 });

export const careFields = {
  asOf: prop.date({ label: "Checked on", required: true, guidance: "The day the boxes were last counted and this file was checked" }),
  language: prop.choice(LANGUAGES, { label: "Their language", required: true, guidance: "The chart, the card and their part of the email are printed in it" }),
  person: prop.object(
    {
      name: prop.text({ label: "Full name", required: true, maxLength: 36 }),
      callName: prop.text({ label: "What the family calls them", required: true, maxLength: 14, guidance: "Amma, Baba, Abuela" }),
      ownName: prop.text({ label: "Their name in their script", maxLength: 36 }),
      born: prop.date({ label: "Born", required: true }),
      bloodType: prop.choice(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"], { label: "Blood type", default: "Unknown" }),
      nhs: prop.text({ label: "Health number", maxLength: 20, guidance: "NHS, Aadhaar health ID, or the insurer's member number" }),
    },
    { label: "Who this is for", required: true },
  ),
  medicines: prop.list(medicine, { label: "Medicines", required: true, min: 1, max: 8 }),
  allergies: prop.list(bilingual("Allergy", 30), {
    label: "Allergies",
    required: true,
    min: 1,
    max: 4,
    guidance: "Never blank. If there are none, write 'None known': a paramedic reads an empty space as 'nobody asked'",
  }),
  conditions: prop.list(bilingual("Condition", 30), { label: "Conditions", max: 5 }),
  contacts: prop.list(contact, { label: "Contacts", required: true, min: 2, max: 6 }),
  emergencyNumber: prop.text({ label: "Emergency number", required: true, pattern: "^[0-9]{3}$", guidance: "999, 112, 911: the country's own" }),
  rota: prop.object(Object.fromEntries(WEEKDAYS.map((d) => [d, day(d)])) as Record<(typeof WEEKDAYS)[number], ReturnType<typeof day>>, {
    label: "Who's with them each day",
    required: true,
    guidance: "One name a day; 'Carer' or 'Day centre' where it's not family",
  }),
  appointments: prop.list(appointment, { label: "Appointments", max: 4 }),
};
