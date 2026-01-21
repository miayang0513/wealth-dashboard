/**
 * 防重複請求工具
 * 用於防止相同請求在短時間內重複發送
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map()

  /**
   * 執行請求，如果已有相同的請求正在進行，則返回同一個 Promise
   * @param key 請求的唯一標識符
   * @param requestFn 實際的請求函數
   * @returns Promise
   */
  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // 如果已有相同的請求正在進行，返回同一個 Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }

    // 創建新的請求 Promise
    const requestPromise = (async () => {
      try {
        return await requestFn()
      } finally {
        // 請求完成後，從 pending 中移除
        this.pendingRequests.delete(key)
      }
    })()

    // 將 Promise 存入 Map
    this.pendingRequests.set(key, requestPromise)

    return requestPromise
  }

  /**
   * 清除指定 key 的請求（用於取消或重置）
   */
  clear(key: string): void {
    this.pendingRequests.delete(key)
  }

  /**
   * 清除所有 pending 的請求
   */
  clearAll(): void {
    this.pendingRequests.clear()
  }

  /**
   * 檢查是否有指定 key 的請求正在進行
   */
  hasPending(key: string): boolean {
    return this.pendingRequests.has(key)
  }

  /**
   * 獲取指定 key 的 pending Promise（如果存在）
   */
  getPending<T>(key: string): Promise<T | null> | null {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T | null>
    }
    return null
  }
}

// 導出單例實例
export const requestDeduplicator = new RequestDeduplicator()

/**
 * 創建一個帶有防重複機制的函數
 * @param fn 原始函數
 * @param keyGenerator 生成唯一 key 的函數（可選，預設使用函數名）
 * @returns 包裝後的函數
 */
export function withDeduplication<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const defaultKey = fn.name || 'anonymous'
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : defaultKey
    return requestDeduplicator.execute(key, () => fn(...args))
  }) as T
}

