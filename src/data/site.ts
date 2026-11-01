/**
 * Central site metadata used for SEO, structured data, and feeds.
 *
 * Keep the canonical URL here so a future domain change only needs to be made
 * in one place (plus `astro.config.mjs`, which Astro requires for the sitemap).
 */
export const site = {
  url: 'https://vinitshinde.netlify.app',
  name: 'Vinit Shinde',
  jobTitle: 'Java & JVM Developer',
  description:
    'Vinit Shinde is a Java and JVM developer building reliable backend systems, REST APIs, and practical software projects. Explore his projects, technical skills, and resume.',
  shortDescription:
    'Java and JVM developer building reliable backend systems, REST APIs, and practical software projects.',
  email: 'vineetshinde2559@gmail.com',
  ogImage: '/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  sameAs: [
    'https://github.com/Vin-it-9/',
    'https://www.linkedin.com/in/vinit-shinde-920531254/',
    'https://medium.com/@vineetshinde2559',
    'https://dev.to/vinitshinde__',
  ],
  knowsAbout: [
    'Java',
    'JVM',
    'Spring Boot',
    'Quarkus',
    'Micronaut',
    'Helidon',
    'GraalVM',
    'Preonus',
    'REST APIs',
    'Microservices',
    'Hibernate',
    'JPA',
    'SQL',
    'MySQL',
    'PostgreSQL',
    'Maven',
  ],
} as const

export const absoluteUrl = (path = '/'): string => new URL(path, `${site.url}/`).href
