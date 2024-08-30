import { NewsItem } from './newsFeedFetcher'

export function removeOldNews(news: NewsItem[]): NewsItem[] {
  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  return news.filter(
    (item) => new Date(`${item.date} ${item.time}`) > fourWeeksAgo,
  )
}

export function sortNewsByDate(news: NewsItem[]): NewsItem[] {
  return news.sort(
    (a, b) =>
      new Date(`${b.date} ${b.time}`).getTime() -
      new Date(`${a.date} ${a.time}`).getTime(),
  )
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delay: number,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries reached')
}