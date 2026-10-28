import { useQuery } from '@tanstack/react-query'

import { apiDataRequest } from '@/services/api-client'

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
    queryFn: ({ signal }): Promise<T> => apiDataRequest(
      `/api/v1/locations/${path}`,
      { signal },
      { fallbackMessage: 'Location choices could not be loaded. Please retry.' },
    ),
  })
}
