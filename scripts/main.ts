import { initializeBot, checkAndSendNews, cleanupOldNews } from './telegramBot'
import { logger } from './logger'

async function main() {
  try {
    logger.info('Starting news check')

    initializeBot()

    await checkAndSendNews()
    await cleanupOldNews()

    logger.info('News check completed')
  } catch (error) {
    logger.error('Error in main:', error)
  } finally {
    process.exit(0)
  }
}

main()
