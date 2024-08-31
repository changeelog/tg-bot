import fs from 'fs'
import { NewsItem } from './newsFeedFetcher'

export class DbStorage {
  private storage: { [key: string]: string }

  constructor(private readonly filename: string) {
    if (fs.existsSync(filename)) {
      const data = fs.readFileSync(filename, 'utf-8')
      this.storage = JSON.parse(data)
    } else {
      this.storage = {}
    }
  }

  public has(id: string): boolean {
    return this.storage[id] !== undefined
  }

  public set(item: NewsItem): void {
    this.storage[item.link] = new Date().toISOString()
    this.save()
  }

  public getAll(): NewsItem[] {
    return Object.keys(this.storage).map((link) => ({
      link,
      date: '',
      time: '',
      title: '',
      tags: [],
    }))
  }

  public cleanupOldItems(): void {
    const fourWeeksAgo = new Date(
      Date.now() - 4 * 7 * 24 * 60 * 60 * 1000,
    ).toISOString()

    Object.entries(this.storage).forEach(([key, value]) => {
      if (value < fourWeeksAgo) {
        delete this.storage[key]
      }
    })

    this.save()
  }

  private save(): void {
    const data = JSON.stringify(this.storage, null, 2)
    fs.writeFileSync(this.filename, data)
  }
}
