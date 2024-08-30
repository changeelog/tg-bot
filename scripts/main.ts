import dotenv from 'dotenv'
import { initializeBot, checkAndSendNews } from './telegramBot'
import { logger } from './logger'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

async function main() {
  initializeBot()

  // Run the news check
  await checkAndSendNews()

  process.on('SIGINT', () => {
    logger.info('Bot is shutting down')
    process.exit(0)
  })
}

main().catch((error) => {
  logger.error('Error in main:', error)
})
