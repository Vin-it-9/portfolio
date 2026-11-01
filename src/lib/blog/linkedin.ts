import type { BlogPost } from './types'

export async function fetchLinkedInPosts(): Promise<BlogPost[]> {
  // LinkedIn does not provide a reliable public API for articles.
  // Scraping the profile HTML is blocked by anti-bot measures (HTTP 999).
  // Safest fallback is to return an empty list rather than pretending it works.
  return []
}
