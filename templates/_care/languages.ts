/**
 * The languages a parent can read their chart and card in. Every word a Kin template prints by itself (the headings,
 * the times of day, "with food") is here, in each language, so a family only ever types what's theirs: a medicine's
 * name and what it's for. English is always printed beside it, for the carers, the GP and a paramedic.
 *
 * Translations were written for this kit; have a native speaker read them before you print for your own family.
 */
import { CDN } from "../_brands/kin";

export type LanguageCode = "en" | "hi" | "ar" | "es";
export const LANGUAGES = ["en", "hi", "ar", "es"] as const;

export type Slot = "morning" | "midday" | "evening" | "bedtime";
export const SLOTS = ["morning", "midday", "evening", "bedtime"] as const;
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Food = "with" | "before" | "any";
export type Form = "tablet" | "capsule" | "liquid" | "drops" | "inhaler" | "injection" | "patch";

type Labels = {
  medicines: string;
  slot: Record<Slot, string>;
  day: Record<Weekday, string>;
  food: Record<Food, string>;
  /** "1 tablet", "2 puffs": a dose of a form, counted. */
  dose: (n: number, form: Form) => string;
  allergies: string;
  noAllergies: string;
  conditions: string;
  emergency: string;
  doctor: string;
  pharmacy: string;
  updated: string;
  dontStop: string;
  tick: string;
  newMed: string;
  changed: string;
  withYou: string;
  speaks: string;
  bloodType: string;
  card: string;
  mine: string;
  showThis: string;
  /** "Since 16 Nov", from a date already written for the language. */
  since: (date: string) => string;
  age: (years: number) => string;
  born: string;
  cut: string;
};

export type Language = {
  code: LanguageCode;
  /** The language's name in itself: हिन्दी. */
  own: string;
  /** Its name in English, for a card a stranger reads. */
  english: string;
  dir: "ltr" | "rtl";
  /** For Intl: dates and numbers. Arabic keeps Western digits, as most printed prescriptions in the Gulf do. */
  locale: string;
  /** Its font, before the brand's: a family with its script, or the brand's own for a Latin script. */
  font?: { family: string; files: { weight: 400 | 700; file: string }[] };
  /** Whether the Canvas renderer lays out this script's runs in order. Satori doesn't reorder right-to-left words. */
  canvas: boolean;
  t: Labels;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const en: Language = {
  code: "en",
  own: "English",
  english: "English",
  dir: "ltr",
  locale: "en-GB",
  canvas: true,
  t: {
    medicines: "Medicines",
    slot: { morning: "Morning", midday: "Midday", evening: "Evening", bedtime: "Bedtime" },
    day: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
    food: { with: "With food", before: "Before food", any: "With or without food" },
    dose: (n, form) =>
      ({
        tablet: plural(n, "tablet", "tablets"),
        capsule: plural(n, "capsule", "capsules"),
        liquid: `${n} ml`,
        drops: plural(n, "drop", "drops"),
        inhaler: plural(n, "puff", "puffs"),
        injection: `${n} units`,
        patch: plural(n, "patch", "patches"),
      })[form],
    allergies: "Allergies",
    noAllergies: "No known allergies",
    conditions: "Conditions",
    emergency: "Emergency",
    doctor: "Doctor",
    pharmacy: "Pharmacy",
    updated: "Updated",
    dontStop: "Don't stop or change any medicine without asking the doctor.",
    tick: "Tick each one when it's taken",
    newMed: "New",
    changed: "Changed",
    withYou: "With you today",
    speaks: "Speaks",
    bloodType: "Blood type",
    card: "Emergency card",
    mine: "My medicines",
    showThis: "Show this card to a doctor or a paramedic",
    since: (d) => `Since ${d}`,
    age: (n) => `${n} years old`,
    born: "Born",
    cut: "Cut along the dashed line, fold in half, and keep it in a wallet or a purse.",
  },
};

const hi: Language = {
  code: "hi",
  own: "हिन्दी",
  english: "Hindi",
  dir: "ltr",
  locale: "hi-IN",
  canvas: true,
  font: {
    family: "Noto Sans Devanagari",
    files: [
      { weight: 400, file: "NotoSansDevanagari-Regular.ttf" },
      { weight: 700, file: "NotoSansDevanagari-Bold.ttf" },
    ],
  },
  t: {
    medicines: "दवाइयाँ",
    slot: { morning: "सुबह", midday: "दोपहर", evening: "शाम", bedtime: "सोने से पहले" },
    day: { mon: "सोम", tue: "मंगल", wed: "बुध", thu: "गुरु", fri: "शुक्र", sat: "शनि", sun: "रवि" },
    food: { with: "खाने के साथ", before: "खाली पेट", any: "कभी भी" },
    dose: (n, form) =>
      ({
        tablet: `${n} गोली`,
        capsule: `${n} कैप्सूल`,
        liquid: `${n} मि.ली.`,
        drops: `${n} बूँद`,
        inhaler: `${n} पफ़`,
        injection: `${n} यूनिट`,
        patch: `${n} पैच`,
      })[form],
    allergies: "एलर्जी",
    noAllergies: "कोई ज्ञात एलर्जी नहीं",
    conditions: "बीमारियाँ",
    emergency: "आपातकाल",
    doctor: "डॉक्टर",
    pharmacy: "दवा की दुकान",
    updated: "अद्यतन",
    dontStop: "डॉक्टर से पूछे बिना कोई दवा बंद न करें, न बदलें।",
    tick: "दवा लेने पर निशान लगाएँ",
    newMed: "नई",
    changed: "बदली",
    withYou: "आज आपके साथ",
    speaks: "भाषा",
    bloodType: "रक्त समूह",
    card: "आपातकालीन कार्ड",
    mine: "मेरी दवाइयाँ",
    showThis: "यह कार्ड डॉक्टर को दिखाएँ",
    since: (d) => `${d} से`,
    age: (n) => `${n} वर्ष`,
    born: "जन्म",
    cut: "बिंदु वाली रेखा पर काटें, बीच से मोड़ें, और बटुए में रखें।",
  },
};

const ar: Language = {
  code: "ar",
  own: "العربية",
  english: "Arabic",
  dir: "rtl",
  locale: "ar-u-nu-latn",
  canvas: false,
  font: {
    family: "Noto Sans Arabic",
    files: [
      { weight: 400, file: "NotoSansArabic-Regular.ttf" },
      { weight: 700, file: "NotoSansArabic-Bold.ttf" },
    ],
  },
  t: {
    medicines: "الأدوية",
    slot: { morning: "الصباح", midday: "الظهر", evening: "المساء", bedtime: "قبل النوم" },
    day: { mon: "الإثنين", tue: "الثلاثاء", wed: "الأربعاء", thu: "الخميس", fri: "الجمعة", sat: "السبت", sun: "الأحد" },
    food: { with: "مع الطعام", before: "قبل الطعام", any: "في أي وقت" },
    dose: (n, form) =>
      ({
        tablet: n === 1 ? "حبة واحدة" : n === 2 ? "حبتان" : `${n} حبات`,
        capsule: n === 1 ? "كبسولة واحدة" : `${n} كبسولات`,
        liquid: `${n} مل`,
        drops: n === 1 ? "قطرة واحدة" : `${n} قطرات`,
        inhaler: n === 1 ? "بخة واحدة" : n === 2 ? "بختان" : `${n} بخات`,
        injection: `${n} وحدة`,
        patch: n === 1 ? "لصقة واحدة" : `${n} لصقات`,
      })[form],
    allergies: "الحساسية",
    noAllergies: "لا توجد حساسية معروفة",
    conditions: "الحالات الصحية",
    emergency: "الطوارئ",
    doctor: "الطبيب",
    pharmacy: "الصيدلية",
    updated: "آخر تحديث",
    dontStop: "لا توقف أي دواء ولا تغيّره دون سؤال الطبيب.",
    tick: "ضع علامة عند تناول كل دواء",
    newMed: "جديد",
    changed: "تغيّر",
    withYou: "معك اليوم",
    speaks: "اللغة",
    bloodType: "فصيلة الدم",
    card: "بطاقة الطوارئ",
    mine: "أدويتي",
    showThis: "أظهر هذه البطاقة للطبيب أو المسعف",
    since: (d) => `منذ ${d}`,
    age: (n) => `${n} سنة`,
    born: "تاريخ الميلاد",
    cut: "قُصّ على الخط المنقط، واطوِ البطاقة من المنتصف، واحفظها في المحفظة.",
  },
};

const es: Language = {
  code: "es",
  own: "Español",
  english: "Spanish",
  dir: "ltr",
  locale: "es-ES",
  canvas: true,
  t: {
    medicines: "Medicinas",
    slot: { morning: "Mañana", midday: "Mediodía", evening: "Tarde", bedtime: "Al acostarse" },
    day: { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom" },
    food: { with: "Con comida", before: "En ayunas", any: "Con o sin comida" },
    dose: (n, form) =>
      ({
        tablet: plural(n, "pastilla", "pastillas"),
        capsule: plural(n, "cápsula", "cápsulas"),
        liquid: `${n} ml`,
        drops: plural(n, "gota", "gotas"),
        inhaler: plural(n, "inhalación", "inhalaciones"),
        injection: `${n} unidades`,
        patch: plural(n, "parche", "parches"),
      })[form],
    allergies: "Alergias",
    noAllergies: "Sin alergias conocidas",
    conditions: "Condiciones",
    emergency: "Emergencia",
    doctor: "Médico",
    pharmacy: "Farmacia",
    updated: "Actualizado",
    dontStop: "No deje ni cambie ninguna medicina sin preguntar al médico.",
    tick: "Marque cada una al tomarla",
    newMed: "Nueva",
    changed: "Cambió",
    withYou: "Hoy contigo",
    speaks: "Idioma",
    bloodType: "Grupo sanguíneo",
    card: "Tarjeta de emergencia",
    mine: "Mis medicinas",
    showThis: "Muestre esta tarjeta a un médico o paramédico",
    since: (d) => `Desde el ${d}`,
    age: (n) => `${n} años`,
    born: "Nacimiento",
    cut: "Recorte por la línea de puntos, doble por la mitad y guárdela en la cartera.",
  },
};

export const LANGUAGE: Record<LanguageCode, Language> = { en, hi, ar, es };

/** The font stack for text in a language: its script's family first, then the brand's. */
export const stackFor = (lang: Language, brandStack: string) => (lang.font ? `'${lang.font.family}', ${brandStack}` : brandStack);

/** A language's font files, as a root's `fonts` takes them: hosted beside the kit. */
export const fontFacesFor = (lang: Language) =>
  (lang.font?.files ?? []).map((f) => ({ family: lang.font!.family, src: `${CDN}/assets/fonts/${f.file}`, weight: f.weight, style: "normal" as const }));
