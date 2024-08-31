import TelegramBot from 'node-telegram-bot-api'
import { NewsFeedFetcher, NewsItem } from './newsFeedFetcher'
import {
  BOT_TOKEN,
  CHANNEL_ID,
  MAX_RETRIES,
  RETRY_DELAY,
  STORAGE_FILE,
} from './config'
import { logger } from './logger'
import { retryOperation } from './newsUtils'
import { DbStorage } from './dbStorage'

let bot: TelegramBot
const dbStorage = new DbStorage(STORAGE_FILE)

export function initializeBot() {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    logger.error('BOT_TOKEN or CHANNEL_ID is not set in .env file')
    process.exit(1)
  }
  bot = new TelegramBot(BOT_TOKEN)
  logger.info(
    `Bot initialized. Stored news count: ${dbStorage.getAll().length}`,
  )
}

async function getLatestNews(): Promise<NewsItem[]> {
  const fetcher = new NewsFeedFetcher(logger)
  try {
    await fetcher.initialize()
    const newsItems = await retryOperation(
      () => fetcher.getContent(1),
      MAX_RETRIES,
      RETRY_DELAY,
    )
    await fetcher.close()
    return newsItems
  } catch (error) {
    logger.error('Error fetching news:', error)
    return []
  }
}

async function sendNewsItem(item: NewsItem): Promise<void> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    logger.error('BOT_TOKEN or CHANNEL_ID is not set in .env file')
    return
  }

  const message = `${item.date} ${item.time}: ${item.title}\n${item.link}`
  try {
    await retryOperation(
      () => bot.sendMessage(CHANNEL_ID, message),
      MAX_RETRIES,
      RETRY_DELAY,
    )
    logger.info(`Sent message: ${message}`)

    dbStorage.set(item)
  } catch (error) {
    logger.error(`Could not send a message to telegram: ${error.message}`)
  }
}

export async function checkAndSendNews() {
  logger.info('Starting news check')

  const storedNews = dbStorage.getAll()
  const latestNews = await getLatestNews()
  const newItems = latestNews.filter((item) => !dbStorage.has(item.link))

  if (newItems.length > 0) {
    for (const item of newItems) {
      await sendNewsItem(item)
    }

    logger.info(`Sent ${newItems.length} new item(s)`)
    logger.info(`Total stored news items: ${dbStorage.getAll().length}`)
  } else {
    logger.info('No new items to send.')
  }

  logger.info('Finished news check')
}

export async function cleanupOldNews(): Promise<void> {
  dbStorage.cleanupOldItems()
  logger.info('Cleaned up old news items')
}
