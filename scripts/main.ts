import dotenv from 'dotenv'
import { initializeBot, checkAndSendNews } from './telegramBot'
import { logger } from './logger'
import path from 'path'
import { cleanupOldFiles } from './storage'

dotenv.config({ path: path.resolve(__dirname, '.env') })

async function main() {
  try {
    logger.info('Starting news check')

    initializeBot()

    await checkAndSendNews()
    await cleanupOldFiles()

    logger.info('News check completed')
  } catch (error) {
    logger.error('Error in main:', error)
  } finally {
    process.exit(0)
  }
}

main()
