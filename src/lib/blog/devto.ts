import { blogSources } from '@data/blog/config'
import { parseRssFeed } from './rss'
import type { BlogPost } from './types'

interface DevToArticle {
  title?: string
  description?: string
  url?: string
  published_at?: string
  tag_list?: string[]
  cover_image?: string | null
  reading_time_minutes?: number
  body_html?: string
}

const DEVTO_FEED_URL = `https://dev.to/feed/${blogSources.devto.username}`
const DEVTO_API_URL = `https://dev.to/api/articles?username=${encodeURIComponent(blogSources.devto.username)}&per_page=100`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isDevToArticle = (value: unknown): value is DevToArticle => {
  if (!isRecord(value)) return false

  return (
    typeof value.title === 'string' &&
    typeof value.url === 'string' &&
    typeof value.published_at === 'string'
  )
}

/**
 * DEV.to's API can lag behind a newly published article, while the profile RSS
 * feed updates immediately. The RSS feed is therefore the primary source.
 */
const fetchDevToRss = async (): Promise<BlogPost[]> => {
  const response = await fetch(DEVTO_FEED_URL, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`DEV.to RSS returned ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('xml')) {
    throw new Error(`DEV.to RSS returned non-XML response: ${contentType}`)
  }

  return parseRssFeed(await response.text(), 'devto')
}

const fetchDevToApi = async (): Promise<BlogPost[]> => {
  const response = await fetch(DEVTO_API_URL, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`DEV.to API returned ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`DEV.to API returned non-JSON response: ${contentType}`)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) {
    throw new Error('DEV.to API returned an unexpected response')
  }

  return payload.filter(isDevToArticle).map((article) => ({
    title: article.title as string,
    description: article.description || undefined,
    url: article.url as string,
    publishedAt: article.published_at as string,
    platform: 'devto',
    tags: Array.isArray(article.tag_list) ? article.tag_list : [],
    image: article.cover_image || undefined,
    readingTime: article.reading_time_minutes || undefined,
    content: article.body_html || undefined,
  }))
}

export async function fetchDevToPosts(): Promise<BlogPost[]> {
  try {
    return await fetchDevToRss()
  } catch (error) {
    // The API is a useful fallback if DEV.to changes or temporarily blocks its
    // RSS endpoint. It also provides cover images and reading time.
    console.warn('DEV.to RSS unavailable; using the API:', error instanceof Error ? error.message : error)
    return fetchDevToApi()
  }
}
