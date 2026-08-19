interface StudentResourceEntry<T> {
  expiresAt: number
  promise: Promise<T>
}

const resources = new Map<string, StudentResourceEntry<unknown>>()

function getCachedStudentResource<T>(key: string, loader: () => Promise<T>, ttlMs = 30_000): Promise<T> {
  const current = resources.get(key) as StudentResourceEntry<T> | undefined
  if (current && current.expiresAt > Date.now()) return current.promise

  const promise = loader().catch((error: unknown) => {
    resources.delete(key)
    throw error
  })
  resources.set(key, { expiresAt: Date.now() + ttlMs, promise })
  return promise
}

function setCachedStudentResource<T>(key: string, value: T, ttlMs = 30_000) {
  resources.set(key, { expiresAt: Date.now() + ttlMs, promise: Promise.resolve(value) })
}

function invalidateStudentResources(...keys: string[]) {
  keys.forEach((key) => resources.delete(key))
}

function clearStudentResourceCache() {
  resources.clear()
}

export {
  clearStudentResourceCache,
  getCachedStudentResource,
  invalidateStudentResources,
  setCachedStudentResource,
}
