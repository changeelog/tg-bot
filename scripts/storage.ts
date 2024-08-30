import fs from 'fs'
import { NewsItem } from './newsFeedFetcher'
import { STORAGE_FILE } from './config'

export function loadStoredNews(): Set<string> {
  if (fs.existsSync(STORAGE_FILE)) {
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8')
    const newsArray: NewsItem[] = JSON.parse(data)
    return new Set(newsArray.map((item) => item.link))
  }
  return new Set()
}

export function saveStoredNews(news: Set<string>): void {
  const newsArray = Array.from(news).map((link) => ({ link }))
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(newsArray, null, 2))
}
