import { useQuery } from '@tanstack/react-query'

export interface LocationOption {
  id: number
  code: string
  name: string
}

export interface LocationSelection {
  regionId: number | null
  provinceId: number | null
  cityMunicipalityId: number | null
  barangayId: number | null
}

export function useLocations<T>(path: string | null) {
  return useQuery({
    queryKey: ['locations', path],
    enabled: path !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    queryFn: async ({ signal }): Promise<T> => {
      const response = await fetch(`/api/v1/locations/${path}`, {
        signal,
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Location choices could not be loaded. Please retry.')
      const payload = await response.json() as { data: T }
      return payload.data
    },
  })
}
