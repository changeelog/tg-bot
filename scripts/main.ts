import dotenv from 'dotenv'
import { initializeBot, checkAndSendNews } from './telegramBot'
import { setupScheduler } from './scheduler'
import { logger } from './logger'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

async function main() {
  initializeBot()
  setupScheduler(checkAndSendNews)

  // Initial news check
  await checkAndSendNews()

  process.on('SIGINT', () => {
    logger.info('Bot is shutting down')
    process.exit(0)
  })
}

main().catch((error) => {
  logger.error('Error in main:', error)
})
