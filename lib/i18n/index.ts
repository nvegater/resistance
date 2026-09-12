// Every text the app shows lives in de.json and en.json. Both files have exactly the
// same keys, so swapping LANGUAGE below swaps the whole app from German to English.
//
// This is not a multilingual feature: the app runs in one language at a time, chosen
// here at build time. There is no locale in the URL, no switch in the interface and no
// per-user setting. The two JSON files exist so that a real translation layer can be
// added later without going through every component again.

import de from "./de.json";
import en from "./en.json";

/** The shape both files share. de.json is the original, so it defines the keys. */
export type Texts = typeof de;

export type Language = "de" | "en";

/** Change this one line to run the whole app in the other language. */
export const LANGUAGE: Language = "en";

/** Typed against de.json, so a key missing from en.json is a compile error. */
const english: Texts = en;

const TEXTS: Record<Language, Texts> = { de, en: english };

export const t: Texts = TEXTS[LANGUAGE];

/** For Intl: number and date formatting follow the chosen language. */
export const LOCALE = t.locale;

/** The value of the lang attribute on <html>. */
export const HTML_LANG = t.language;

/** Puts values into a text that carries {name} placeholders. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
}
