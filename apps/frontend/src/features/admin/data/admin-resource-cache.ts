const adminResourceCache = new Map<string, unknown>()

function getCachedAdminResource<T>(path: string) {
  return adminResourceCache.get(path) as T | undefined
}

function hasCachedAdminResource(path: string) {
  return adminResourceCache.has(path)
}

function setCachedAdminResource<T>(path: string, value: T) {
  adminResourceCache.set(path, value)
}

function invalidateAdminResource(pathPrefix?: string) {
  if (!pathPrefix) {
    adminResourceCache.clear()
    return
  }
  for (const key of adminResourceCache.keys()) {
    if (key.startsWith(pathPrefix)) adminResourceCache.delete(key)
  }
}

export {
  getCachedAdminResource,
  hasCachedAdminResource,
  invalidateAdminResource,
  setCachedAdminResource,
}
