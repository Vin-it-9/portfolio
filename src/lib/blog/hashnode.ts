import type { BlogPost } from './types'

export async function fetchHashnodePosts(): Promise<BlogPost[]> {
  // Hashnode's public GraphQL API is no longer available for free, and the
  // profile RSS feed returns 404. Returning an empty list keeps the unified
  // feed working without a guaranteed failed request on every build.
  return []
}
