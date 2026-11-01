export type BlogPlatform = 'devto' | 'medium' | 'hashnode' | 'linkedin'

export interface BlogPost {
  title: string
  description?: string
  url: string
  publishedAt: string
  platform: BlogPlatform
  tags: string[]
  image?: string
  readingTime?: number
  content?: string
}
