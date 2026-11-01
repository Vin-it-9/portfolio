import { blogSources } from '@data/blog/config'
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

export async function fetchDevToPosts(): Promise<BlogPost[]> {
  const endpoint = `https://dev.to/api/articles?username=${encodeURIComponent(blogSources.devto.username)}&per_page=100`
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(10_000) })

  if (!response.ok) {
    throw new Error(`DEV.to returned ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`DEV.to returned non-JSON response: ${contentType}`)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) {
    throw new Error('DEV.to returned an unexpected response')
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
