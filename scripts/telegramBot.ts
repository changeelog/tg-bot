import TelegramBot from 'node-telegram-bot-api'
import { NewsFeedFetcher, NewsItem } from './newsFeedFetcher'
import { BOT_TOKEN, CHANNEL_ID, MAX_RETRIES, RETRY_DELAY } from './config'
import { logger } from './logger'
import { loadStoredNews, saveStoredNews } from './storage'
import { retryOperation, removeOldNews } from './newsUtils'

let bot: TelegramBot
let storedNews: NewsItem[]

export function initializeBot() {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    logger.error('BOT_TOKEN or CHANNEL_ID is not set in .env file')
    process.exit(1)
  }
  bot = new TelegramBot(BOT_TOKEN)
  storedNews = loadStoredNews()
  logger.info(`Bot initialized. Stored news count: ${storedNews.length}`)
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
  const message = `${item.date} ${item.time}: ${item.title}\n${item.link}`
  try {
    await retryOperation(
      () => bot.sendMessage(CHANNEL_ID, message),
      MAX_RETRIES,
      RETRY_DELAY,
    )
    logger.info(`Sent message: ${message}`)
  } catch (error) {
    logger.error(`Could not send a message to telegram: ${error.message}`)
  }
}

export async function checkAndSendNews() {
  logger.info('Starting news check')

  const latestNews = await getLatestNews()
  const newItems = latestNews.filter(
    (item) => !storedNews.some((stored) => stored.link === item.link),
  )

  if (newItems.length > 0) {
    for (const item of newItems) {
      await sendNewsItem(item)
      storedNews.push(item)
    }

    storedNews = removeOldNews(storedNews)

    saveStoredNews(storedNews)
    logger.info(`Sent ${newItems.length} new item(s)`)
    logger.info(`Total stored news items: ${storedNews.length}`)
  } else {
    logger.info('No new items to send.')
  }

  logger.info('Finished news check')
}
