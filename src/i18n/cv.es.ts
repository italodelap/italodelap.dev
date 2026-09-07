// Hand-maintained: keep in sync with src/content/work-experience/*.md filenames.
// Adding a job? Add its id here AND its entry in `experience` below.
type WorkExperienceId =
  | "argentina"
  | "buenos-aires"
  | "di-tella"
  | "mercado-libre"
  | "tupaca";

export interface ExperienceOverride {
  /** Spanish company name shown on the CV. */
  company: string;
  /** Spanish highlights for a top-level entry (no curated subitems). */
  highlights?: string[];
  /** Spanish highlights per subitem, keyed by the English `position` string. */
  subitems?: Record<string, string[]>;
}

export const cvEs = {
  // Job titles stay in English (spec decision 4).
  label: "Software Engineer",

  // Keep the literal [years] token — substituted at build time.
  about:
    "Ingeniero de Software con más de [years] años de experiencia, especializado en React, TypeScript y Web Components. Me encanta nunca parar de aprender y compartir mi conocimiento. Me apasiona la tecnología y siempre estoy en búsqueda de nuevos desafíos.",

  location: { city: "Buenos Aires", country: "Argentina" },

  // Fully translated; only the entry count must match basics.languages in site.json.
  languages: [
    { language: "Inglés", level: "Intermedio" },
    { language: "Portugués", level: "Básico" },
    { language: "Español", level: "Nativo" },
  ],

  // Same order as `education` in site.json (zipped by index).
  // Literal translations of the English source — confirm official
  // degree/institution names during PR review.
  education: [
    {
      area: "Tecnicatura Superior en Diseño Gráfico y Multimedial",
      institution: "Instituto de Educación Técnica Superior N.º 27",
      notes: "1º a 2º año",
    },
    {
      area: "Ingeniería en Informática",
      institution: "Universidad de Morón",
      notes: "1º a 3º año",
    },
  ],

  experience: {
    "argentina": {
      company: "Gobierno de la Nación Argentina",
      highlights: [
        "Desarrollo de proyectos con el stack LAMP y proyectos JavaScript con Node y React",
        "Desarrollo de aplicaciones móviles con React Native y Expo",
      ],
    },
    "di-tella": {
      company: "Universidad Torcuato Di Tella",
      highlights: [
        "Desarrollo de proyectos con Web Components (construidos con Lit) dentro de una arquitectura de microfrontends, priorizando los estándares de la plataforma y la estabilidad a largo plazo",
        "Desarrollo y publicación de proyectos web hechos con React",
      ],
    },
    "mercado-libre": {
      company: "Mercado Libre",
      highlights: [
        "Desarrollo de frontends con React y TypeScript sobre los frameworks internos y el design system de la empresa",
        "Como parte de un equipo de SRE transversal a toda la empresa, participé en el desarrollo de herramientas internas para monitorear, visibilizar y mejorar el cumplimiento de métricas core y estándares técnicos exigidos en toda la compañía",
        "Desarrollo de admins internos y aplicaciones dentro de una arquitectura de microfrontends, integrándolas con sus respectivos BFFs",
      ],
    },
    "tupaca": {
      company: "Tupaca",
      highlights: [
        "Desarrollé, mantuve y migré aplicaciones del stack LAMP con Symfony y Laravel",
        "Desarrollé y mantuve varios proyectos construidos con el stack MERN",
      ],
    },
    "buenos-aires": {
      company: "Gobierno de la Ciudad de Buenos Aires",
      subitems: {
        // keyed by the English `position` string (unique within the job)
        "Frontend Developer": [
          "Análisis funcional, desarrollo y mantenimiento de aplicaciones Symfony",
          "Desarrollo y mantenimiento de una aplicación móvil hecha con Ionic",
        ],
        "Full Stack Developer": [
          "Diseñé, desarrollé y documenté una aplicación Symfony, incluida la gestión de su base de datos MySQL",
          "Reconocido como fortaleza de la gestión durante la acreditación ISO-IRAM 17025/2017 de 2019",
        ],
      },
    },
  } satisfies Record<WorkExperienceId, ExperienceOverride>,
} as const;
