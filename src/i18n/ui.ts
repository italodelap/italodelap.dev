export type Locale = "en" | "es";

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
    "switch.label": "Español",
    "switch.href": "/cv",
    "switch.hreflang": "es",
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
    "switch.label": "English",
    "switch.href": "/resume",
    "switch.hreflang": "en",
  },
} as const;

export type UIKey = keyof (typeof ui)["en"];

export function useTranslations(lang: Locale) {
  return function t(key: UIKey): string {
    return ui[lang][key];
  };
}
