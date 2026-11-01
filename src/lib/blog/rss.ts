import sanitizeHtml from 'sanitize-html'
import type { BlogPlatform, BlogPost } from './types'

const MAX_DESCRIPTION_LENGTH = 200

const getTagValue = (item: string, tag: string): string | undefined => {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'))
  return match?.[1]?.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1').trim() || undefined
}

const getTagValues = (item: string, tag: string): string[] => {
  const values = [...item.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'gi'))]
  return values
    .map((match) => match[1]?.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1').trim())
    .filter((value): value is string => Boolean(value))
}

const getAttribute = (value: string, attribute: string): string | undefined =>
  value.match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'))?.[1]

const decodeXml = (value: string): string =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))

export const getImage = (item: string, content?: string): string | undefined => {
  const mediaMatch = item.match(/<media:content\b[^>]*>/i)
  const mediaImage = mediaMatch ? getAttribute(mediaMatch[0], 'url') : undefined
  const decodedContent = content ? decodeXml(content) : undefined
  const contentImage = decodedContent?.match(/<img\b[^>]*src=["']([^"']+)["']/i)?.[1]
  return mediaImage || contentImage
}

const truncate = (value: string): string => {
  if (value.length <= MAX_DESCRIPTION_LENGTH) return value

  const slice = value.slice(0, MAX_DESCRIPTION_LENGTH)
  const lastSpace = slice.lastIndexOf(' ')
  return `${(lastSpace > MAX_DESCRIPTION_LENGTH / 2 ? slice.slice(0, lastSpace) : slice).trimEnd()}.`
}

export const getDescription = (content?: string): string | undefined => {
  if (!content) return undefined

  const description = sanitizeHtml(decodeXml(content), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim()

  return description ? truncate(description) : undefined
}

/**
 * Parses a standard RSS 2.0 feed into the unified blog post shape.
 * Used by DEV.to and Medium, both of which expose RSS feeds.
 */
export const parseRssFeed = (xml: string, platform: BlogPlatform): BlogPost[] => {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1])

  return items.flatMap((item): BlogPost[] => {
    const title = getTagValue(item, 'title')
    const url = getTagValue(item, 'link')
    const publishedAt = getTagValue(item, 'pubDate')
    const content = getTagValue(item, 'content:encoded') || getTagValue(item, 'description')

    if (!title || !url || !publishedAt) return []

    const parsedDate = new Date(publishedAt)
    if (Number.isNaN(parsedDate.getTime())) return []

    return [
      {
        title: decodeXml(title),
        description: getDescription(content),
        url: decodeXml(url),
        publishedAt: parsedDate.toISOString(),
        platform,
        tags: getTagValues(item, 'category').map(decodeXml),
        image: getImage(item, content),
        content: content ? decodeXml(content) : undefined,
      },
    ]
  })
}
