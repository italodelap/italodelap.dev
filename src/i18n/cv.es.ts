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
    "Soy Ingeniero de Software con más de [years] años de experiencia, especializado en React, TypeScript y Web Components. Nunca dejo de aprender y de compartir lo que sé. Me apasiona la tecnología y siempre estoy en busca de nuevos desafíos.",

  location: { city: "Buenos Aires", country: "Argentina" },

  // Same order as basics.languages in site.json (zipped by index).
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
      notes: "1.º a 2.º año",
    },
    {
      area: "Ingeniería de Software",
      institution: "Universidad de Morón",
      notes: "1.º a 3.º año",
    },
  ],

  experience: {
    "argentina": {
      company: "Gobierno de la Nación Argentina",
      highlights: [
        "Desarrollé proyectos sobre el stack LAMP y proyectos JavaScript con Node y React",
        "Construí aplicaciones móviles con React Native y Expo",
      ],
    },
    "di-tella": {
      company: "Universidad Torcuato Di Tella",
      highlights: [
        "Entregué proyectos de Web Components construidos con Lit dentro de una arquitectura de microfrontends, priorizando los estándares de la plataforma y la estabilidad a largo plazo",
        "Publiqué proyectos web con otros stacks, incluido React, en paralelo al trabajo principal con Web Components",
      ],
    },
    "mercado-libre": {
      company: "Mercado Libre",
      highlights: [
        "Construí frontends de producto con React y TypeScript sobre los frameworks internos y el design system de la empresa",
        "Como parte de un equipo de SRE transversal a toda la empresa, construí herramientas internas para monitorear, visibilizar y mejorar el cumplimiento de las métricas centrales y los estándares técnicos exigidos en toda la organización",
        "Construí herramientas y aplicaciones internas de administración dentro de una arquitectura de microfrontends, integrándolas con sus respectivos BFF",
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
          "Construí y mantuve una aplicación móvil con Ionic",
        ],
        "Full Stack Developer": [
          "Diseñé, desarrollé y documenté una aplicación Symfony, incluida la gestión de su base de datos MySQL",
          "Reconocido como fortaleza de la gestión durante la acreditación ISO-IRAM 17025/2017 de 2019",
        ],
      },
    },
  } satisfies Record<WorkExperienceId, ExperienceOverride>,
} as const;
