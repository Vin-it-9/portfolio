import type { APIRoute } from 'astro'
import { fetchBlogPosts } from '@lib/blog'
import { absoluteUrl, site } from '@data/site'

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const GET: APIRoute = async () => {
  const posts = await fetchBlogPosts()
  const feedUrl = absoluteUrl('/rss.xml')
  const lastBuildDate = new Date().toUTCString()

  const items = posts
    .map((post) => {
      const pubDate = new Date(post.publishedAt)
      const description = post.description ?? post.title
      const categories = post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>${categories ? `\n${categories}` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — Blog`)}</title>
    <link>${escapeXml(absoluteUrl('/blog'))}</link>
    <description>${escapeXml('Articles and notes by Vinit Shinde on Java, JVM, backend development, and software engineering.')}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
