import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

export const BOT_TOKEN = process.env.BOT_TOKEN
export const CHANNEL_ID = process.env.CHANNEL_ID
export const STORAGE_FILE = 'news_storage.json'
export const MAX_RETRIES = 3
export const RETRY_DELAY = 5000
