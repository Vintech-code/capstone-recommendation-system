interface StudentResourceEntry<T> {
  expiresAt: number
  promise: Promise<T>
}

const resources = new Map<string, StudentResourceEntry<unknown>>()
const syncValues = new Map<string, { expiresAt: number; value: unknown }>()

function getSyncStudentResource<T>(key: string): T | undefined {
  const current = syncValues.get(key)
  if (current && current.expiresAt > Date.now()) return current.value as T
  return undefined
}

function getCachedStudentResource<T>(key: string, loader: () => Promise<T>, ttlMs = 30_000): Promise<T> {
  const current = resources.get(key) as StudentResourceEntry<T> | undefined
  if (current && current.expiresAt > Date.now()) return current.promise

  const promise = loader()
    .then((val) => {
      syncValues.set(key, { expiresAt: Date.now() + ttlMs, value: val })
      return val
    })
    .catch((error: unknown) => {
      resources.delete(key)
      syncValues.delete(key)
      throw error
    })
  resources.set(key, { expiresAt: Date.now() + ttlMs, promise })
  return promise
}

function setCachedStudentResource<T>(key: string, value: T, ttlMs = 30_000) {
  resources.set(key, { expiresAt: Date.now() + ttlMs, promise: Promise.resolve(value) })
  syncValues.set(key, { expiresAt: Date.now() + ttlMs, value })
}

function invalidateStudentResources(...keys: string[]) {
  keys.forEach((key) => {
    resources.delete(key)
    syncValues.delete(key)
  })
}

function clearStudentResourceCache() {
  resources.clear()
  syncValues.clear()
}

export {
  clearStudentResourceCache,
  getCachedStudentResource,
  getSyncStudentResource,
  invalidateStudentResources,
  setCachedStudentResource,
}
