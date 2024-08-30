import cron from 'node-cron'
import { CHECK_INTERVAL } from './config'
import { logger } from './logger'

export function setupScheduler(checkAndSendNews: () => Promise<void>) {
  // Schedule the news check task
  cron.schedule(CHECK_INTERVAL, () => {
    checkAndSendNews().catch((error) => {
      logger.error('Error in scheduled news check task:', error)
    })
  })

  logger.info(`Bot scheduled to check news ${CHECK_INTERVAL}`)
}
