export type Locale = "en" | "es";

// This file is per-language copy only. The `/resume` ↔ `/cv` routing itself
// (paths, hreflang, the language-switch label) lives in `./routes.ts` — put
// new locale/route data there, not here.
export const ui = {
  en: {
    "section.summary": "Summary",
    "section.experience": "Experience",
    "section.education": "Education",
    "section.languages": "Languages",
    "date.present": "Present",
    "page.title": "Italo De la Peña | Resume",
    "page.description":
      "Italo De la Peña's resume — Software Engineer specialized in frontend, building for the web with React, TypeScript and modern tooling.",
    "print.label": "Print CV",
  },
  es: {
    "section.summary": "Perfil",
    "section.experience": "Experiencia",
    "section.education": "Educación",
    "section.languages": "Idiomas",
    "date.present": "Actualidad",
    "page.title": "Italo De la Peña | CV",
    "page.description":
      "El CV de Italo De la Peña — Software Engineer especializado en frontend, con experiencia full-stack en el ecosistema React y TypeScript.",
    "print.label": "Imprimir CV",
  },
} as const;

export type UIKey = keyof (typeof ui)["en"];

export function useTranslations(lang: Locale) {
  return function t(key: UIKey): string {
    return ui[lang][key];
  };
}
