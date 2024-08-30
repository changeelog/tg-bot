import fs from 'fs'
import { NewsItem } from './newsFeedFetcher'
import { STORAGE_FILE } from './config'
import path from 'path'
import { logger } from './logger'

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

export async function cleanupOldFiles(): Promise<void> {
  const storageDir = path.dirname(STORAGE_FILE)
  const files = await fs.promises.readdir(storageDir)
  const now = new Date()
  
  for (const file of files) {
    if (file.startsWith('news_storage') && file.endsWith('.json')) {
      const filePath = path.join(storageDir, file)
      const stats = await fs.promises.stat(filePath)
      const fileAge = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24) // age in days
      
      if (fileAge > 28) { 
        await fs.promises.unlink(filePath)
        logger.info(`Deleted old file: ${file}`)
      }
    }
  }
}