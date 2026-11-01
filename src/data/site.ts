/**
 * Central site metadata used for SEO, structured data, and feeds.
 *
 * Keep the canonical URL here so a future domain change only needs to be made
 * in one place (plus `astro.config.mjs`, which Astro requires for the sitemap).
 */
export const site = {
  url: 'https://vinitshinde.netlify.app',
  name: 'Vinit Shinde',
  alternateName: 'Vineet Shinde',
  jobTitle: 'Java Developer',
  description:
    'Vinit Shinde is a Java developer specializing in performance-optimized backend systems, low-memory frameworks.',
  shortDescription:
    'Java developer specializing in performance-optimized backend systems, low-memory frameworks.',
  email: 'vineetshinde2559@gmail.com',
  ogImage: '/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  sameAs: [
    'https://github.com/Vin-it-9',
    'https://www.linkedin.com/in/vinit-shinde-920531254/',
    'https://medium.com/@vineetshinde2559',
    'https://dev.to/vinitshinde__',
  ],
  knowsAbout: [
    'Java Backend Engineering',
    'JVM Ecosystem Frameworks',
    'Micronaut',
    'Quarkus',
    'Spring Boot',
    'GraalVM Native Image',
    'Developer Tooling',
    'Preonus',
    'AGY CLI',
    'Build-Time Dependency Injection',
    'Ahead-Of-Time (AOT) Compilation',
    'REST APIs',
    'Microservices',
    'Hibernate',
    'Panache',
    'JPA',
    'SQL',
    'MySQL',
    'PostgreSQL',
    'Maven',
  ],
} as const

export const absoluteUrl = (path = '/'): string => new URL(path, `${site.url}/`).href
