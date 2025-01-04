interface CachedUrl {
  url: string
  expiresAt: number
}

class UrlService {
  private urlCache: Map<string, CachedUrl> = new Map()
  private refreshThreshold = 5 * 60 * 1000 // 5 minutes before expiry
  
  setUrl(key: string, url: string, expiresIn: number = 3600) {
    const expiresAt = Date.now() + (expiresIn * 1000)
    this.urlCache.set(key, { url, expiresAt })
  }

  async getUrl(key: string, refreshCallback: () => Promise<string>): Promise<string> {
    const cached = this.urlCache.get(key)
    
    if (!cached) {
      const newUrl = await refreshCallback()
      this.setUrl(key, newUrl)
      return newUrl
    }

    // Check if URL needs refresh (within 5 minutes of expiry)
    if (cached.expiresAt - Date.now() < this.refreshThreshold) {
      try {
        const newUrl = await refreshCallback()
        this.setUrl(key, newUrl)
        return newUrl
      } catch (error) {
        console.warn('Failed to refresh URL, using cached version:', error)
        return cached.url
      }
    }

    return cached.url
  }

  clearUrl(key: string) {
    this.urlCache.delete(key)
  }
}

export const urlService = new UrlService() 