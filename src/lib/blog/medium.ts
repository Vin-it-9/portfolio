import sanitizeHtml from 'sanitize-html'
import { blogSources } from '@data/blog/config'
import type { BlogPost } from './types'

const MAX_DESCRIPTION_LENGTH = 200
const MEDIUM_FEED_URL = `https://medium.com/feed/@${blogSources.medium.username}`

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

const getImage = (item: string, content?: string): string | undefined => {
  const mediaMatch = item.match(/<media:content\b[^>]*>/i)
  const mediaImage = mediaMatch ? getAttribute(mediaMatch[0], 'url') : undefined
  const contentImage = content?.match(/<img\b[^>]*src=["']([^"']+)["']/i)?.[1]
  return mediaImage || contentImage
}

const truncate = (value: string): string => {
  if (value.length <= MAX_DESCRIPTION_LENGTH) return value

  const slice = value.slice(0, MAX_DESCRIPTION_LENGTH)
  const lastSpace = slice.lastIndexOf(' ')
  return `${(lastSpace > MAX_DESCRIPTION_LENGTH / 2 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`
}

const getDescription = (content?: string): string | undefined => {
  if (!content) return undefined

  const description = sanitizeHtml(decodeXml(content), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim()

  return description ? truncate(description) : undefined
}

const parseFeed = (xml: string): BlogPost[] => {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1])

  return items.flatMap((item): BlogPost[] => {
    const title = getTagValue(item, 'title')
    const url = getTagValue(item, 'link')
    const publishedAt = getTagValue(item, 'pubDate')
    const content = getTagValue(item, 'content:encoded') || getTagValue(item, 'description')

    if (!title || !url || !publishedAt) return []

    return [
      {
        title: decodeXml(title),
        description: getDescription(content),
        url: decodeXml(url),
        publishedAt,
        platform: 'medium',
        tags: getTagValues(item, 'category').map(decodeXml),
        image: getImage(item, content),
        content: content ? decodeXml(content) : undefined,
      },
    ]
  })
}

interface Rss2JsonItem {
  title?: string
  link?: string
  pubDate?: string
  content?: string
  description?: string
  thumbnail?: string
  categories?: string[]
}

interface Rss2JsonResponse {
  status?: string
  items?: Rss2JsonItem[]
}

const parseFallback = (items: Rss2JsonItem[]): BlogPost[] =>
  items.flatMap((item): BlogPost[] => {
    const publishedAt = item.pubDate ? new Date(item.pubDate) : undefined
    const content = item.content || item.description

    if (!item.title || !item.link || !publishedAt || Number.isNaN(publishedAt.getTime())) return []

    return [
      {
        title: item.title,
        description: getDescription(content),
        url: item.link,
        publishedAt: publishedAt.toISOString(),
        platform: 'medium',
        tags: item.categories ?? [],
        image: item.thumbnail || getImage('', content),
        content,
      },
    ]
  })

const fetchFallback = async (): Promise<BlogPost[]> => {
  const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}`
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) })

  if (!response.ok) {
    throw new Error(`Medium fallback returned ${response.status}`)
  }

  const payload = (await response.json()) as Rss2JsonResponse
  if (payload.status !== 'ok' || !Array.isArray(payload.items)) {
    throw new Error('Medium fallback returned an unexpected response')
  }

  return parseFallback(payload.items)
}

export async function fetchMediumPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(MEDIUM_FEED_URL, { signal: AbortSignal.timeout(10_000) })

    if (!response.ok) {
      throw new Error(`Medium returned ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('xml')) {
      throw new Error(`Medium returned non-XML response: ${contentType}`)
    }

    return parseFeed(await response.text())
  } catch (error) {
    // Medium rate-limits repeated requests (HTTP 429). Fall back to a public
    // RSS-to-JSON service so a build does not silently drop every blog post.
    console.warn('Medium feed unavailable; using the RSS fallback:', error instanceof Error ? error.message : error)
    return fetchFallback()
  }
}
