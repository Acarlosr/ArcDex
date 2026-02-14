/**
 * Cache em memória com TTL (em segundos).
 * Limpeza automática de entradas expiradas.
 */

const DEFAULT_TTL = 300 // 5 minutos

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>()
  private ttlSeconds: number
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(ttlSeconds: number = DEFAULT_TTL) {
    this.ttlSeconds = ttlSeconds
    this.startCleanup()
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? this.ttlSeconds) * 1000
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  has(key: string): boolean {
    const v = this.get(key)
    return v !== null
  }

  clear(): void {
    this.store.clear()
  }

  private startCleanup(): void {
    if (typeof setInterval === 'undefined') return
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [k, entry] of this.store.entries()) {
        if (now >= entry.expiresAt) this.store.delete(k)
      }
    }, 60_000)
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

export const aiCache = new SimpleCache(
  typeof process !== 'undefined' && process.env.CACHE_TTL_SECONDS
    ? parseInt(process.env.CACHE_TTL_SECONDS, 10)
    : DEFAULT_TTL
)

/**
 * Gera chave de cache a partir de prefixo e parâmetros.
 */
export function generateCacheKey(prefix: string, ...params: unknown[]): string {
  const parts = params.map((p) =>
    typeof p === 'object' && p !== null ? JSON.stringify(p) : String(p ?? '')
  )
  return `ai:${prefix}:${parts.join(':')}`
}
