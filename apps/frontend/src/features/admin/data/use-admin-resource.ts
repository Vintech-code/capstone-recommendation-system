import { useCallback, useEffect, useState } from 'react'

import { requestAdmin } from '@/features/admin/data/admin-service'
import {
  getCachedAdminResource,
  hasCachedAdminResource,
  setCachedAdminResource,
} from '@/features/admin/data/admin-resource-cache'

function useAdminResource<T>(path: string) {
  const [prevPath, setPrevPath] = useState(path)
  const [data, setData] = useState<T | null>(() => getCachedAdminResource<T>(path) ?? null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(() => !hasCachedAdminResource(path))
  const [requestVersion, setRequestVersion] = useState(0)

  if (prevPath !== path) {
    setPrevPath(path)
    const cached = getCachedAdminResource<T>(path)
    setData(cached ?? null)
    setLoading(!cached)
    setError(null)
  }

  const retry = useCallback(() => {
    setLoading(!hasCachedAdminResource(path))
    setError(null)
    setRequestVersion((version) => version + 1)
  }, [path])

  useEffect(() => {
    const controller = new AbortController()
    requestAdmin<T>(path, controller.signal)
      .then((payload) => {
        setCachedAdminResource(path, payload)
        setData(payload)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'The administration workspace could not be loaded.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [path, requestVersion])

  return { data, error, loading, retry }
}

export { useAdminResource }
