import { fetchDevToPosts } from './devto'
import { fetchHashnodePosts } from './hashnode'
import { fetchLinkedInPosts } from './linkedin'
import { fetchMediumPosts } from './medium'
import type { BlogPost } from './types'
import { slugify } from '@utils/slugify'

const normalizeUrl = (url: string): string => url.replace(/\/+$/, '').toLowerCase()

export const getBlogPostSlug = (post: BlogPost): string => slugify(`${post.title}-${post.platform}`)

let blogPostsPromise: Promise<BlogPost[]> | undefined

async function loadBlogPosts(): Promise<BlogPost[]> {
  const results = await Promise.allSettled([
    fetchDevToPosts(),
    fetchMediumPosts(),
    fetchHashnodePosts(),
    fetchLinkedInPosts(),
  ])
  const posts: BlogPost[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      posts.push(...result.value)
    } else {
      console.warn('Failed to fetch a blog source:', result.reason)
    }
  }

  const uniquePosts = new Map<string, BlogPost>()
  for (const post of posts) {
    if (!post.title || !post.url || !post.publishedAt || Number.isNaN(Date.parse(post.publishedAt))) {
      continue
    }
    uniquePosts.set(normalizeUrl(post.url), post)
  }

  return [...uniquePosts.values()].sort(
    (first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt),
  )
}

/**
 * Fetches all blog posts once per build.
 *
 * Every page that renders blog data (blog index, post pages, launcher, ...)
 * calls this function. Memoizing the promise keeps a single request per
 * source instead of one request per page.
 */
export function fetchBlogPosts(): Promise<BlogPost[]> {
  blogPostsPromise ??= loadBlogPosts().catch((error) => {
    // Allow a later call to retry if the whole pipeline fails unexpectedly.
    blogPostsPromise = undefined
    throw error
  })

  return blogPostsPromise
}
