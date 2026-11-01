import { blogSources } from '@data/blog/config'
import { calculateReadingTime, getDescription, getImage, parseRssFeed } from './rss'
import type { BlogPost } from './types'

const MEDIUM_FEED_URL = `https://medium.com/feed/@${blogSources.medium.username}`

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
        readingTime: calculateReadingTime(content),
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
    const response = await fetch(MEDIUM_FEED_URL, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`Medium returned ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('xml')) {
      throw new Error(`Medium returned non-XML response: ${contentType}`)
    }

    return parseRssFeed(await response.text(), 'medium')
  } catch (error) {
    // Medium rate-limits repeated requests (HTTP 429). Fall back to a public
    // RSS-to-JSON service so a build does not silently drop every blog post.
    console.warn('Medium feed unavailable; using the RSS fallback:', error instanceof Error ? error.message : error)
    return fetchFallback()
  }
}
