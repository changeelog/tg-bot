import fs from 'fs'
import { NewsItem } from './newsFeedFetcher'
import { STORAGE_FILE } from './config'

export function loadStoredNews(): NewsItem[] {
  if (fs.existsSync(STORAGE_FILE)) {
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8')
    return JSON.parse(data)
  }
  return []
}

export function saveStoredNews(news: NewsItem[]): void {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(news, null, 2))
}
